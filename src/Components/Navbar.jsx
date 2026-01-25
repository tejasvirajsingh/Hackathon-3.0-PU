export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-b from-[#0c3b2e] to-[#0f5f3d] backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto px-12 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <a href="#home" className="flex items-center gap-2">
  <h2 className="text-2xl font-bold text-white hover:text-green-200 transition-colors">
    🍃 <span>LeafLife.ai</span>
  </h2>
</a>

        {/* Nav Links */}
        <nav className="flex  gap-8 font-bold text-green-100 font-medium   ">
          <a
            href="#home"
            className="hover:text-white hover:scale-106 transition-transform duration-300 transition-colors duration-200"
          >
            Home
          </a>
          <a
            href="#features"
            className="hover:text-white transition-colors hover:scale-106 transition-transform duration-300 duration-200"
          >
            Features
          </a>
          <a
            href="#about"
            className="hover:text-white hover:scale-106 transition-transform duration-300 transition-colors duration-200"
          >
            About
          </a>
          <a
            href="#team"
            className="hover:text-white hover:scale-106 transition-transform duration-300 transition-colors duration-200"
          >
            Team
          </a>
        </nav>

      </div>
    </header>
  );
}
