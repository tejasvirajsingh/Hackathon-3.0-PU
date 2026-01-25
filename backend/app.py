import io
import os
import torch
import torch.nn as nn
from torchvision import models, transforms
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import uvicorn
import google.generativeai as genai
import json

# Try to load from .env file if available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # python-dotenv not installed, skip

# ======================
# App
# ======================
app = FastAPI(title="LeafLife.ai API", version="1.0")

# ======================
# CORS Configuration (IMPORTANT!)
# ======================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# ======================
# Paths (Absolute & Safe)
# ======================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "model", "leaf_model.pth")
TRAIN_DIR = os.path.join(BASE_DIR, "..", "dataset", "train")

# ======================
# Load Class Names (robust)
# ======================
# Try to read classes from TRAIN_DIR (if present), otherwise will try to infer from model file.
CLASS_NAMES = []
if os.path.exists(TRAIN_DIR):
    CLASS_NAMES = sorted([
        d for d in os.listdir(TRAIN_DIR)
        if os.path.isdir(os.path.join(TRAIN_DIR, d))
    ])

# ======================
# Helper to infer classes from saved model
# ======================
def infer_classes_from_state(state):
    # Accept either raw state_dict or a dict containing 'state_dict' key
    sd = state.get("state_dict", state) if isinstance(state, dict) else state
    # common mobilenet_v2 classifier key
    candidates = ["classifier.1.weight", "classifier.0.weight", "fc.weight"]
    for k in candidates:
        if k in sd:
            out_features = sd[k].shape[0]
            return [f"class_{i}" for i in range(out_features)]
    return None

# ======================
# Load Model (create after knowing num classes)
# ======================
if not os.path.exists(MODEL_PATH):
    raise RuntimeError(f"Model file not found: {MODEL_PATH}")

# Load file to possibly extract classes or state dict
loaded = torch.load(MODEL_PATH, map_location=DEVICE)

# If saved as a dict with 'classes' or 'class_names', prefer that
if isinstance(loaded, dict):
    saved_classes = loaded.get("classes") or loaded.get("class_names")
    if saved_classes:
        CLASS_NAMES = list(saved_classes)
    # try to infer if still empty
    if not CLASS_NAMES:
        inferred = infer_classes_from_state(loaded)
        if inferred:
            CLASS_NAMES = inferred
else:
    # loaded is a raw state_dict -> try to infer
    inferred = infer_classes_from_state(loaded)
    if inferred:
        CLASS_NAMES = inferred

if not CLASS_NAMES:
    # final fallback: if none available, raise clear error
    raise RuntimeError(
        "Unable to determine class names. Provide TRAIN_DIR with subfolders or save 'classes' inside the model file."
    )

NUM_CLASSES = len(CLASS_NAMES)

print("Loaded classes:", NUM_CLASSES)
print(CLASS_NAMES)

# ======================
# Transforms (Same as Training)
# ======================
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    )
])

# Build model now that NUM_CLASSES is known
model = models.mobilenet_v2(weights=None)
# replace classifier output layer
if isinstance(model.classifier, nn.Sequential) and len(model.classifier) > 1:
    in_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(in_features, NUM_CLASSES)
else:
    # fallback for other model shapes
    last_layer = getattr(model, "classifier", None) or getattr(model, "fc", None)
    try:
        in_features = last_layer.in_features
        if hasattr(model, "classifier"):
            model.classifier = nn.Linear(in_features, NUM_CLASSES)
        else:
            model.fc = nn.Linear(in_features, NUM_CLASSES)
    except Exception:
        raise RuntimeError("Unexpected model architecture; cannot replace final layer automatically.")

# Load state dict (handle both raw state_dict and wrapped dict)
if isinstance(loaded, dict) and "state_dict" in loaded:
    state_dict = loaded["state_dict"]
else:
    state_dict = loaded

# If state_dict was saved with module prefixes from DataParallel, strip them
new_state = {}
for k, v in state_dict.items():
    new_key = k.replace("module.", "") if k.startswith("module.") else k
    new_state[new_key] = v

model.load_state_dict(new_state, strict=False)
model = model.to(DEVICE)
model.eval()

print("Model loaded on:", DEVICE)

