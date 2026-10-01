'use client';

import { motion } from 'framer-motion';

export function BlobsBackground({
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
        key={`blob-1-${primaryColor}-${secondaryColor}`}
        className="absolute top-0 left-0 h-[600px] w-[600px] rounded-full blur-[120px]"
        style={{
          background: `linear-gradient(to bottom right, ${withOpacity(primaryColor, 0.8)}, ${withOpacity(secondaryColor, 0.85)})`,
        }}
        animate={{
          x: ['0vw', '70vw', '20vw', '0vw'],
          y: ['0vh', '60vh', '30vh', '0vh'],
          background: [
            `linear-gradient(to bottom right, ${withOpacity(primaryColor, 0.8)}, ${withOpacity(secondaryColor, 0.85)})`,
            `linear-gradient(to bottom right, ${withOpacity(secondaryColor, 0.8)}, ${withOpacity(primaryColor, 0.85)})`,
            `linear-gradient(to bottom right, ${withOpacity(primaryColor, 0.8)}, ${withOpacity(secondaryColor, 0.85)})`,
          ],
        }}
        transition={{
          duration: 20 * baseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        key={`blob-2-${accentColor}-${primaryColor}`}
        className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full blur-[120px]"
        style={{
          background: `linear-gradient(to bottom right, ${withOpacity(accentColor, 0.8)}, ${withOpacity(primaryColor, 0.85)})`,
        }}
        animate={{
          x: ['0vw', '-60vw', '-20vw', '0vw'],
          y: ['0vh', '50vh', '80vh', '0vh'],
          background: [
            `linear-gradient(to bottom right, ${withOpacity(accentColor, 0.8)}, ${withOpacity(primaryColor, 0.85)})`,
            `linear-gradient(to bottom right, ${withOpacity(primaryColor, 0.8)}, ${withOpacity(accentColor, 0.85)})`,
            `linear-gradient(to bottom right, ${withOpacity(accentColor, 0.8)}, ${withOpacity(primaryColor, 0.85)})`,
          ],
        }}
        transition={{
          duration: 25 * baseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        key={`blob-3-${secondaryColor}-${accentColor}`}
        className="absolute bottom-0 left-1/2 h-[450px] w-[450px] rounded-full blur-[120px]"
        style={{
          background: `linear-gradient(to bottom right, ${withOpacity(secondaryColor, 0.75)}, ${withOpacity(accentColor, 0.8)})`,
        }}
        animate={{
          x: ['0vw', '40vw', '-30vw', '0vw'],
          y: ['0vh', '-70vh', '-40vh', '0vh'],
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
