export default function Team()
{
  const members = [
    { name: "Tejasvi Raj Singh", role: "Frontend Developer", img: "/img/tejasvi.jpg", link: "https://tejasvimax.vercel.app/" },
    { name: "Satyam Raj ", role: "AI / ML Engineer", img: "/img/satyam.jpg", link: "https://satyam-r4j.vercel.app/" },
    { name: "Vishal Kumar", role: "Product & Research Lead", img: "/img/vishal.jpg" },
    { name: "Nikhil Kumar", role: "Backend Developer", img: "/img/nikhil.jpg" },
  ];


  return (
    <section id="team" className="max-w-5xl mx-auto mt-24 text-center">
      <h2 className="text-2xl font-bold text-leaf mb-10">
        Meet My Team Members 👨‍🚀
      </h2>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {members.map((m, i) => (
          <a key={i} href={m.link || "#"} target="_blank">
            <div className="bg-gradient-to-br from-[#0f3d2e] to-[#1e6f5c] p-6 rounded-xl shadow-lg hover:-translate-y-2 hover:scale-105 transition">
              <img
                src={m.img}
                alt={m.name}
                className="w-20 h-20 rounded-full mx-auto border-4 border-leaf mb-4 object-cover"
              />
              <h3 className="text-leaf font-bold">{m.name}</h3>
              <span className="text-sm opacity-80">{m.role}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}