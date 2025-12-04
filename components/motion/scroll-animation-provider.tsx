'use client';

import { useEffect } from 'react';

/**
 * Global scroll animation provider
 * Initializes GSAP ScrollTrigger and sets up global scroll animations
 * This only runs on the client side and doesn't affect SSR/SEO
 * 
 * SEO/SSR Notes:
 * - All animations use data attributes that are rendered in SSR HTML
 * - GSAP only loads and runs on the client side
 * - Initial states are set via GSAP, but content is fully visible in SSR HTML
 * - Search engines see the full content without any animation interference
 */
export function ScrollAnimationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dynamically import GSAP only on client side to avoid SSR issues
    let cleanup: (() => void) | null = null;

    const initGSAP = async () => {
      try {
        const [GSAP, ST] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger'),
        ]);
        
        const gsapInstance = GSAP.gsap;
        const ScrollTriggerInstance = ST.ScrollTrigger;
        
        gsapInstance.registerPlugin(ScrollTriggerInstance);

        // Initialize scroll animations for elements with data attributes
        const initScrollAnimations = () => {
          // Animate elements with data-scroll-animate attribute
          const animatedElements = document.querySelectorAll('[data-scroll-animate]');
          
          animatedElements.forEach((element) => {
            const animationType = element.getAttribute('data-scroll-animate') || 'fadeIn';
            const delay = parseFloat(element.getAttribute('data-scroll-delay') || '0');
            const duration = parseFloat(element.getAttribute('data-scroll-duration') || '0.8');
            
            // Set initial state (only affects visual presentation, not HTML content)
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

            // Animate on scroll
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
                // Refresh on resize to maintain performance
                refreshPriority: -1,
              },
            });
          });
        };

        // Initialize after a short delay to ensure DOM is ready
        const timeoutId = setTimeout(initScrollAnimations, 100);

        // Refresh ScrollTrigger on resize
        const handleResize = () => {
          ScrollTriggerInstance.refresh();
        };
        window.addEventListener('resize', handleResize);

        cleanup = () => {
          clearTimeout(timeoutId);
          window.removeEventListener('resize', handleResize);
          // Cleanup ScrollTrigger instances
          ScrollTriggerInstance.getAll().forEach((trigger: any) => trigger.kill());
        };
      } catch (error) {
        // Silently fail if GSAP fails to load (shouldn't break the app)
        console.warn('GSAP ScrollTrigger failed to load:', error);
      }
    };

    initGSAP();
    
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  // Render children immediately - no conditional rendering that affects SSR
  return <>{children}</>;
}
