
export default function About() {
  return (
  <section id="about" className="max-w-3xl mx-auto mt-24 p-10 bg-white/10 rounded-3xl">
  <div className="flex flex-col md:flex-row gap-10 items-center">
  <div>
  <h2 className="text-2xl font-bold text-leaf mb-4">
  About LeafLife.ai 🌿
  </h2>
  <p className="leading-relaxed">
  LeafLife.ai is an AI-powered smart agriculture platform designed to
  detect plant diseases by scanning leaf images. Our system uses
  advanced computer vision and deep learning to analyze patterns,
  texture, and color changes on leaves.
  </p>
  </div>
  
  
  <img
  src="/img/crop.png"
  className="w-64 rounded-2xl shadow-lg"
  alt="Crop illustration"
  />
  </div>
  </section>
  );
  }
