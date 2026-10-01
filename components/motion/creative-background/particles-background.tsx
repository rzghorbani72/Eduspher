'use client';

import { motion } from 'framer-motion';

export function ParticlesBackground({
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
      {[...Array(6)].map((_, i) => {
        const startX = (i * 15) % 100;
        const startY = (i * 20) % 100;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full blur-[100px]"
            style={{
              width: `${120 + i * 30}px`,
              height: `${120 + i * 30}px`,
              background: `linear-gradient(to bottom right, ${withOpacity(i % 2 === 0 ? primaryColor : secondaryColor, 0.75)}, ${withOpacity(i % 3 === 0 ? accentColor : primaryColor, 0.8)})`,
              top: `${startY}%`,
              left: `${startX}%`,
            }}
            animate={{
              x: [
                '0vw',
                `${(i % 2 === 0 ? 1 : -1) * (60 + i * 15)}vw`,
                `${(i % 2 === 0 ? -1 : 1) * (40 + i * 10)}vw`,
                '0vw',
              ],
              y: [
                '0vh',
                `${(i % 3 === 0 ? 1 : -1) * (50 + i * 12)}vh`,
                `${(i % 3 === 0 ? -1 : 1) * (30 + i * 8)}vh`,
                '0vh',
              ],
              scale: [1, 1.3, 0.8, 1],
            }}
            transition={{
              duration: (15 + i * 3) * baseDuration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.8,
            }}
          />
        );
      })}
    </>
  );
}
