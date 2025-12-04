'use client';

import { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
  type: 'none' | 'gradient' | 'particles' | 'waves' | 'mesh' | 'grid';
  speed: 'slow' | 'medium' | 'fast';
  primaryColor?: string;
  secondaryColor?: string;
  className?: string;
}

const speedMap = {
  slow: 20,
  medium: 10,
  fast: 5,
};

export function AnimatedBackground({
  type,
  speed,
  primaryColor = '#3b82f6',
  secondaryColor = '#6366f1',
  className = '',
}: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (type === 'none' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let time = 0;
    const speedValue = speedMap[speed];

    const animate = () => {
      time += 0.01;
      
      switch (type) {
        case 'gradient':
          drawGradient(ctx, canvas, time, primaryColor, secondaryColor, speedValue);
          break;
        case 'particles':
          drawParticles(ctx, canvas, time, primaryColor, secondaryColor, speedValue);
          break;
        case 'waves':
          drawWaves(ctx, canvas, time, primaryColor, secondaryColor, speedValue);
          break;
        case 'mesh':
          drawMesh(ctx, canvas, time, primaryColor, secondaryColor, speedValue);
          break;
        case 'grid':
          drawGrid(ctx, canvas, time, primaryColor, secondaryColor, speedValue);
          break;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [type, speed, primaryColor, secondaryColor]);

  if (type === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 -z-10 ${className}`}
      style={{ opacity: 0.3 }}
    />
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [59, 130, 246];
}

function drawGradient(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  time: number,
  primary: string,
  secondary: string,
  speed: number
) {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  const [r1, g1, b1] = hexToRgb(primary);
  const [r2, g2, b2] = hexToRgb(secondary);

  const offset1 = (Math.sin(time * speed) + 1) / 2;
  const offset2 = (Math.cos(time * speed) + 1) / 2;

  gradient.addColorStop(0, `rgba(${r1}, ${g1}, ${b1}, ${0.1 + offset1 * 0.1})`);
  gradient.addColorStop(0.5, `rgba(${r2}, ${g2}, ${b2}, ${0.1 + offset2 * 0.1})`);
  gradient.addColorStop(1, `rgba(${r1}, ${g1}, ${b1}, ${0.1 + offset1 * 0.1})`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  time: number,
  primary: string,
  secondary: string,
  speed: number
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const [r1, g1, b1] = hexToRgb(primary);
  const [r2, g2, b2] = hexToRgb(secondary);

  const particleCount = 50;
  for (let i = 0; i < particleCount; i++) {
    const x = (canvas.width / particleCount) * i + Math.sin(time * speed + i) * 50;
    const y = canvas.height / 2 + Math.cos(time * speed + i) * 100;
    const size = 2 + Math.sin(time * speed + i) * 2;
    const color = i % 2 === 0 
      ? `rgba(${r1}, ${g1}, ${b1}, ${0.3 + Math.sin(time + i) * 0.2})`
      : `rgba(${r2}, ${g2}, ${b2}, ${0.3 + Math.cos(time + i) * 0.2})`;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

function drawWaves(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  time: number,
  primary: string,
  secondary: string,
  speed: number
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const [r1, g1, b1] = hexToRgb(primary);
  const [r2, g2, b2] = hexToRgb(secondary);

  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);

    for (let x = 0; x < canvas.width; x += 5) {
      const y =
        canvas.height / 2 +
        Math.sin((x / 100) + time * speed + i * 2) * (30 + i * 20);
      ctx.lineTo(x, y);
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();

    const color = i % 2 === 0 
      ? `rgba(${r1}, ${g1}, ${b1}, ${0.1 - i * 0.02})`
      : `rgba(${r2}, ${g2}, ${b2}, ${0.1 - i * 0.02})`;
    ctx.fillStyle = color;
    ctx.fill();
  }
}

function drawMesh(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  time: number,
  primary: string,
  secondary: string,
  speed: number
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const [r1, g1, b1] = hexToRgb(primary);
  const [r2, g2, b2] = hexToRgb(secondary);

  const gridSize = 50;
  for (let x = 0; x < canvas.width; x += gridSize) {
    for (let y = 0; y < canvas.height; y += gridSize) {
      const noise = Math.sin((x + y) / 50 + time * speed) * 0.5 + 0.5;
      const color = noise > 0.5
        ? `rgba(${r1}, ${g1}, ${b1}, ${noise * 0.1})`
        : `rgba(${r2}, ${g2}, ${b2}, ${(1 - noise) * 0.1})`;

      ctx.fillStyle = color;
      ctx.fillRect(x, y, gridSize, gridSize);
    }
  }
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  time: number,
  primary: string,
  secondary: string,
  speed: number
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const [r1, g1, b1] = hexToRgb(primary);
  const [r2, g2, b2] = hexToRgb(secondary);

  const gridSize = 40;
  const offset = (time * speed * 10) % gridSize;

  ctx.strokeStyle = `rgba(${r1}, ${g1}, ${b1}, 0.1)`;
  ctx.lineWidth = 1;

  for (let x = -offset; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = -offset; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

