'use client';

import { motion } from 'framer-motion';

export function GridBackground({
  accentColor,
  baseDuration,
  primaryColor,
  secondaryColor,
  withOpacity,
}: {
  accentColor: string;
  baseDuration: number;
  primaryColor: string;
  secondaryColor: string;
  withOpacity: (color: string, opacity: number) => string;
}) {
  return (
    <>
      {[...Array(9)].map((_, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full blur-[100px]"
            style={{
              width: `${150 + (i % 3) * 40}px`,
              height: `${150 + (i % 3) * 40}px`,
              background: `linear-gradient(to bottom right, ${withOpacity(i % 2 === 0 ? primaryColor : secondaryColor, 0.75)}, ${withOpacity(i % 3 === 0 ? accentColor : primaryColor, 0.8)})`,
              top: `${10 + row * 25}%`,
              left: `${10 + col * 25}%`,
            }}
            animate={{
              x: [
                '0vw',
                `${(i % 2 === 0 ? 1 : -1) * (40 + i * 5)}vw`,
                `${(i % 2 === 0 ? -1 : 1) * (20 + i * 3)}vw`,
                '0vw',
              ],
              y: [
                '0vh',
                `${(i % 3 === 0 ? 1 : -1) * (35 + i * 4)}vh`,
                `${(i % 3 === 0 ? -1 : 1) * (25 + i * 3)}vh`,
                '0vh',
              ],
            }}
            transition={{
              duration: (18 + i * 2) * baseDuration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        );
      })}
    </>
  );
}
