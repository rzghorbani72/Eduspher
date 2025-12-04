'use client';

import { useEffect, useRef, useState } from 'react';

interface FlyingIcon {
  id: string;
  src: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  opacity: number;
}

interface FlyingIconsProps {
  icons: string[]; // Array of icon/image URLs
  count?: number; // Number of icons to display
  speed?: number; // Movement speed multiplier
  size?: number; // Base size in pixels
  className?: string;
}

export function FlyingIcons({
  icons,
  count = 5,
  speed = 1,
  size = 40,
  className = '',
}: FlyingIconsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [flyingIcons, setFlyingIcons] = useState<FlyingIcon[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!containerRef.current || icons.length === 0) return;

    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    // Initialize flying icons
    const initialIcons: FlyingIcon[] = [];
    const iconsToUse = icons.slice(0, Math.min(count, icons.length));

    for (let i = 0; i < count; i++) {
      const iconSrc = iconsToUse[i % iconsToUse.length];
      initialIcons.push({
        id: `icon-${i}`,
        src: iconSrc,
        x: Math.random() * containerWidth,
        y: Math.random() * containerHeight,
        vx: (Math.random() - 0.5) * speed * 0.5,
        vy: (Math.random() - 0.5) * speed * 0.5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2,
        scale: 0.5 + Math.random() * 0.5,
        opacity: 0.2 + Math.random() * 0.3,
      });
    }

    setFlyingIcons(initialIcons);

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 16; // Normalize to 60fps
      lastTime = currentTime;

      setFlyingIcons((prevIcons) => {
        return prevIcons.map((icon) => {
          let newX = icon.x + icon.vx * deltaTime;
          let newY = icon.y + icon.vy * deltaTime;
          let newRotation = icon.rotation + icon.rotationSpeed * deltaTime;

          // Bounce off walls
          if (newX < 0 || newX > containerWidth) {
            icon.vx *= -1;
            newX = Math.max(0, Math.min(containerWidth, newX));
          }
          if (newY < 0 || newY > containerHeight) {
            icon.vy *= -1;
            newY = Math.max(0, Math.min(containerHeight, newY));
          }

          // Add some floating motion
          const floatX = Math.sin(currentTime / 2000 + icon.id.charCodeAt(0)) * 2;
          const floatY = Math.cos(currentTime / 2000 + icon.id.charCodeAt(0)) * 2;

          return {
            ...icon,
            x: newX + floatX,
            y: newY + floatY,
            rotation: newRotation,
            // Pulsing opacity
            opacity: icon.opacity + Math.sin(currentTime / 1000 + icon.id.charCodeAt(0)) * 0.1,
          };
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    // Handle resize
    const handleResize = () => {
      setFlyingIcons((prevIcons) =>
        prevIcons.map((icon) => ({
          ...icon,
          x: Math.min(icon.x, container.offsetWidth),
          y: Math.min(icon.y, container.offsetHeight),
        }))
      );
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [icons, count, speed]);

  if (icons.length === 0 || flyingIcons.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 -z-10 pointer-events-none overflow-hidden ${className}`}
    >
      {flyingIcons.map((icon) => (
        <img
          key={icon.id}
          src={icon.src}
          alt=""
          className="absolute transition-opacity duration-300"
          style={{
            left: `${icon.x}px`,
            top: `${icon.y}px`,
            width: `${size * icon.scale}px`,
            height: `${size * icon.scale}px`,
            transform: `translate(-50%, -50%) rotate(${icon.rotation}deg)`,
            opacity: Math.max(0.1, Math.min(0.5, icon.opacity)),
            filter: 'blur(0.5px)',
          }}
          onError={(e) => {
            // Hide broken images
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ))}
    </div>
  );
}

