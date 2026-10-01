'use client';

import { motion } from 'framer-motion';

export function WavesBackground({
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
          background: `linear-gradient(to bottom right, ${withOpacity(primaryColor, 0.7)}, ${withOpacity(secondaryColor, 0.75)})`,
        }}
        animate={{
          x: ['0vw', '80vw', '10vw', '50vw', '0vw'],
          y: ['0vh', '40vh', '70vh', '20vh', '0vh'],
        }}
        transition={{
          duration: 25 * baseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full blur-[120px]"
        style={{
          background: `linear-gradient(to bottom right, ${withOpacity(secondaryColor, 0.7)}, ${withOpacity(accentColor, 0.75)})`,
        }}
        animate={{
          x: ['0vw', '-70vw', '-10vw', '-50vw', '0vw'],
          y: ['0vh', '60vh', '90vh', '30vh', '0vh'],
        }}
        transition={{
          duration: 30 * baseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 h-[450px] w-[450px] rounded-full blur-[120px]"
        style={{
          background: `linear-gradient(to bottom right, ${withOpacity(accentColor, 0.8)}, ${withOpacity(primaryColor, 0.85)})`,
        }}
        animate={{
          x: ['0vw', '50vw', '-40vw', '20vw', '0vw'],
          y: ['0vh', '-60vh', '-20vh', '-80vh', '0vh'],
        }}
        transition={{
          duration: 35 * baseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute top-1/2 left-0 h-[400px] w-[400px] rounded-full blur-[120px]"
        style={{
          background: `linear-gradient(to bottom right, ${withOpacity(primaryColor, 0.8)}, ${withOpacity(accentColor, 0.85)})`,
        }}
        animate={{
          x: ['0vw', '90vw', '30vw', '60vw', '0vw'],
          y: ['0vh', '-30vh', '40vh', '-10vh', '0vh'],
        }}
        transition={{
          duration: 28 * baseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </>
  );
}
