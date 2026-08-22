"use client";

import { useEffect, useRef } from "react";

/** Dots per square pixel of sphere radius. Sets how dense the globe reads. */
const DOT_DENSITY = 0.024;
/** Never generate more than this, no matter how large the globe grows. */
const MAX_DOTS = 4200;
const DOT_RADIUS = 1.5;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
/** Axial tilt, so it reads as a globe instead of a flat ring of dots. */
const TILT = 0.36;
/** Seconds per full turn. It is a backdrop, not the subject. */
const TURN_SECONDS = 44;
/** Radius as a share of the box half-size, at scroll progress 0 → 1. */
const RADIUS_FROM = 0.62;
const RADIUS_TO = 0.95;
/** Front-to-back fade, quantised into this many batched fills. */
const DEPTH_STEPS = 6;
const DEPTH_MIN_ALPHA = 0.18;

type Point = { x: number; y: number; z: number };

/**
 * Van der Corput sequence — a progressive stand-in for the `i / count` term of
 * a Fibonacci sphere. This is the whole trick: because it never references the
 * total, the first N points of the list are already evenly spread over the
 * sphere for ANY N. Growing the globe can therefore APPEND dots at constant
 * size instead of scaling the existing ones up.
 */
function radicalInverse(index: number): number {
  let bits = index;
  let result = 0;
  let denominator = 1;
  while (bits > 0) {
    denominator *= 2;
    result += (bits % 2) / denominator;
    bits = Math.floor(bits / 2);
  }
  return result;
}

function buildSphere(count: number): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < count; i += 1) {
    const y = 2 * radicalInverse(i + 1) - 1;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const angle = i * GOLDEN_ANGLE;
    points.push({ x: Math.cos(angle) * ring, y, z: Math.sin(angle) * ring });
  }
  return points;
}

type Props = {
  className?: string;
  /** Element that emits `lp:hero-globe` scroll progress — see landing-motion. */
  progressSource?: string;
};

/**
 * Dotted globe behind the hero shot. Drawn on canvas rather than played from a
 * Lottie file so scroll can grow the sphere by REVEALING MORE DOTS at a fixed
 * dot size — scaling a baked animation would just magnify the dots.
 *
 * Under `prefers-reduced-motion` it paints one frame and never animates.
 */
export function HeroGlobe({
  className,
  progressSource = '[data-lp="hero-earth"]',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const points = buildSphere(MAX_DOTS);
    let color = getComputedStyle(canvas).color;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let progress = 0;
    let frame = 0;

    const draw = (time: number) => {
      if (width === 0 || height === 0) return;

      const spin = reduced ? 0 : (time / (TURN_SECONDS * 1000)) * Math.PI * 2;
      const cosSpin = Math.cos(spin);
      const sinSpin = Math.sin(spin);
      const cosTilt = Math.cos(TILT);
      const sinTilt = Math.sin(TILT);

      const radius =
        (Math.min(width, height) / 2) *
        (RADIUS_FROM + (RADIUS_TO - RADIUS_FROM) * progress);
      const visible = Math.min(
        MAX_DOTS,
        Math.round(DOT_DENSITY * radius * radius),
      );
      const centerX = width / 2;
      const centerY = height / 2;

      context.clearRect(0, 0, width, height);
      context.fillStyle = color;

      // One path per depth band: 4000 individual fills would cost more than the
      // globe is worth, and the eye cannot read more than a few fade steps.
      for (let step = 0; step < DEPTH_STEPS; step += 1) {
        const low = -1 + (2 * step) / DEPTH_STEPS;
        const high = -1 + (2 * (step + 1)) / DEPTH_STEPS;
        context.globalAlpha =
          DEPTH_MIN_ALPHA +
          (1 - DEPTH_MIN_ALPHA) * ((step + 0.5) / DEPTH_STEPS);
        context.beginPath();

        for (let i = 0; i < visible; i += 1) {
          const point = points[i];
          const spunX = point.x * cosSpin + point.z * sinSpin;
          const spunZ = point.z * cosSpin - point.x * sinSpin;
          const depth = point.y * sinTilt + spunZ * cosTilt;
          if (depth < low || depth >= high) continue;

          const screenY = point.y * cosTilt - spunZ * sinTilt;
          const x = centerX + spunX * radius;
          const y = centerY + screenY * radius;
          context.moveTo(x + DOT_RADIUS, y);
          context.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
        }

        context.fill();
      }

      context.globalAlpha = 1;
    };

    const loop = (time: number) => {
      draw(time);
      frame = requestAnimationFrame(loop);
    };

    const resize = () => {
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      const box = canvas.getBoundingClientRect();
      width = box.width;
      height = box.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw(performance.now());
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    // The dot colour is a theme token read once into canvas state, so the
    // landing's light/dark toggle has to push it back in.
    const root = canvas.closest(".lp-root");
    const themeObserver = new MutationObserver(() => {
      color = getComputedStyle(canvas).color;
    });
    if (root) {
      themeObserver.observe(root, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
    }

    const source = canvas.closest(progressSource);
    const onProgress = (event: Event) => {
      progress = Math.min(1, Math.max(0, (event as CustomEvent<number>).detail));
      if (reduced) draw(performance.now());
    };
    source?.addEventListener("lp:hero-globe", onProgress);

    if (!reduced) frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      themeObserver.disconnect();
      source?.removeEventListener("lp:hero-globe", onProgress);
    };
  }, [progressSource]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`lp-globe block ${className ?? ""}`}
    />
  );
}
