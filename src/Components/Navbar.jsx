export default function Navbar()
{
  return (
    <header className="bg-black flex text-black items-center justify-between z-10 shadow-xl w-[60vw] absolute top-10 right-[20vw] rounded-full py-4 px-8 " >
      <h2 className="text-2xl font-bold text-green-600 text-leaf">🌿 LeafLife.ai</h2>
      <nav className="space-x-4">
        <a
          href="#home"
          className="transform hover:scale-110 hover:bg-linear-to-r hover:from-green-300 hover:to-emerald-500 hover:text-black p-2 px-4 m-1 rounded-2xl bg-linear-to-r from-green-500 to-emerald-600 text-white shadow-md hover:shadow-xl transition-all duration-200"
        >
          Home
        </a>
        <a
          href="#features"
          className="transform hover:scale-110 hover:bg-linear-to-r hover:from-green-300 hover:to-emerald-500 hover:text-black p-2 px-4 m-1 rounded-2xl bg-linear-to-r from-green-500 to-emerald-600 text-white shadow-md hover:shadow-xl transition-all duration-200"
        >
          Features
        </a>
        <a
          href="#about"
          className="transform hover:scale-110 hover:bg-linear-to-r hover:from-green-300 hover:to-emerald-500 hover:text-black p-2 px-4 m-1 rounded-2xl bg-linear-to-r from-green-500 to-emerald-600 text-white shadow-md hover:shadow-xl transition-all duration-200"
        >
          About
        </a>
        <a
          href="#team"
          className="transform hover:scale-110 hover:bg-linear-to-r hover:from-green-300 hover:to-emerald-500 hover:text-black p-2 px-4 m-1 rounded-2xl bg-linear-to-r from-green-500 to-emerald-600 text-white shadow-md hover:shadow-xl transition-all duration-200"
        >
          Team
        </a>
      </nav>
    </header>
  );
}

//className=" sticky top-0 z-50 bg-linear-to-b from-[#0c3b2e] to-[#0f5f3d] backdrop-blur-md px-12 py-4 flex justify-between items-center"