'use client';

import { motion } from 'framer-motion';

export function GradientBackground({
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
      <motion.div
        className="absolute top-0 left-0 h-[600px] w-[600px] rounded-full blur-[120px]"
        style={{
          background: `linear-gradient(to bottom right, ${withOpacity(primaryColor, 0.8)}, ${withOpacity(secondaryColor, 0.85)})`,
        }}
        animate={{
          x: ['0vw', '75vw', '25vw', '0vw'],
          y: ['0vh', '65vh', '85vh', '0vh'],
          scale: [1, 1.3, 0.9, 1],
        }}
        transition={{
          duration: 20 * baseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute right-0 bottom-0 h-80 w-80 rounded-full blur-3xl"
        style={{
          background: `linear-gradient(to bottom right, ${withOpacity(secondaryColor, 0.8)}, ${withOpacity(accentColor, 0.85)})`,
        }}
        animate={{
          x: ['0vw', '-65vw', '-15vw', '0vw'],
          y: ['0vh', '-70vh', '-40vh', '0vh'],
          scale: [1, 1.4, 0.8, 1],
        }}
        transition={{
          duration: 25 * baseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 h-[400px] w-[400px] rounded-full blur-[120px]"
        style={{
          background: `linear-gradient(to bottom right, ${withOpacity(accentColor, 0.75)}, ${withOpacity(primaryColor, 0.8)})`,
        }}
        animate={{
          x: ['0vw', '50vw', '-40vw', '20vw', '0vw'],
          y: ['0vh', '-50vh', '60vh', '-30vh', '0vh'],
          scale: [1, 1.5, 0.7, 1.2, 1],
        }}
        transition={{
          duration: 30 * baseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </>
  );
}
