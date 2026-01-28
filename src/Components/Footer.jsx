export default function Footer()
{
  return (
    <footer className="mt-24 bg-gradient-to-b from-[#0b3a2a] to-[#06261c] py-16">
      <div className="max-w-6xl mx-auto px-10 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h2 className="text-leaf font-bold text-xl">🍃 LeafLife.ai</h2>
          <p className="text-sm opacity-80">Smart Agriculture with AI</p>
        </div>


        <div>
          <h4 className="text-leaf mb-2">PRODUCT</h4>
          <ul className="text-sm opacity-80 space-y-2">
            <li>Leaf Disease Detection</li>
            <li>AI-Based Analysis</li>
            <li>Mobile Friendly</li>
          </ul>
        </div>


        <div>
          <h4 className="text-leaf mb-2">TECHNOLOGY</h4>
          <ul className="text-sm opacity-80 space-y-2">
            <li>Machine Learning</li>
            <li>Image Processing</li>
            <li>Smart Agriculture</li>
          </ul>
        </div>


        <div>
          <h4 className="text-leaf mb-2">TEAM</h4>
          <ul className="text-sm opacity-80 space-y-2">
            <li>Interstellar's Team</li>
            <li>Frontend & Backend</li>
            <li>AI/ML Engineers</li>
            
          </ul>
        </div>
      </div>


      <div className="text-center mt-10 text-sm opacity-70 border-t border-green-500/20 pt-4">
        © 2026 LeafLife.ai • Made by <strong>Interstellar's Team</strong>
      </div>
    </footer>
  );
}