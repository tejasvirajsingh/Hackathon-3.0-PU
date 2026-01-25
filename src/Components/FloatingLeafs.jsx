import { motion } from "framer-motion";
import { useState } from "react";

const leaves = ["🍃", "🌿", "🍀", "🌱", "🍂", , "🌾","☘️"];

// Control how dense it is
const LEAF_COUNT = 55;

function generateLeafConfigs() {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const height = typeof window !== 'undefined' ? window.innerHeight : 1080;
  
  return Array.from({ length: LEAF_COUNT }).map(() => {
    const startX = Math.random() * width;
    const endX = startX + (Math.random() - 0.5) * 200; 
    const startY = height + Math.random() * 200;
    const duration = 12 + Math.random() * 10;
    const delay = Math.random() * 5;
    const initialRotate = Math.random() * 360;
    const rotateAmount = 360 + (Math.random() - 0.5) * 180;
    
    return {
      startX,
      endX,
      startY,
      duration,
      delay,
      initialRotate,
      rotateAmount,
      fontSize: 32 + Math.random() * 24,
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
              willChange: 'transform',
            }}
            initial={{
              x: config.startX,
              y: config.startY,
              rotate: config.initialRotate,
            }}
            animate={{
              y: -150,
              x: config.endX,
              rotate: config.initialRotate + config.rotateAmount,
            }}
            transition={{
              duration: config.duration,
              repeat: Infinity,
              delay: config.delay,
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