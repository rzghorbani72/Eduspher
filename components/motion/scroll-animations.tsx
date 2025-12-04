'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollAnimationsProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Client-side component that adds scroll-based animations using GSAP
 * This component only runs on the client side and doesn't affect SSR/SEO
 */
export function ScrollAnimations({ children, className = '' }: ScrollAnimationsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    // Dynamically import GSAP only on client side
    const initGSAP = async () => {
      const GSAP = await import('gsap');
      const ST = await import('gsap/ScrollTrigger');
      const gsapInstance = GSAP.gsap;
      const ScrollTriggerInstance = ST.ScrollTrigger;
      
      gsapInstance.registerPlugin(ScrollTriggerInstance);

      const elements = containerRef.current?.querySelectorAll('[data-scroll-animate]');
      if (!elements) return;
      
      elements.forEach((element) => {
        const animationType = element.getAttribute('data-scroll-animate') || 'fadeIn';
        const delay = parseFloat(element.getAttribute('data-scroll-delay') || '0');
        
        // Set initial state based on animation type
        switch (animationType) {
          case 'fadeIn':
            gsapInstance.set(element, { opacity: 0, y: 30 });
            break;
          case 'slideLeft':
            gsapInstance.set(element, { opacity: 0, x: -50 });
            break;
          case 'slideRight':
            gsapInstance.set(element, { opacity: 0, x: 50 });
            break;
          case 'scaleUp':
            gsapInstance.set(element, { opacity: 0, scale: 0.8 });
            break;
          default:
            gsapInstance.set(element, { opacity: 0, y: 30 });
        }

        // Animate on scroll
        gsapInstance.to(element, {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.8,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
      });

      return () => {
        // Cleanup ScrollTrigger instances
        ScrollTriggerInstance.getAll().forEach((trigger: any) => trigger.kill());
      };
    };

    const cleanup = initGSAP();
    
    return () => {
      if (cleanup) {
        cleanup.then((cleanupFn) => cleanupFn && cleanupFn());
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

/**
 * HOC to wrap components with scroll animation attributes
 * These attributes are only used by the ScrollAnimations component on the client
 */
export function withScrollAnimation(
  Component: React.ComponentType<any>,
  animationType: 'fadeIn' | 'slideLeft' | 'slideRight' | 'scaleUp' = 'fadeIn',
  delay: number = 0
) {
  return function ScrollAnimatedComponent(props: any) {
    return (
      <div data-scroll-animate={animationType} data-scroll-delay={delay.toString()}>
        <Component {...props} />
      </div>
    );
  };
}

