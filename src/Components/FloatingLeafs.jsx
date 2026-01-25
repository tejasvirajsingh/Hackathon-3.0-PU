import { motion } from "framer-motion";
import { useState } from "react";

const leaves = ["🍃", "🌿", "🍀", "🌱", "🍂", "🌾", "☘️"];

// Control how many leaves
const LEAF_COUNT = 25;

function generateLeafConfigs() {
  const width = typeof window !== "undefined" ? window.innerWidth : 1920;
  const height = typeof window !== "undefined" ? window.innerHeight : 1080;

  return Array.from({ length: LEAF_COUNT }).map(() => {
    const startX = Math.random() * width;
    const endX = startX + (Math.random() - 0.5) * 200;

    return {
      startX,
      endX,
      startY: -150,            // START FROM TOP
      endY: height + 200,      // GO TO BOTTOM
      duration: 4 + Math.random() * 3,
      delay: Math.random() * 5,
      initialRotate: Math.random() * 360,
      rotateAmount: 360 + (Math.random() - 0.5) * 180,
      fontSize: 15 + Math.random() * 24,
    };
  });
}

export default function FloatingLeaves() {
  const [leafConfigs] = useState(() => generateLeafConfigs());

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {leafConfigs.map((config, i) => {
        const leaf = leaves[i % leaves.length];

        return (
          <motion.div
            key={i}
            className="absolute opacity-30"
            style={{
              fontSize: `${config.fontSize}px`,
              willChange: "transform",
            }}
            initial={{
              x: config.startX,
              y: config.startY,
              rotate: config.initialRotate,
            }}
            animate={{
              x: config.endX,
              y: config.endY,
              rotate: config.initialRotate + config.rotateAmount,
            }}
            transition={{
              duration: config.duration,
              delay: config.delay,
              repeat: Infinity,
              ease: [0.5, 0, 0.5, 1],
              repeatType: "loop",
            }}
          >
            {leaf}
          </motion.div>
        );
      })}
    </div>
  );
}