# ======================
# Gemini API Configuration
# ======================
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
gemini_model = None
if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        
        # List available models and find a suitable one
        try:
            available_models = genai.list_models()
            model_names_list = [m.name for m in available_models if 'generateContent' in m.supported_generation_methods]
            print(f"Available Gemini models: {model_names_list}")
            
            # Try to find a suitable model (prefer pro models, then flash)
            preferred_models = [
                'models/gemini-1.5-pro',
                'models/gemini-1.5-flash',
                'models/gemini-pro',
                'models/gemini-1.0-pro',
                'models/gemini-1.0-pro-latest'
            ]
            
            # Find first available model from preferred list
            selected_model = None
            for pref_model in preferred_models:
                # Check if model name (with or without 'models/' prefix) is available
                if pref_model in model_names_list or pref_model.replace('models/', '') in model_names_list:
                    selected_model = pref_model
                    break
            
            # If no preferred model found, use first available model
            if not selected_model and model_names_list:
                selected_model = model_names_list[0]
            
            if selected_model:
                # Remove 'models/' prefix if present (GenerativeModel doesn't need it)
                model_name = selected_model.replace('models/', '')
                try:
                    gemini_model = genai.GenerativeModel(model_name)
                    print(f"Gemini API configured with {model_name}")
                except Exception as model_err:
                    # Try with full model path
                    try:
                        gemini_model = genai.GenerativeModel(selected_model)
                        print(f"Gemini API configured with {selected_model}")
                    except Exception:
                        # Try just the base name without any prefix
                        base_name = model_name.split('/')[-1] if '/' in model_name else model_name
                        try:
                            gemini_model = genai.GenerativeModel(base_name)
                            print(f"Gemini API configured with {base_name}")
                        except Exception:
                            raise model_err
            else:
                print("Warning: No suitable Gemini model found")
        except Exception as list_error:
            print(f"Could not list models, trying defaults: {list_error}")
            # Fallback: try common model names directly (without 'models/' prefix)
            # Start with simpler names first
            model_names = ['gemini-pro', 'gemini-1.0-pro', 'gemini-1.0-pro-latest', 'gemini-1.5-flash']
            for model_name in model_names:
                try:
                    gemini_model = genai.GenerativeModel(model_name)
                    print(f"Gemini API configured with {model_name}")
                    break
                except Exception as e:
                    print(f"Failed to initialize {model_name}: {e}")
                    continue
        
        if gemini_model is None:
            print("Warning: Could not initialize any Gemini model")
    except Exception as e:
        print(f"Error configuring Gemini API: {e}")
        import traceback
        traceback.print_exc()
        gemini_model = None
else:
    print("Warning: GEMINI_API_KEY not found. Disease information feature will be disabled.")

