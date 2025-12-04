'use client';

import { useEffect, useRef } from 'react';

interface FloatingParticlesProps {
  count?: number;
  speed?: number;
  color?: string;
  className?: string;
}

export function FloatingParticles({
  count = 50,
  speed = 1,
  color = 'var(--theme-primary)',
  className = '',
}: FloatingParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const particles: Array<{
      element: HTMLDivElement;
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
    }> = [];

    // Create particles
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 4 + 2;
      const x = Math.random() * container.offsetWidth;
      const y = Math.random() * container.offsetHeight;

      particle.style.position = 'absolute';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.borderRadius = '50%';
      particle.style.backgroundColor = color;
      particle.style.opacity = `${Math.random() * 0.5 + 0.2}`;
      particle.style.pointerEvents = 'none';
      particle.style.transition = 'opacity 0.3s ease';
      particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;

      container.appendChild(particle);

      particles.push({
        element: particle,
        x,
        y,
        vx: (Math.random() - 0.5) * speed * 0.5,
        vy: (Math.random() - 0.5) * speed * 0.5,
        size,
      });
    }

    let animationFrame: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 16; // Normalize to 60fps
      lastTime = currentTime;

      particles.forEach((particle) => {
        // Update position
        particle.x += particle.vx * deltaTime;
        particle.y += particle.vy * deltaTime;

        // Bounce off walls
        if (particle.x < 0 || particle.x > container.offsetWidth) {
          particle.vx *= -1;
        }
        if (particle.y < 0 || particle.y > container.offsetHeight) {
          particle.vy *= -1;
        }

        // Keep within bounds
        particle.x = Math.max(0, Math.min(container.offsetWidth, particle.x));
        particle.y = Math.max(0, Math.min(container.offsetHeight, particle.y));

        // Apply position
        particle.element.style.left = `${particle.x}px`;
        particle.element.style.top = `${particle.y}px`;

        // Add subtle pulsing
        const pulse = Math.sin(currentTime / 1000 + particle.x) * 0.3 + 0.7;
        particle.element.style.opacity = `${(Math.random() * 0.5 + 0.2) * pulse}`;
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    // Handle resize
    const handleResize = () => {
      particles.forEach((particle) => {
        particle.x = Math.min(particle.x, container.offsetWidth);
        particle.y = Math.min(particle.y, container.offsetHeight);
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrame);
      particles.forEach((particle) => {
        particle.element.remove();
      });
    };
  }, [count, speed, color]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}

