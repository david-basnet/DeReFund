import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Fade in from bottom with stagger
export const fadeInUp = (elements, delay = 0) => {
  gsap.fromTo(elements, 
    {
      opacity: 0,
      y: 60,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.1,
      delay: delay,
    }
  );
};

// Fade in from top
export const fadeInDown = (elements, delay = 0) => {
  gsap.fromTo(elements,
    {
      opacity: 0,
      y: -60,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.1,
      delay: delay,
    }
  );
};

// Scale in animation
export const scaleIn = (elements, delay = 0) => {
  gsap.fromTo(elements,
    {
      opacity: 0,
      scale: 0.8,
    },
    {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: 'back.out(1.7)',
      stagger: 0.1,
      delay: delay,
    }
  );
};

// Text reveal animation
export const textReveal = (element, delay = 0) => {
  const text = element;
  const words = text.textContent.split(' ');
  text.innerHTML = words.map(word => `<span class="word">${word}</span>`).join(' ');
  
  gsap.fromTo('.word',
    {
      opacity: 0,
      y: 50,
      rotationX: -90,
    },
    {
      opacity: 1,
      y: 0,
      rotationX: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.05,
      delay: delay,
    }
  );
};

// Scroll-triggered fade in
export const scrollFadeIn = (elements, options = {}) => {
  const {
    start = 'top 80%',
    end = 'bottom 20%',
    toggleActions = 'play none none reverse',
  } = options;

  gsap.fromTo(elements,
    {
      opacity: 0,
      y: 50,
    },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.15,
      scrollTrigger: {
        trigger: elements[0] || elements,
        start: start,
        end: end,
        toggleActions: toggleActions,
        markers: false,
      },
    }
  );
};

// Parallax effect
export const parallax = (element, speed = 0.5) => {
  gsap.to(element, {
    yPercent: -50 * speed,
    ease: 'none',
    scrollTrigger: {
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });
};

// Number counter animation
export const countUp = (element, targetValue, duration = 2) => {
  const obj = { value: 0 };
  gsap.to(obj, {
    value: targetValue,
    duration: duration,
    ease: 'power2.out',
    onUpdate: () => {
      element.textContent = Math.round(obj.value).toLocaleString();
    },
  });
};

// Card hover animation
export const cardHover = (card) => {
  const tl = gsap.timeline({ paused: true });
  
  tl.to(card, {
    y: -10,
    scale: 1.02,
    boxShadow: '0 20px 40px rgba(88, 6, 149, 0.2)',
    duration: 0.3,
    ease: 'power2.out',
  });

  card.addEventListener('mouseenter', () => tl.play());
  card.addEventListener('mouseleave', () => tl.reverse());
};

// Stagger grid animation
export const staggerGrid = (elements, delay = 0) => {
  gsap.fromTo(elements,
    {
      opacity: 0,
      scale: 0.9,
      y: 30,
    },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
      stagger: {
        amount: 0.4,
        from: 'start',
      },
      delay: delay,
      scrollTrigger: {
        trigger: elements[0]?.parentElement || elements,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    }
  );
};

// Split text reveal
export const splitTextReveal = (element) => {
  const text = element;
  const chars = text.textContent.split('');
  text.innerHTML = chars.map(char => 
    char === ' ' ? '<span>&nbsp;</span>' : `<span class="char">${char}</span>`
  ).join('');

  gsap.fromTo('.char',
    {
      opacity: 0,
      y: 20,
      rotationX: -90,
    },
    {
      opacity: 1,
      y: 0,
      rotationX: 0,
      duration: 0.5,
      ease: 'back.out(1.7)',
      stagger: 0.02,
    }
  );
};

// Magnetic button effect
export const magneticButton = (button) => {
  button.addEventListener('mousemove', (e) => {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(button, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.5,
      ease: 'power2.out',
    });
  });

  button.addEventListener('mouseleave', () => {
    gsap.to(button, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
    });
  });
};

// Loading animation
export const loadingAnimation = (element) => {
  const tl = gsap.timeline({ repeat: -1 });
  
  tl.to(element, {
    rotation: 360,
    duration: 1,
    ease: 'none',
  });
};

// Progress bar animation
export const animateProgressBar = (bar, percentage) => {
  gsap.to(bar, {
    width: `${percentage}%`,
    duration: 1.5,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: bar,
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
  });
};

// Timeline animation for complex sequences
export const createTimeline = (elements, options = {}) => {
  const tl = gsap.timeline(options);
  
  elements.forEach((element, index) => {
    tl.fromTo(element,
      {
        opacity: 0,
        y: 50,
        scale: 0.9,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: 'power3.out',
      },
      index * 0.1
    );
  });

  return tl;
};

// Cleanup function
export const cleanupAnimations = () => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
};

