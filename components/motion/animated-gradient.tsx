'use client';

import { useEffect, useRef } from 'react';

interface AnimatedGradientProps {
  colors?: string[];
  speed?: number;
  className?: string;
  direction?: 'horizontal' | 'vertical' | 'diagonal' | 'radial';
}

export function AnimatedGradient({
  colors = ['var(--theme-primary)', 'var(--theme-secondary)', 'var(--theme-accent)'],
  speed = 1,
  className = '',
  direction = 'diagonal',
}: AnimatedGradientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let angle = 0;

    const animate = () => {
      angle += speed * 0.5;
      
      let gradient = '';
      
      switch (direction) {
        case 'horizontal':
          gradient = `linear-gradient(90deg, ${colors[0]}, ${colors[1]}, ${colors[2] || colors[0]}, ${colors[0]})`;
          break;
        case 'vertical':
          gradient = `linear-gradient(180deg, ${colors[0]}, ${colors[1]}, ${colors[2] || colors[0]}, ${colors[0]})`;
          break;
        case 'radial':
          gradient = `radial-gradient(circle at ${50 + Math.sin(angle * Math.PI / 180) * 20}% ${50 + Math.cos(angle * Math.PI / 180) * 20}%, ${colors[0]}, ${colors[1]}, ${colors[2] || colors[0]})`;
          break;
        case 'diagonal':
        default:
          gradient = `linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]}, ${colors[2] || colors[0]}, ${colors[0]})`;
          break;
      }

      container.style.background = gradient;
      container.style.backgroundSize = '200% 200%';
      container.style.backgroundPosition = `${Math.sin(angle * Math.PI / 180) * 50 + 50}% ${Math.cos(angle * Math.PI / 180) * 50 + 50}%`;

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [colors, speed, direction]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 -z-10 ${className}`}
      style={{ opacity: 0.1 }}
    />
  );
}

