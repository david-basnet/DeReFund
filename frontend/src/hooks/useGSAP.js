import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const useGSAP = (animationFn, dependencies = []) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      animationFn(containerRef.current);
    }, containerRef.current);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars?.trigger === containerRef.current) {
          trigger.kill();
        }
      });
    };
  }, dependencies);

  return containerRef;
};

export const useScrollAnimation = (ref, options = {}) => {
  useEffect(() => {
    if (!ref.current) return;

    const {
      start = 'top 80%',
      end = 'bottom 20%',
      animation = 'fadeIn',
    } = options;

    let animationInstance;

    switch (animation) {
      case 'fadeIn':
        animationInstance = gsap.fromTo(ref.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: ref.current,
              start: start,
              end: end,
              toggleActions: 'play none none reverse',
            },
          }
        );
        break;
      case 'slideUp':
        animationInstance = gsap.fromTo(ref.current,
          { opacity: 0, y: 100 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: ref.current,
              start: start,
              toggleActions: 'play none none reverse',
            },
          }
        );
        break;
      case 'scaleIn':
        animationInstance = gsap.fromTo(ref.current,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: ref.current,
              start: start,
              toggleActions: 'play none none reverse',
            },
          }
        );
        break;
      default:
        break;
    }

    return () => {
      if (animationInstance?.scrollTrigger) {
        animationInstance.scrollTrigger.kill();
      }
    };
  }, [ref, options]);
};

