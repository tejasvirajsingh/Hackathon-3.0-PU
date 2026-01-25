export default function Team() {
  const members = [
    {
      name: "Tejasvi Raj Singh",
      role: "Frontend Developer",
      college: "Parul University",
      batch: "2027",
      img: "/img/tejasvi.jpg",
      link: "https://tejasvimax.vercel.app/",
    },
    {
      name: "Satyam Raj",
      role: "AI / ML Engineer",
      college: "Parul University",
      batch: "2027",
      img: "/img/satyam.jpg",
      link: "https://satyam-r4j.vercel.app/",
    },
    {
      name: "Vishal Kumar",
      role: "Product & Research Lead",
      college: "Parul University",
      batch: "2027",
      img: "/img/vishal.jpg",
    },
    {
      name: "Nikhil Kumar",
      role: "Backend Developer",
      college: "Parul University",
      batch: "2027",
      img: "/img/nikhil.jpg",
    },
  ];

  return (
    <section
      id="team"
      className="max-w-6xl mx-auto mt-24 px-4 text-center"
    >
      {/* Section Title */}
      <h2 className="text-3xl font-bold text-white mb-12">
        Meet My Team Members 👨‍🚀
      </h2>

      {/* Team Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {members.map((m, i) => (
          <a
            key={i}
            href={m.link || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="bg-gradient-to-br from-[#0f3d2e] to-[#1e6f5c] p-6 rounded-2xl shadow-xl hover:-translate-y-3 hover:scale-105 transition-all duration-300">
              
              {/* Profile Image */}
              <img
                src={m.img}
                alt={m.name}
                className="w-24 h-24 rounded-full mx-auto border-4 border-green-400 mb-4 object-cover"
              />

              {/* Name */}
              <h3 className="text-green-100 font-bold text-lg">
                {m.name}
              </h3>

              {/* Role */}
              <p className="text-sm text-green-200 opacity-90">
                {m.role}
              </p>

              {/* College */}
              <p className="text-xs text-green-200 font-bold mt-2">
                🎓 {m.college}
              </p>

              {/* Batch */}
              <p className="text-xs text-white ">
                Batch: {m.batch}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
