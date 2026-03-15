import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import homepageVideo from '../../assets/videos/homepage.mp4';
import './HomePage.css';

gsap.registerPlugin(ScrollTrigger);

const AnimatedText = ({ children, isVisible }) => {
  return (
    <div className="text-center relative">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={isVisible ? { y: 0, opacity: 1 } : { y: 100, opacity: 0 }}
        transition={{
          duration: 0.3,
          ease: "easeOut"
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}

const HomePage = () => {
  const location = useLocation();
  
  // Text Reveal refs
  const sectionStickRef = useRef(null);
  const opacityRevealRef = useRef(null);
  
  // Text Change refs
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const currentIndexRef = useRef(0);
  const videoRef = useRef(null);
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);
  
  // Aggressive cleanup on route change - runs synchronously before React unmounts
  useLayoutEffect(() => {
    return () => {
      // Synchronous cleanup before React unmounts
      try {
        // Kill all ScrollTriggers first
        const triggers = ScrollTrigger.getAll();
        triggers.forEach(trigger => {
          try {
            // Disable pinning before killing
            if (trigger.vars && trigger.vars.pin) {
              trigger.disable();
            }
            trigger.kill(true);
          } catch (e) {}
        });
        
        // Unwrap all pin-spacers synchronously
        const pinSpacers = Array.from(document.querySelectorAll('.pin-spacer'));
        pinSpacers.forEach(spacer => {
          try {
            const parent = spacer.parentNode;
            if (parent && spacer.firstElementChild) {
              // Move the original content back to parent
              while (spacer.firstChild) {
                parent.insertBefore(spacer.firstChild, spacer);
              }
              // Remove the spacer
              parent.removeChild(spacer);
            } else if (parent) {
              parent.removeChild(spacer);
            }
          } catch (e) {
            // If unwrapping fails, just remove it
            try {
              if (spacer.parentNode) {
                spacer.parentNode.removeChild(spacer);
              }
            } catch (e2) {}
          }
        });
        
        // Clear all GSAP transforms
        ScrollTrigger.refresh();
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, [location.pathname]);

  const texts = [
    "Every Donation Matters",
    "Ensure Transparency",
    "Building Trust"
  ];

  // Video autoplay
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log('Video autoplay prevented:', err);
      });
    }
  }, []);

  // Text Reveal Animation
  useEffect(() => {
    let isMounted = true;
    let scrollTriggerInstance = null;
    let timelineInstance = null;

    const initAnimations = () => {
      if (!isMounted || !opacityRevealRef.current || !sectionStickRef.current) return;

      try {
        const text = opacityRevealRef.current.textContent || '';
        const words = text.split(' ');
        opacityRevealRef.current.textContent = '';
        opacityRevealRef.current.style.display = 'inline-block';
        
        words.forEach((word, wordIndex) => {
          if (!isMounted || !opacityRevealRef.current) return;
          
          const wordWrapper = document.createElement('span');
          wordWrapper.style.display = 'inline-block';
          wordWrapper.style.whiteSpace = 'nowrap';
          
          const chars = word.split('').map((char) => {
            const span = document.createElement('span');
            span.style.display = 'inline-block';
            span.textContent = char;
            span.style.fontSize = '';
            return span;
          });
          
          chars.forEach(char => wordWrapper.appendChild(char));
          
          if (opacityRevealRef.current) {
            opacityRevealRef.current.appendChild(wordWrapper);
          }
          
          if (wordIndex < words.length - 1 && opacityRevealRef.current) {
            const space = document.createElement('span');
            space.style.display = 'inline-block';
            space.textContent = '\u00A0';
            space.style.width = '0.5em';
            opacityRevealRef.current.appendChild(space);
          }
        });
        
        if (!isMounted || !opacityRevealRef.current || !sectionStickRef.current) return;
        
        const allChars = Array.from(opacityRevealRef.current.querySelectorAll('span span'));
        gsap.set(allChars, { opacity: 0.2 });

        timelineInstance = gsap.timeline({
          scrollTrigger: {
            trigger: sectionStickRef.current,
            pin: true,
            pinSpacing: true,
            start: "center center",
            end: "+=1500",
            scrub: 1,
            onLeave: () => {
              // Cleanup pin-spacer when leaving
              setTimeout(() => {
                const pinSpacers = document.querySelectorAll('.pin-spacer');
                pinSpacers.forEach(spacer => {
                  try {
                    if (spacer.firstElementChild && spacer.parentNode) {
                      const content = spacer.firstElementChild;
                      spacer.parentNode.insertBefore(content, spacer);
                      spacer.remove();
                    }
                  } catch (e) {}
                });
              }, 100);
            }
          }
        });

        scrollTriggerInstance = timelineInstance.scrollTrigger;

        timelineInstance.to(allChars, {
          opacity: 1,
          duration: 1,
          ease: "none",
          stagger: 0.02
        })
        .to({}, { duration: 10 })
        .to(opacityRevealRef.current, {
          opacity: 0,
          scale: 1.2,
          duration: 50
        });
      } catch (error) {
        console.error('Animation initialization error:', error);
      }
    };

    const timer = setTimeout(initAnimations, 50);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      
      try {
        // Kill timeline and scroll trigger instances first
        if (timelineInstance) {
          timelineInstance.kill();
          timelineInstance = null;
        }
        if (scrollTriggerInstance) {
          scrollTriggerInstance.kill(true);
          scrollTriggerInstance = null;
        }
        
        // Kill all ScrollTriggers
        const triggers = ScrollTrigger.getAll();
        triggers.forEach(trigger => {
          try {
            trigger.kill(true);
          } catch (e) {
            // Ignore errors
          }
        });
        
        // Remove all pin-spacer elements created by GSAP - synchronous unwrap
        try {
          const pinSpacers = Array.from(document.querySelectorAll('.pin-spacer'));
          pinSpacers.forEach(spacer => {
            try {
              const parent = spacer.parentNode;
              if (parent && spacer.firstElementChild) {
                // Unwrap: move children back to parent
                while (spacer.firstChild) {
                  parent.insertBefore(spacer.firstChild, spacer);
                }
                parent.removeChild(spacer);
              } else if (parent) {
                parent.removeChild(spacer);
              }
            } catch (e) {
              try {
                if (spacer.parentNode) {
                  spacer.parentNode.removeChild(spacer);
                }
              } catch (e2) {}
            }
          });
        } catch (e) {
          // Ignore errors
        }
        
        // Clear GSAP styles from elements
        if (sectionStickRef.current && sectionStickRef.current.isConnected) {
          gsap.set(sectionStickRef.current, { clearProps: 'all' });
        }
        if (opacityRevealRef.current && opacityRevealRef.current.isConnected) {
          gsap.set(opacityRevealRef.current, { clearProps: 'all' });
        }
      } catch (e) {
        // Ignore errors
      }
    };
  }, []);

  // Text Change Scroll Handler
  useEffect(() => {
    let isMounted = true;

    const handleScroll = () => {
      if (!isMounted || !containerRef.current) return;

      try {
        const rect = containerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const containerHeight = containerRef.current.offsetHeight;

        const scrollProgress = Math.max(0, Math.min(1,
          (windowHeight - rect.top) / (windowHeight + containerHeight)
        ));

        let newIndex = 0;
        if (scrollProgress < 0.40) {
          newIndex = 0;
        } else if (scrollProgress < 0.60) {
          newIndex = 1;
        } else {
          newIndex = 2;
        }

        if (newIndex !== currentIndexRef.current && isMounted) {
          currentIndexRef.current = newIndex;
          setCurrentIndex(newIndex);
        }
      } catch (error) {
        console.error('Scroll handler error:', error);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      isMounted = false;
      try {
        window.removeEventListener('scroll', handleScroll);
      } catch (e) {
        // Ignore errors
      }
    };
  }, []);

  const campaigns = [
    {
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80",
      title: "Emergency Relief Fund",
      description: "Providing immediate aid to communities affected by natural disasters with food, shelter, and medical supplies.",
      raised: 45200,
      goal: 80000,
      color: "blue"
    },
    {
      image: "https://images.unsplash.com/photo-1593113616828-c4b682208f64?w=600&q=80",
      title: "Rebuilding Communities",
      description: "Supporting families rebuild their homes and lives after devastating floods and earthquakes with construction materials and skilled labor.",
      raised: 67800,
      goal: 120000,
      color: "green"
    },
    {
      image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&q=80",
      title: "Medical Aid Program",
      description: "Delivering essential medical supplies and healthcare services to disaster-stricken areas where medical facilities have been damaged or destroyed.",
      raised: 92400,
      goal: 150000,
      color: "purple"
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', progress: 'bg-blue-600' },
      green: { bg: 'bg-green-600', hover: 'hover:bg-green-700', progress: 'bg-green-600' },
      purple: { bg: 'bg-purple-600', hover: 'hover:bg-purple-700', progress: 'bg-purple-600' }
    };
    return colors[color] || colors.blue;
  };

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden pt-24">
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover z-0"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          >
            <source src={homepageVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/30 z-[1]"></div>
        </div>
      </section>

      {/* Text Reveal Section */}
      <section ref={sectionStickRef} className="section-stick min-h-screen bg-black flex justify-center items-center text-white relative">
        <p ref={opacityRevealRef} className="opacity-reveal text-xl sm:text-2xl md:text-3xl lg:text-4xl font-dmsans tracking-wide px-8 text-center max-w-6xl mx-auto leading-relaxed">
          We ensure accountability: track every donation, verify every milestone, and guarantee funds reach disaster victims
        </p>
      </section>

      {/* Text Change Section */}
      <div className='w-full h-[300vh] relative'>
        <div
          ref={containerRef}
          className='bg-white h-[300vh] w-full relative'
        >
          <div className='sticky top-0 h-screen w-full flex items-center justify-center text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-playfair text-dark-green'>
            <div className="text-center relative w-full px-8 md:px-16 lg:px-24">
              {texts.map((text, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 flex items-center justify-center ${currentIndex === index ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                  <AnimatedText isVisible={currentIndex === index}>
                    {text}
                  </AnimatedText>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-light-gray via-white to-light-purple/5 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-5xl font-semibold text-dark-green text-center mb-16 font-playfair tracking-tight">Welcome to DeReFund</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-purple hover:shadow-xl transition-all hover-lift">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple to-light-purple rounded-full flex items-center justify-center shadow-md">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Make a Donation</h3>
              <p className="text-gray-600">Support disaster relief campaigns with transparent, blockchain-tracked donations</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-dark-green hover:shadow-xl transition-all hover-lift">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-dark-green to-primary-400 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Track Impact</h3>
              <p className="text-gray-600">Monitor how your donations are used through verified milestones and proof</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-light-purple hover:shadow-xl transition-all hover-lift">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-light-purple to-purple rounded-full flex items-center justify-center shadow-md">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Report Disaster</h3>
              <p className="text-gray-600">NGOs can report disasters and create campaigns for verified relief efforts</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-primary-400 hover:shadow-xl transition-all hover-lift">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-400 to-dark-green rounded-full flex items-center justify-center shadow-md">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Blockchain Verified</h3>
              <p className="text-gray-600">Every transaction is recorded on-chain for complete transparency and trust</p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-white via-light-gray to-gray-100 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80" 
                  alt="Disaster relief team" 
                  className="w-full rounded-2xl shadow-2xl border-4 border-dark-green"
                />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple to-light-purple rounded-full opacity-80 blur-xl"></div>
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-semibold text-dark-green mb-6 font-playfair tracking-tight">Our Story</h2>
              <p className="text-lg text-gray-600 mb-6">
                DeReFund was founded to revolutionize disaster relief through blockchain technology. 
                We connect donors directly with verified NGOs working on the ground, ensuring every 
                contribution reaches those who need it most.
              </p>
              <h3 className="text-3xl font-semibold text-gray-800 mb-4">Our Mission</h3>
              <p className="text-lg text-gray-600 mb-4">
                To create a transparent, accountable, and efficient platform for disaster relief 
                donations where trust is built into every transaction.
              </p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Milestone-based fund releases
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Blockchain transparency
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified NGO partnerships
                </li>
              </ul>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-5xl font-bold text-blue-600 mb-2">2024</div>
                  <div className="text-gray-600">Founded</div>
                </div>
                <div>
                  <div className="text-5xl font-bold text-blue-600 mb-2">100%</div>
                  <div className="text-gray-600">Transparent</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Campaigns Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-light-gray to-white relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-5xl font-semibold text-dark-green text-center mb-16 font-playfair tracking-tight">Active Campaigns</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {campaigns.map((campaign, index) => {
              const colorClasses = getColorClasses(campaign.color);
              const percentage = (campaign.raised / campaign.goal) * 100;
              
              return (
                <div key={index} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-purple hover-lift">
                  <img 
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-3">{campaign.title}</h3>
                    <p className="text-gray-600 mb-4">{campaign.description}</p>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Raised: ${campaign.raised.toLocaleString()}</span>
                        <span>Goal: ${campaign.goal.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`${colorClasses.progress} h-3 rounded-full`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple via-light-purple to-dark-green relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full translate-x-48 translate-y-48"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl font-semibold text-white mb-6 font-playfair tracking-tight">Make an Impact. Save Lives.</h2>
          <p className="text-xl text-white/90 mb-8 font-dmsans tracking-tight">
            Join thousands of donors making a difference in disaster relief efforts worldwide. 
            Every donation is tracked, verified, and ensures direct impact.
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default HomePage;
