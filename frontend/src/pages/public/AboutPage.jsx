import { useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed">
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[716px] flex items-center overflow-hidden bg-surface py-20 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 z-10">
              <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-4 block">
                Redefining Relief
              </span>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-on-surface mb-8">
                The Resilient <br />
                <span className="text-primary-container">Canvas.</span>
              </h1>
              <p className="text-lg md:text-xl text-on-surface-variant max-w-xl leading-relaxed font-light">
                DeReFund was born from the conviction that disaster relief should be as agile as the crises it
                addresses, and as transparent as the water it provides.
              </p>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-2xl relative rotate-3 hover:rotate-0 transition-transform duration-700">
                <img
                  className="object-cover w-full h-full scale-110"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDheezrLWf527qVGnh6q2M14GiTrlc1qTeS0cJ8qWeJDFT-ea6XcVxLCYXut_bns1dck_Z6CthfkEm7sVSTnDOqc9jtWIbsgBT042Gyi5NAhiC9hjqnHK_PWyOQIW_X-oy5VYQBn8m4u5_OqW2vaKkYhE2UhSn8zB2HxIVtFi7mtQeTCsXKvqm1oMZhW_wTNjwV8FW-Vw3qSokyujBNrghl9VY3ZLJVqPBDAwTnOwNcKJFmymBHWDdZev-KtCpyQkT4II0YGDj9TcU"
                  alt="Humanitarian worker providing aid"
                />
                <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
              </div>
              <div className="absolute -bottom-6 -left-12 p-8 glass-panel rounded-xl shadow-xl border border-white/20 hidden md:block">
                <span className="text-4xl font-black text-white block mb-1">$24M+</span>
                <span className="text-white/80 text-xs font-bold uppercase tracking-widest">
                  Global Impact Tracked
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Story */}
        <section className="bg-surface-container-low py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-start">
              <div>
                <h2 className="text-3xl font-bold mb-8 border-l-4 border-primary pl-6">Our Mission</h2>
                <p className="text-2xl font-body leading-relaxed text-on-surface italic">
                  &quot;To bridge the gap between human empathy and immediate action through a decentralized, verified,
                  and radically transparent crowdfunding ecosystem.&quot;
                </p>
              </div>
              <div className="space-y-6">
                <h3 className="text-xl font-bold">Our Story</h3>
                <p className="text-on-surface-variant leading-loose">
                  Founded in 2022 after a series of logistics failures during global wildfires, DeReFund emerged as a
                  response to the &quot;black hole&quot; of traditional donations. We saw billions raised, yet
                  communities remained in ruins months later due to bureaucratic lag and lack of on-ground verification.
                </p>
                <p className="text-on-surface-variant leading-loose">
                  We built a platform where technology serves humanity, ensuring every dollar is tracked from the
                  donor&apos;s wallet to the recipient&apos;s hands via verified NGO nodes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Problem / Solution */}
        <section className="py-24 px-6 bg-surface">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-black tracking-tight mb-4">Architecture of Trust</h2>
              <p className="text-on-surface-variant">How we solve the legacy problems of disaster relief.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
              <div className="bg-surface-container-highest p-8 rounded-xl flex flex-col justify-between group hover:bg-tertiary-container transition-colors duration-300">
                <div>
                  <span className="material-symbols-outlined text-4xl mb-6 text-tertiary group-hover:text-white transition-colors">
                    emergency_home
                  </span>
                  <h4 className="text-xl font-bold mb-2 group-hover:text-white">Delayed Response</h4>
                  <p className="text-sm text-on-surface-variant group-hover:text-white/80">
                    Traditional funds take weeks to reach ground operations due to banking hurdles.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2 group-hover:text-white">
                  <span className="text-xs font-black uppercase">Legacy Problem</span>
                </div>
              </div>

              <div className="md:col-span-2 md:row-span-2 bg-primary hero-gradient p-12 rounded-xl text-white relative overflow-hidden flex flex-col justify-end">
                <div className="absolute top-12 left-12">
                  <span className="material-symbols-outlined text-6xl opacity-50">verified</span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-5xl font-black mb-6 leading-tight">
                    Instant Verification.
                    <br />
                    Real-Time Impact.
                  </h3>
                  <p className="text-lg text-white/90 max-w-lg mb-8">
                    Our &apos;Node-Verify&apos; system uses satellite imagery and local NGO check-ins to unlock funds
                    instantly as milestones are met. No more waiting, no more guessing.
                  </p>
                  <button
                    type="button"
                    className="bg-white text-primary px-8 py-3 rounded-md font-bold text-sm shadow-xl active:scale-95 transition-transform"
                  >
                    Explore The Model
                  </button>
                </div>
                <div className="absolute right-[-10%] top-[-10%] w-[60%] h-[120%] opacity-10 rotate-12 bg-white/20 blur-3xl rounded-full" />
              </div>

              <div className="bg-surface-container-highest p-8 rounded-xl flex flex-col justify-between group hover:bg-tertiary-container transition-colors duration-300">
                <div>
                  <span className="material-symbols-outlined text-4xl mb-6 text-tertiary group-hover:text-white transition-colors">
                    visibility_off
                  </span>
                  <h4 className="text-xl font-bold mb-2 group-hover:text-white">Lack of Visibility</h4>
                  <p className="text-sm text-on-surface-variant group-hover:text-white/80">
                    70% of donors never see exactly where their contribution was spent.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2 group-hover:text-white">
                  <span className="text-xs font-black uppercase">Legacy Problem</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partners */}
        <section className="py-20 bg-surface-container-low border-y border-outline-variant/15">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-xs font-black tracking-widest text-on-surface-variant uppercase mb-12">
              Verified Global Partners
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
              <span className="text-2xl font-black italic tracking-tighter">REDSHIELD</span>
              <span className="text-2xl font-bold">AQUASAVE</span>
              <span className="text-2xl font-light tracking-[0.3em]">GLOBAL_AID</span>
              <span className="text-3xl font-black">UN_CORE</span>
              <span className="text-2xl font-medium uppercase border-2 border-on-surface px-2">ReliefWay</span>
            </div>
          </div>
        </section>

        {/* Transparency Report */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto bg-surface-container-lowest rounded-xl shadow-2xl p-12 md:p-20 relative overflow-hidden border border-outline-variant/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-black mb-6">Transparency Report 2024</h2>
                <p className="text-on-surface-variant leading-relaxed mb-8">
                  Every quarter, we publish a full, audited breakdown of fund distribution, logistical efficiency, and
                  project outcomes. We believe accountability is the highest form of respect.
                </p>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
                >
                  Download Full Report (PDF 14MB)
                  <span className="material-symbols-outlined">download</span>
                </button>
              </div>
              <div className="bg-surface-container-high p-8 rounded-xl space-y-6">
                <div className="flex justify-between items-end border-b border-outline-variant pb-4">
                  <span className="text-sm font-bold">Overhead Ratio</span>
                  <span className="text-3xl font-black text-secondary">3.2%</span>
                </div>
                <div className="flex justify-between items-end border-b border-outline-variant pb-4">
                  <span className="text-sm font-bold">Funds to Mission</span>
                  <span className="text-3xl font-black text-secondary">96.8%</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold">Active Projects</span>
                  <span className="text-3xl font-black">142</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;

