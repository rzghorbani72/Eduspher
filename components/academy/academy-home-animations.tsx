'use client';

import { useEffect } from 'react';

export function AcademyHomeAnimations() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let ctx: { revert: () => void } | null = null;

    const init = async () => {
      try {
        const { gsap } = await import('gsap');
        const { ScrollTrigger } = await import('gsap/ScrollTrigger');
        gsap.registerPlugin(ScrollTrigger);

        ctx = gsap.context(() => {
          // Hero entrance — staggered timeline
          const tl = gsap.timeline({ delay: 0.05 });
          tl.fromTo('#hero-badge',
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }
          )
          .fromTo('#hero-title',
            { opacity: 0, y: 56 },
            { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' },
            '-=0.3'
          )
          .fromTo('#hero-description',
            { opacity: 0, y: 36 },
            { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
            '-=0.5'
          )
          .fromTo('#hero-ctas',
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' },
            '-=0.45'
          )
          .fromTo('#hero-scroll-hint',
            { opacity: 0 },
            { opacity: 0.45, duration: 0.6, ease: 'power2.out' },
            '-=0.2'
          );

          // Stats band
          const statsBand = document.querySelector('#stats-band');
          if (statsBand) {
            gsap.fromTo(statsBand,
              { opacity: 0, y: 40 },
              {
                opacity: 1, y: 0, duration: 0.85, ease: 'power3.out',
                scrollTrigger: { trigger: statsBand, start: 'top 88%', toggleActions: 'play none none none' },
              }
            );
            const statItems = statsBand.querySelectorAll('[data-stat]');
            if (statItems.length) {
              gsap.fromTo(statItems,
                { opacity: 0, y: 20 },
                {
                  opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
                  scrollTrigger: { trigger: statsBand, start: 'top 85%', toggleActions: 'play none none none' },
                }
              );
            }
          }

          // Fade-up: section headers, CTA block
          document.querySelectorAll('[data-gsap="fade-up"]').forEach((el) => {
            gsap.fromTo(el,
              { opacity: 0, y: 64 },
              {
                opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 87%', toggleActions: 'play none none none' },
              }
            );
          });

          // Stagger children: grids of cards/categories/articles
          document.querySelectorAll('[data-gsap="stagger"]').forEach((parent) => {
            const children = Array.from(parent.children);
            if (!children.length) return;
            gsap.fromTo(children,
              { opacity: 0, y: 52 },
              {
                opacity: 1, y: 0, duration: 0.72, stagger: 0.09, ease: 'power3.out',
                scrollTrigger: { trigger: parent, start: 'top 84%', toggleActions: 'play none none none' },
              }
            );
          });

          // Slide-left / slide-right for feature rows
          document.querySelectorAll('[data-gsap="slide-left"]').forEach((el) => {
            gsap.fromTo(el,
              { opacity: 0, x: -70 },
              {
                opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 87%', toggleActions: 'play none none none' },
              }
            );
          });

          document.querySelectorAll('[data-gsap="slide-right"]').forEach((el) => {
            gsap.fromTo(el,
              { opacity: 0, x: 70 },
              {
                opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 87%', toggleActions: 'play none none none' },
              }
            );
          });

          // Scale-in for CTA section
          document.querySelectorAll('[data-gsap="scale-in"]').forEach((el) => {
            gsap.fromTo(el,
              { opacity: 0, scale: 0.94 },
              {
                opacity: 1, scale: 1, duration: 0.85, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
              }
            );
          });
        });
      } catch {
        // GSAP load failure is non-fatal
      }
    };

    init();

    return () => {
      ctx?.revert();
    };
  }, []);

  return null;
}
