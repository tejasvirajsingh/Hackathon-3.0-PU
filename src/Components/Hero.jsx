import { useState, useRef, useEffect } from "react";
import ConfidenceBar from "./ConfidenceBar";

const API_URL = "http://localhost:8000/predict";

export default function Hero() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  };

  const startCamera = async () => {
    try {
      // Try back camera first (mobile), fallback to any available camera
      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
      } catch {
        // Fallback to any available camera (for desktop)
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
      }
      setStream(mediaStream);
      setShowCamera(true);
      setShowUpload(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Please check permissions or use upload instead.");
      setError("Camera access denied. Please allow camera permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error("Video or canvas ref not available");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Check if video is ready
    if (video.readyState < 2) {
      console.error("Video not ready");
      alert("Camera is not ready yet. Please wait a moment.");
      return;
    }

    // Get video dimensions
    const videoWidth = video.videoWidth || video.clientWidth;
    const videoHeight = video.videoHeight || video.clientHeight;

    if (videoWidth === 0 || videoHeight === 0) {
      console.error("Invalid video dimensions");
      alert("Unable to capture. Please try again.");
      return;
    }

    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    // Draw video frame to canvas (accounting for mirror effect)
    context.save();
    context.scale(-1, 1);
    context.drawImage(video, -videoWidth, 0, videoWidth, videoHeight);
    context.restore();

    // Convert canvas to blob and create file
    canvas.toBlob((blob) => {
      if (blob) {
        const capturedFile = new File([blob], 'captured-leaf.jpg', { type: 'image/jpeg' });
        setFile(capturedFile);
        setPreview(URL.createObjectURL(blob));
        setResult(null);
        setError(null);
        stopCamera(); // Stop camera after capture
      } else {
        console.error("Failed to create blob from canvas");
        alert("Failed to capture image. Please try again.");
      }
    }, 'image/jpeg', 0.9);
  };

  // Set up video element when stream is available
  useEffect(() => {
    const video = videoRef.current;
    if (stream && video) {
      video.srcObject = stream;
      video.play().catch(err => {
        console.error("Error playing video:", err);
      });
    }
    return () => {
      if (video) {
        video.srcObject = null;
      }
    };
  }, [stream]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const analyze = async () => {
    if (!file) {
      alert("Upload a leaf image first!");
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }
      
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("API Error:", err);
      setError("API not running. Make sure backend server is started on port 8000.");
      alert("API not running. Please start the backend server first.");
    }

    setLoading(false);
  };

  return (
    <section id="home" className="min-h-[85vh] flex justify-center items-center">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-[40px] max-w-3xl text-center shadow-2xl">
        <h1 className="text-4xl font-bold mb-6">AI-Powered Leaf Health Diagnosis</h1>

        <div className="flex justify-center my-6">
          <img
            src="/img/scan2.jpg"
            alt="Leaf scanning illustration"
            className="w-72 rounded-xl shadow-lg"
          />
        </div>

        <p className="mb-6 text-green-100 animate-pulse">
          Detect plant diseases instantly using AI
        </p>

        <div className="flex justify-center gap-6">
          <button
            className="px-8 py-3 rounded-full bg-black text-green-100 hover:scale-110 transition cursor-pointer"
            onClick={startCamera}
          >
            Scan ⧉
          </button>

          <button
            className="px-8 py-3 rounded-full bg-black text-green-100 hover:scale-110 transition cursor-pointer"
            onClick={() => {
              setShowUpload(true);
              stopCamera();
            }}
          >
            Upload{" "}
            <img
              src="/img/upload.png"
              alt="Upload icon"
              className="w-5 inline-block rounded-xl shadow-lg"
            />
          </button>
        </div>

        {showUpload && (
          <div className="mt-10 pt-8 border-t border-white/10">
            <h2 className="text-2xl font-bold text-leaf mb-6">
              {showCamera ? "Scan Leaf with Camera 📷" : "Upload Diseased Leaf 🍃"}
            </h2>

            {showCamera ? (
              <div className="space-y-4">
                <div className="relative flex justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="max-w-full h-auto max-h-96 rounded-xl shadow-lg border-4 border-green-500/30"
                    style={{ transform: 'scaleX(-1)' }} // Mirror the video for better UX
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        videoRef.current.play().catch(err => {
                          console.error("Error playing video:", err);
                        });
                      }
                    }}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={captureImage}
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 text-[#064635] font-bold hover:scale-110 transition shadow-lg shadow-green-500/30"
                  >
                    📸 Capture Photo
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-8 py-3 rounded-full bg-red-500/80 text-white font-bold hover:scale-110 transition shadow-lg shadow-red-500/30"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            ) : (
              <label className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 text-[#064635] font-bold cursor-pointer shadow-lg shadow-green-500/30 hover:scale-110 hover:shadow-emerald-400/50 transition-all duration-300">
                <img
                  src="/img/upload2.png"
                  alt="Upload icon"
                  className="w-5 inline-block rounded-xl shadow-lg"
                /> Choose Leaf Image
                <input type="file" hidden accept="image/*" onChange={handleFile} />
              </label>
            )}

            {!showCamera && preview && (
              <div className="mt-8 flex justify-center">
                <img
                  src={preview}
                  className="max-w-full h-auto max-h-96 rounded-xl shadow-lg border-4 border-green-500/30"
                  alt="Leaf preview"
                />
              </div>
            )}

            {!showCamera && file && (
              <button
                onClick={analyze}
                disabled={loading}
                className="mt-6 px-8 py-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 text-[#064635] font-bold hover:scale-110 transition shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "⏳ Analyzing..." : "🔍 Analyze Leaf"}
              </button>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-300">{error}</p>
              </div>
            )}

            {result && (
              <div className="mt-8 p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-green-500/20">
                <h3 className="text-xl font-bold text-black text-leaf mb-4">🍃Analysis Result</h3>
                <div className="space-y-4">
                  {/* Species */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-md text-black font-bold opacity-80 mb-1">Plant Species</p>
                    <p className="text-xl font-bold text-emerald-400">
                      {result.species || "Unknown"}
                    </p>
                  </div>

                  {/* Health Status */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-md text-black font-bold opacity-80 mb-2 text-center">Health Status</p>
                    <div className="flex items-center justify-center gap-3">
                      {result.isHealthy ? (
                        <>
                          <span className="text-3xl">✅</span>
                          <span className="text-xl font-bold text-green-400">Healthy</span>
                        </>
                      ) : (
                        <>
                          <span className="text-3xl">⚠️</span>
                          <span className="text-xl font-bold text-red-400">Diseased / Unhealthy</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Detected Disease/Condition */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-md text-black font-bold opacity-80 mb-1">Detected Condition</p>
                    <p className="text-2xl font-bold text-green-300">
                      {result.class || "Unknown"}
                    </p>
                  </div>

                  {/* Confidence Level */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-md text-black font-bold opacity-80 mb-2">Confidence Level</p>
                    <ConfidenceBar value={result.confidence || 0} />
                  </div>

                  {/* Description */}
                  {result.description && (
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-md text-black font-bold opacity-80 mb-2">Description</p>
                      <p className="text-green-100 leading-relaxed">
                        {result.description}
                      </p>
                    </div>
                  )}

                  {/* Prevention Methods */}
                  {result.prevention && result.prevention.length > 0 && (
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-md text-black font-bold opacity-80 mb-3">Prevention Methods</p>
                      <ul className="space-y-2 text-left">
                        {result.prevention.map((method, index) => (
                          <li key={index} className="flex items-start gap-2 text-green-100">
                            <span className="text-green-400 mt-1">•</span>
                            <span className="leading-relaxed">{method}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Causes */}
                  {result.causes && (
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-md text-black font-bold opacity-80 mb-3">Causes & Why It Happens</p>
                      <div className="text-green-100 leading-relaxed text-left max-h-96 overflow-y-auto">
                        {result.causes.split(/(?=\d+\.\s)/).map((section, idx) => {
                          const trimmed = section.trim();
                          if (!trimmed) return null;
                          
                          // Handle numbered list items
                          const numMatch = trimmed.match(/^(\d+)\.\s*(.+)$/s);
                          if (numMatch) {
                            const [, num, text] = numMatch;
                            // Check for bold markers **text**:
                            const boldMatch = text.match(/^\*\*(.+?)\*\*:\s*(.+)$/s);
                            if (boldMatch) {
                              const [, boldText, rest] = boldMatch;
                              return (
                                <div key={idx} className="mb-3">
                                  <span className="font-semibold text-green-300">{num}.</span>{' '}
                                  <span className="font-semibold text-green-200">{boldText}:</span>{' '}
                                  <span>{rest.trim()}</span>
                                </div>
                              );
                            }
                            return (
                              <div key={idx} className="mb-3">
                                <span className="font-semibold text-green-300">{num}.</span>{' '}
                                <span>{text.trim()}</span>
                              </div>
                            );
                          }
                          
                          // Regular paragraphs
                          return trimmed.split('\n\n').map((para, paraIdx) => 
                            para.trim() && (
                              <p key={`${idx}-${paraIdx}`} className="mb-3 text-justify">
                                {para.trim()}
                              </p>
                            )
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Error message if any */}
                  {result.error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                      <p className="text-red-300 text-sm">
                        Note: {result.error}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}  