# ======================
# Helper Functions
# ======================
def get_disease_info_from_gemini(disease_class: str) -> dict:
    """Get disease information from Gemini API"""
    if not gemini_model:
        return {
            "error": "Gemini API key not configured",
            "species": "Unknown",
            "isHealthy": "healthy" in disease_class.lower(),
            "description": "Please configure GEMINI_API_KEY environment variable",
            "prevention": [],
            "causes": "API key not configured"
        }
    
    try:
        # Determine if it's healthy
        is_healthy = "healthy" in disease_class.lower()
        
        # Create a detailed prompt for Gemini
        prompt = f"""You are a plant pathology expert. Provide detailed information about the following plant disease/condition: "{disease_class}"

Please provide a JSON response with the following structure:
{{
    "species": "Plant species name (e.g., Tomato, Apple, Corn, etc.)",
    "isHealthy": {str(is_healthy).lower()},
    "description": "A brief 1-2 sentence description of the disease/condition",
    "prevention": ["Prevention method 1", "Prevention method 2", "Prevention method 3", "Prevention method 4", "Prevention method 5", "Prevention method 6"],
    "causes": "Detailed explanation of what causes this disease/problem, including pathogen names if applicable, environmental conditions, and contributing factors"
}}

CRITICAL INSTRUCTIONS - Write for BEGINNERS:
- Use SIMPLE, everyday words that anyone can understand
- Avoid complex scientific jargon - if you must use scientific terms, explain them in simple language
- Write prevention methods as clear, actionable steps (e.g., "Water your plants in the morning" not "Implement proper irrigation scheduling")
- Explain causes in plain language - imagine explaining to someone who has never gardened before
- Keep sentences short and clear
- Use examples that beginners can relate to

FORMATTING FOR CAUSES:
- Break the causes explanation into clear paragraphs
- Use numbered points (1., 2., 3., etc.) when explaining steps or processes
- Use **bold text** for important terms or section headers within the causes
- Separate different ideas with line breaks (double newlines)
- Make it easy to read and scan

Important:
- If the condition is healthy, provide general care information in simple terms
- If it's a disease, explain what causes it in simple words (e.g., "tiny harmful germs called fungi" instead of just "fungal pathogens")
- Provide 4-6 practical prevention methods written as simple, easy-to-follow steps
- Explain causes in beginner-friendly language - what actually happens and why, in terms anyone can understand
- Format causes with clear paragraphs and numbered points for better readability
- Return ONLY valid JSON, no markdown formatting or code blocks"""

        response = gemini_model.generate_content(prompt)
        
        # Extract JSON from response - handle different response formats
        response_text = ""
        try:
            if hasattr(response, 'text'):
                response_text = response.text.strip()
            elif hasattr(response, 'candidates') and len(response.candidates) > 0:
                if hasattr(response.candidates[0], 'content'):
                    if hasattr(response.candidates[0].content, 'parts') and len(response.candidates[0].content.parts) > 0:
                        response_text = response.candidates[0].content.parts[0].text.strip()
                    elif hasattr(response.candidates[0].content, 'text'):
                        response_text = response.candidates[0].content.text.strip()
            else:
                response_text = str(response).strip()
        except Exception as e:
            print(f"Error extracting response text: {e}")
            response_text = str(response)
        
        # Remove markdown code blocks if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        # Parse JSON
        disease_info = json.loads(response_text)
        
        return disease_info
        
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        print(f"Response was: {response_text if 'response_text' in locals() else 'N/A'}")
        # Fallback response
        return {
            "species": disease_class.split("___")[0] if "___" in disease_class else "Unknown",
            "isHealthy": is_healthy,
            "description": f"Information about {disease_class}",
            "prevention": ["Consult with a plant pathologist", "Follow general plant care practices", "Monitor plant health regularly"],
            "causes": "Unable to retrieve detailed information at this time"
        }
    except Exception as e:
        error_msg = str(e)
        print(f"Error calling Gemini API: {error_msg}")
        import traceback
        traceback.print_exc()
        
        # Extract plant species from disease class name
        species = "Unknown"
        if "___" in disease_class:
            species = disease_class.split("___")[0]
        elif "_" in disease_class:
            parts = disease_class.split("_")
            if len(parts) > 0:
                species = parts[0]
        
        # Provide helpful error message
        if "404" in error_msg or "not found" in error_msg.lower():
            error_description = f"Unable to retrieve information: The AI model is currently unavailable. Please check your API configuration."
            error_causes = f"Model configuration error: {error_msg}. This may be due to an incorrect model name or API version mismatch."
        else:
            error_description = f"Unable to retrieve detailed information about {disease_class} at this time."
            error_causes = f"Error occurred while fetching information: {error_msg}"
        
        return {
            "error": error_msg,
            "species": species,
            "isHealthy": is_healthy,
            "description": error_description,
            "prevention": ["Please try again later", "Check your API configuration", "Consult with a plant pathologist for detailed information"],
            "causes": error_causes
        }

# ======================
# Routes
# ======================
@app.get("/")
def home():
    return {
        "message": "LeafLife.ai API is running 🌿",
        "device": DEVICE,
        "classes": NUM_CLASSES
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        img = transform(image).unsqueeze(0).to(DEVICE)

        with torch.no_grad():
            outputs = model(img)
            probs = torch.softmax(outputs, dim=1)
            confidence, pred = torch.max(probs, 1)

        disease_class = CLASS_NAMES[pred.item()]
        confidence_value = round(confidence.item(), 4)

        # Get additional disease information from Gemini
        disease_info = get_disease_info_from_gemini(disease_class)

        return {
            "class": disease_class,
            "confidence": confidence_value,
            "species": disease_info.get("species", "Unknown"),
            "isHealthy": disease_info.get("isHealthy", False),
            "description": disease_info.get("description", ""),
            "prevention": disease_info.get("prevention", []),
            "causes": disease_info.get("causes", "")
        }
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        return {
            "error": str(e),
            "class": "Error",
            "confidence": 0.0,
            "species": "Unknown",
            "isHealthy": False,
            "description": f"Error: {str(e)}",
            "prevention": [],
            "causes": ""
        }

@app.get("/disease-info/{disease_class}")
async def get_disease_info(disease_class: str):
    """Get disease information for a specific disease class"""
    try:
        disease_info = get_disease_info_from_gemini(disease_class)
        return disease_info
    except Exception as e:
        return {
            "error": str(e),
            "species": "Unknown",
            "isHealthy": False,
            "description": f"Error: {str(e)}",
            "prevention": [],
            "causes": ""
        }

# ======================
# Run Server
# ======================
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)