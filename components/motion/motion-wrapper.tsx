'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';

interface MotionWrapperProps {
  children: ReactNode;
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale' | 'rotate';
  delay?: number;
  duration?: number;
  className?: string;
  trigger?: 'on-mount' | 'on-scroll';
}

export function MotionWrapper({
  children,
  animation = 'fade',
  delay = 0,
  duration = 500,
  className = '',
  trigger = 'on-mount',
}: MotionWrapperProps) {
  const [isVisible, setIsVisible] = useState(trigger === 'on-mount');
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (trigger === 'on-mount') {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    }

    if (trigger === 'on-scroll' && elementRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setTimeout(() => setIsVisible(true), delay);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(elementRef.current);

      return () => {
        if (elementRef.current) {
          observer.unobserve(elementRef.current);
        }
      };
    }
  }, [trigger, delay]);

  const animationClasses = {
    fade: isVisible ? 'opacity-100' : 'opacity-0',
    'slide-up': isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
    'slide-down': isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0',
    'slide-left': isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0',
    'slide-right': isVisible ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0',
    scale: isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
    rotate: isVisible ? 'rotate-0 opacity-100' : 'rotate-3 opacity-0',
  };

  return (
    <div
      ref={elementRef}
      className={`transition-all ${animationClasses[animation]} ${className}`}
      style={{ transitionDuration: `${duration}ms`, transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

