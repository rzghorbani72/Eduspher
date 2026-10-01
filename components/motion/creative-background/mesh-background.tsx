'use client';

import { motion } from 'framer-motion';

export function MeshBackground({
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
          x: ['0vw', '70vw', '30vw', '0vw'],
          y: ['0vh', '60vh', '80vh', '0vh'],
        }}
        transition={{
          duration: 22 * baseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full blur-[120px]"
        style={{
          background: `linear-gradient(to bottom right, ${withOpacity(secondaryColor, 0.8)}, ${withOpacity(accentColor, 0.85)})`,
        }}
        animate={{
          x: ['0vw', '-60vw', '-20vw', '0vw'],
          y: ['0vh', '70vh', '50vh', '0vh'],
        }}
        transition={{
          duration: 28 * baseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 h-[450px] w-[450px] rounded-full blur-[120px]"
        style={{
          background: `linear-gradient(to bottom right, ${withOpacity(accentColor, 0.75)}, ${withOpacity(primaryColor, 0.8)})`,
        }}
        animate={{
          x: ['0vw', '50vw', '10vw', '0vw'],
          y: ['0vh', '-70vh', '-40vh', '0vh'],
        }}
        transition={{
          duration: 26 * baseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full blur-[120px]"
        style={{
          background: `linear-gradient(to bottom right, ${withOpacity(primaryColor, 0.75)}, ${withOpacity(secondaryColor, 0.8)})`,
        }}
        animate={{
          x: ['0vw', '-50vw', '-10vw', '0vw'],
          y: ['0vh', '-60vh', '-30vh', '0vh'],
        }}
        transition={{
          duration: 24 * baseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </>
  );
}
