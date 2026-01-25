export default function Stats({ onOpen }) {
  return (
    <section id="features" className="max-w-6xl mx-auto mt-20 px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          className="bg-white/10 backdrop-blur-md p-6 rounded-2xl text-center shadow-lg hover:scale-110 hover:shadow-green-500/30 transition-all duration-300 border border-green-500/20"
        >
          <div className="text-4xl mb-3">🌱</div>
          <h3 className="text-lg font-bold text-leaf">30+ Crop Diseases</h3>
        </div>
        <div
          className="bg-white/10 backdrop-blur-md p-6 rounded-2xl text-center shadow-lg hover:scale-110 hover:shadow-green-500/30 transition-all duration-300 cursor-pointer border border-green-500/20"
          onClick={() => onOpen("ai")}
        >
          <div className="text-4xl mb-3">🤖</div>
          <h3 className="text-lg font-bold text-leaf">AI-Based Detection</h3>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl text-center shadow-lg hover:scale-110 hover:shadow-green-500/30 transition-all duration-300 border border-green-500/20">
          <div className="text-4xl mb-3">📱</div>
          <h3 className="text-lg font-bold text-leaf">Mobile Friendly</h3>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl text-center shadow-lg hover:scale-110 hover:shadow-green-500/30 transition-all duration-300 border border-green-500/20">
          <div className="text-4xl mb-3">⚡</div>
          <h3 className="text-lg font-bold text-leaf">Instant Results</h3>
        </div>
      </div>
    </section>
  );
}