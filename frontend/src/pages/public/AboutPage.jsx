import { useState, useEffect, useRef, Fragment } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const AboutPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState({ campaigns: 0, donations: 0, impact: 0 });
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const [isHeadlineVisible, setIsHeadlineVisible] = useState(false);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;

      const animateCount = (target, key) => {
        let current = 0;
        const increment = target / steps;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          setCounts(prev => ({ ...prev, [key]: Math.floor(current) }));
        }, stepDuration);
      };

      animateCount(150, 'campaigns');
      animateCount(5000, 'donations');
      animateCount(100, 'impact');
    }
  }, [isVisible]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsHeadlineVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    if (headlineRef.current) {
      observer.observe(headlineRef.current);
    }

    return () => {
      if (headlineRef.current) {
        observer.unobserve(headlineRef.current);
      }
    };
  }, []);

  return (
    <Fragment>
    <div className="min-h-screen bg-gray-50 pt-24">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              About DeReFund
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              We revolutionize disaster relief through blockchain technology, ensuring every donation reaches those who need it most.
            </p>
          </div>
        </div>
      </section>

      {/* At a Glance Section */}
      <div className="relative">
        {/* Top Section - Light Background */}
        <div className="bg-gray-50 py-20 px-10 md:px-20 lg:px-40">
          <div className="max-w-6xl mx-auto">
            <div className="font-semibold text-lg leading-none text-gray-800 mb-2">At a Glance</div>
            <div className="w-[101px] h-[5px] bg-blue-600 opacity-80 mb-8"></div>
            <div
              ref={headlineRef}
              className={`font-normal text-4xl md:text-5xl leading-tight text-gray-800 mb-8 transition-all duration-1000 ease-out ${
                isHeadlineVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-5'
              }`}
            >
              Transparency isn't claimed,<br />
              <em>it's measured.</em>
            </div>
          </div>
        </div>

        {/* Bottom Section - Dark Background with Stats */}
        <div
          ref={sectionRef}
          className="relative py-20 px-10 md:px-20 lg:px-40 bg-gradient-to-r from-gray-900 to-gray-800"
        >
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex flex-col items-center">
                <div className="bg-white p-6 flex items-center justify-center w-full max-w-[309px] h-[163px]">
                  <div className="font-bold text-6xl md:text-8xl leading-none text-gray-900 text-center">
                    {counts.campaigns}+
                  </div>
                </div>
                <div className="mt-4 font-semibold text-xl md:text-2xl leading-none text-white text-center">
                  Active Campaigns
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-white p-6 flex items-center justify-center w-full max-w-[309px] h-[163px]">
                  <div className="font-bold text-6xl md:text-8xl leading-none text-gray-900 text-center">
                    ${counts.donations.toLocaleString()}
                  </div>
                </div>
                <div className="mt-4 font-semibold text-xl md:text-2xl leading-none text-white text-center">
                  Donations Raised
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-white p-6 flex items-center justify-center w-full max-w-[309px] h-[163px]">
                  <div className="font-bold text-6xl md:text-8xl leading-none text-gray-900 text-center">
                    {counts.impact}%
                  </div>
                </div>
                <div className="mt-4 font-semibold text-xl md:text-2xl leading-none text-white text-center">
                  Impact Rate
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80"
                alt="Disaster relief team"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                DeReFund was founded to revolutionize disaster relief through blockchain technology.
                We connect donors directly with verified NGOs working on the ground, ensuring every
                contribution reaches those who need it most.
              </p>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                To create a transparent, accountable, and efficient platform for disaster relief
                donations where trust is built into every transaction.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Milestone-based fund releases
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Blockchain transparency
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified NGO partnerships
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Transparency</h3>
              <p className="text-gray-700 leading-relaxed">
                Every transaction is recorded on the blockchain, creating an immutable ledger that builds trust and accountability.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Accountability</h3>
              <p className="text-gray-700 leading-relaxed">
                NGOs must prove impact through verified milestones before accessing funds, ensuring your contribution makes real change.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Impact</h3>
              <p className="text-gray-700 leading-relaxed">
                We focus on measurable outcomes, tracking how donations are used and the real-world difference they make.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
      <Footer />
    </Fragment>
  );
};

export default AboutPage;

