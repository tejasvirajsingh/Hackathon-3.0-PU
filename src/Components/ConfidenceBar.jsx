import { motion } from "framer-motion";


export default function ConfidenceBar({ value })
{
    const percent = Math.round(value * 100);


    return (
        <div className="w-full max-w-sm mx-auto mt-4">
            <div className="flex justify-between mb-1 text-sm">
                <span>Confidence</span>
                <span>{percent}%</span>
            </div>


            <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}