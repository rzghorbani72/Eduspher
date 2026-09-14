'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * `enabled` exists because this provider kills every ScrollTrigger on the page
 * on each navigation. The platform landing owns its own GSAP scenes
 * (`panel/landing/landing-motion.tsx`), so running both would tear those down.
 */
export function ScrollAnimationProvider({
  children,
  enabled = true,
}: {
  children: React.ReactNode;
  enabled?: boolean;
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined' || !enabled) return;

    let cleanup: (() => void) | null = null;

    const initGSAP = async () => {
      try {
        const [GSAP, ST] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);

        const gsapInstance = GSAP.gsap;
        const ScrollTriggerInstance = ST.ScrollTrigger;

        gsapInstance.registerPlugin(ScrollTriggerInstance);

        // Kill previous page's ScrollTrigger instances before re-init
        ScrollTriggerInstance.getAll().forEach((trigger: { kill: () => void }) => trigger.kill());

        const initScrollAnimations = () => {
          const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
          ).matches;
          const animatedElements = document.querySelectorAll('[data-scroll-animate]');
          const viewportHeight = window.innerHeight;

          animatedElements.forEach((element) => {
            const animationType = element.getAttribute('data-scroll-animate') || 'fadeIn';
            const delay = parseFloat(element.getAttribute('data-scroll-delay') || '0');
            const duration = parseFloat(element.getAttribute('data-scroll-duration') || '0.8');

            if (prefersReducedMotion) return;

            // Never hide above-fold content — protects LCP elements
            const rect = element.getBoundingClientRect();
            const isAboveFold = rect.top < viewportHeight * 0.9;
            if (!isAboveFold) {
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
                case 'fadeInUp':
                  gsapInstance.set(element, { opacity: 0, y: 50 });
                  break;
                default:
                  gsapInstance.set(element, { opacity: 0, y: 30 });
              }
            }

            gsapInstance.to(element, {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
              duration,
              delay,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: element,
                start: 'top 85%',
                toggleActions: 'play none none none',
                refreshPriority: -1,
              },
            });
          });
        };

        const timeoutId = setTimeout(initScrollAnimations, 100);

        const handleResize = () => {
          ScrollTriggerInstance.refresh();
        };
        window.addEventListener('resize', handleResize);

        cleanup = () => {
          clearTimeout(timeoutId);
          window.removeEventListener('resize', handleResize);
          ScrollTriggerInstance.getAll().forEach((trigger: { kill: () => void }) => trigger.kill());
        };
      } catch (error) {
        console.warn('GSAP ScrollTrigger failed to load:', error);
      }
    };

    initGSAP();

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [pathname, enabled]);

  return <>{children}</>;
}
