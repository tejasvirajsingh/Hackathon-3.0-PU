import { useState } from "react";
import FloatingLeaves from "./Components/FloatingLeafs";
import Navbar from "./Components/Navbar";
import Hero from "./Components/Hero";
import Stats from "./Components/Stats";
import About from "./Components/About";
import Team from "./Components/Team";
import Footer from "./Components/Footer";






export default function App()
{
    const [active, setActive] = useState(null);


    return (
        <>
            <FloatingLeaves/>
            <Navbar />
            <Hero/>
            <Stats onOpen={setActive} />


            {active === "ai" && (
                <section className="max-w-lg mx-auto mt-20 p-8 bg-white/10 rounded-2xl text-center">
                    <h2 className="text-2xl font-bold text-leaf mb-4">How AI Works 🤖</h2>
                    <p className="mb-4">
                        Our AI model analyzes leaf color, texture, and patterns to detect crop
                        diseases in real time.
                    </p>
                    <img src="/img/about.webp" alt="AI technology illustration" className="rounded-xl shadow-lg" />
                </section>
            )}


            <About/>
            <Team/>
            <Footer/>
        </>
    );
}