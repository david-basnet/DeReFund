import { useEffect } from 'react';

const HomePage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="bg-surface text-on-surface antialiased">
      {/* TopNavBar (exact Stitch layout) */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-6 py-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-black tracking-tighter text-blue-700 dark:text-blue-400">
              DeReFund
            </span>
            <div className="hidden md:flex gap-6 items-center">
              <a className="font-sans text-sm font-medium text-blue-700 dark:text-blue-400 border-b-2 border-blue-700 dark:border-blue-400 pb-1">
                Browse
              </a>
              <a className="font-sans text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">
                Disasters
              </a>
              <a className="font-sans text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">
                About Us
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-surface-container-high px-3 py-1.5 rounded-lg mr-2">
              <span className="material-symbols-outlined text-outline text-sm mr-2">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 text-sm w-48"
                placeholder="Search relief efforts..."
                type="text"
              />
            </div>
            <button className="hidden lg:block font-sans text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors px-4 py-2 rounded-md active:scale-95 duration-150">
              Sign In
            </button>
            <button className="primary-gradient text-white px-5 py-2.5 rounded-md text-sm font-bold active:scale-95 duration-150 shadow-md">
              Donate Now
            </button>
            <button className="p-2 text-slate-600">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800 h-px w-full" />
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[870px] flex items-center overflow-hidden bg-surface">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            <div className="lg:col-span-6">
              <span className="inline-block bg-tertiary-container text-white px-3 py-1 rounded-sm text-[10px] font-bold tracking-widest uppercase mb-6">
                Active Emergency Response
              </span>
              <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter text-on-surface mb-6 leading-[0.95]">
                Rebuilding <span className="text-primary">Communities</span> Together.
              </h1>
              <p className="text-lg text-on-surface-variant leading-relaxed mb-10 max-w-xl">
                A decentralized humanitarian engine designed to deliver direct financial relief to disaster zones with
                radical transparency and verified impact.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="primary-gradient text-on-primary px-8 py-4 rounded-md font-bold text-lg shadow-ambient hover:-translate-y-0.5 transition-transform">
                  Donate Now
                </button>
                <button className="bg-surface-container-highest text-on-surface px-8 py-4 rounded-md font-bold text-lg hover:bg-surface-dim transition-colors">
                  Join as NGO
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="relative w-full aspect-square rounded-full overflow-hidden shadow-2xl border-8 border-white/20">
                <img
                  className="w-full h-full object-cover"
                  alt="Volunteers handing out food and supplies in a recovering community"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXTujlp-478kv2ATlvifAn-h6keT0huSM6HljYFNWqrnyv1DP2h-IVbIV9CqO3nWOONz8Fo7MUvinnxIsUuFGF1cLLmi07YuLYC6PSqycTg83I_D8EouW7lppPp6uGZ4txt0dcvrW9tcM3BkEYv6ZDT1sEK59gFCNmu0Ty20Xmy9B45SkFVfp64y0hBhZjzy4eY2OcOhE6pFO4i7A5nS-fRYzRV4i4CCjOhjW2Ib3pxZQlz0V-7LMtPHI1gbL1e_82aAV0I5IefD4"
                />
              </div>

              <div className="absolute -bottom-6 -left-6 glass-panel p-6 rounded-xl shadow-ambient max-w-xs border border-white/30">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                    <span className="material-symbols-outlined">verified_user</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-outline uppercase tracking-widest">Verified NGO</p>
                    <p className="font-bold text-on-surface">Red Cross Alliance</p>
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant italic">
                  &quot;DeReFund accelerated our ground response by 40% in the last cyclone.&quot;
                </p>
              </div>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-1/2 h-full bg-surface-container-low -skew-x-12 translate-x-1/4 -z-0" />
        </section>

        {/* Impact Stats */}
        <section className="py-12 bg-surface-container-lowest relative z-20 -mt-10 mx-6 rounded-xl shadow-ambient border border-outline-variant/10">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div>
                <p className="text-5xl font-black text-primary tracking-tighter mb-2">$14.2M+</p>
                <p className="text-xs font-bold uppercase tracking-widest text-outline">Total Raised</p>
              </div>
              <div>
                <p className="text-5xl font-black text-secondary tracking-tighter mb-2">840K</p>
                <p className="text-xs font-bold uppercase tracking-widest text-outline">Lives Impacted</p>
              </div>
              <div>
                <p className="text-5xl font-black text-on-surface tracking-tighter mb-2">156</p>
                <p className="text-xs font-bold uppercase tracking-widest text-outline">Verified NGOs</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xs font-bold text-primary uppercase tracking-[0.3em] mb-8">Our Mission</h2>
            <p className="text-4xl md:text-5xl font-bold text-on-surface leading-tight tracking-tight">
              We bridge the gap between global empathy and local action, ensuring every dollar finds its way to the
              hands that need it most.
            </p>
            <div className="mt-12 h-1 w-24 bg-primary mx-auto" />
          </div>
        </section>

        {/* How it Works */}
        <section className="py-24 bg-surface-container-low px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-16">
              <div>
                <h2 className="text-4xl font-black tracking-tighter mb-4">How DeReFund Works</h2>
                <p className="text-on-surface-variant max-w-md">
                  Our dual-ecosystem ensures transparency for donors and rapid deployment for partners.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="px-4 py-2 bg-primary-fixed text-on-primary-fixed rounded-full text-xs font-bold">
                  FOR DONORS
                </span>
                <span className="px-4 py-2 bg-surface-container-highest text-on-surface-variant rounded-full text-xs font-bold">
                  FOR NGOS
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 group hover:shadow-ambient transition-all">
                <div className="text-primary mb-6 group-hover:scale-110 transition-transform origin-left">
                  <span className="material-symbols-outlined text-5xl">search_insights</span>
                </div>
                <h3 className="text-xl font-bold mb-4">1. Choose &amp; Verify</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Browse active disasters and read verified reports from NGOs on the ground. Every campaign is vetted
                  by our volunteer network.
                </p>
              </div>

              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 group hover:shadow-ambient transition-all">
                <div className="text-primary mb-6 group-hover:scale-110 transition-transform origin-left">
                  <span className="material-symbols-outlined text-5xl">payments</span>
                </div>
                <h3 className="text-xl font-bold mb-4">2. Direct Donation</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Contribute directly using global or local payment methods. Your funds are locked into milestone-based
                  smart contracts.
                </p>
              </div>

              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 group hover:shadow-ambient transition-all">
                <div className="text-primary mb-6 group-hover:scale-110 transition-transform origin-left">
                  <span className="material-symbols-outlined text-5xl">monitoring</span>
                </div>
                <h3 className="text-xl font-bold mb-4">3. Track Impact</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Receive real-time updates and proof-of-impact photos as the NGO reaches specific recovery milestones.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Urgent Relief Efforts */}
        <section className="py-24 px-6 bg-surface">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
              <h2 className="text-4xl font-black tracking-tighter">Urgent Relief Efforts</h2>
              <a className="text-primary font-bold flex items-center gap-2 hover:underline">
                View All Campaigns <span className="material-symbols-outlined">arrow_right_alt</span>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-ambient transition-all flex flex-col">
                <div className="relative h-56 overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    alt="Overhead view of flooded city streets with rescue boats"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1QgNpYfxK3gDjZ4bPULItIiKfqPNgfjj6xHVybP0_jz6_mHQDu9nGHAQMr_GWlZiuAukgwWYoOk2eTByUFKXScSPZfcyyM3puuXS7O1-1uVZLR-RGlvrfTnxC3T0v6T2VuZaHT-hsJ9AaeiHhMg9MhcZUnPS1ok7alx3C75LYSd7sAqqU1nlHGHhilwIeXy42TU1qKb4Y-cGN9HCmmtVDJObuzPit5B3Vhv4gHMAkj8yLsptZyxS2DRHKpxEiemfpntTcX-1OMQ8"
                  />
                  <div className="absolute top-4 left-4 bg-tertiary-container text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
                    Critical
                  </div>
                </div>
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg leading-tight">
                      East Java Flash Flood Emergency Response
                    </h3>
                    <span className="material-symbols-outlined text-secondary">verified</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full mb-3">
                    <div className="bg-primary h-full rounded-full" style={{ width: '72%' }} />
                  </div>
                  <div className="flex justify-between text-xs font-bold text-outline mb-6">
                    <span>$144,000 raised</span>
                    <span className="text-on-surface">72%</span>
                  </div>
                  <button className="w-full py-3 bg-surface-container-high text-on-surface font-bold text-sm rounded-md hover:bg-primary hover:text-white transition-colors">
                    Support Campaign
                  </button>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-ambient transition-all flex flex-col">
                <div className="relative h-56 overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    alt="Parched cracked earth with a green sprout"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBITK6z9dlLA2phojeSHVm4jS-0fGaJa7V6FRQJDTx1O0tNTih2jJGxpNG4SBX0mZ3ja6inPl7rET2_vj4pS_WqUQ6couRZDQN1rHIeCfq_stls5m6e5JO807xBiXjzkeLUfZlI09LaS4ahOl31CrzkbrswsQ_afyzOuo7CbvszlwMlrivemp7g4HOeXdX7kV8eFXnq4orIwx6ojVrBmjkJ9hh8iyxHGxfggnUfeLR6pNa8fCOWnasyAx7AODy12TY5izBGXmh-mzk"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
                    Ongoing
                  </div>
                </div>
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg leading-tight">
                      Clean Water Access: Sahel Region Drought
                    </h3>
                    <span className="material-symbols-outlined text-secondary">verified</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full mb-3">
                    <div className="bg-primary h-full rounded-full" style={{ width: '45%' }} />
                  </div>
                  <div className="flex justify-between text-xs font-bold text-outline mb-6">
                    <span>$89,200 raised</span>
                    <span className="text-on-surface">45%</span>
                  </div>
                  <button className="w-full py-3 bg-surface-container-high text-on-surface font-bold text-sm rounded-md hover:bg-primary hover:text-white transition-colors">
                    Support Campaign
                  </button>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-ambient transition-all flex flex-col">
                <div className="relative h-56 overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    alt="Urban reconstruction site after an earthquake"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAShOmRPM3_onni30e8ooRVkwEMNBpGyzCHwGJRpNOPzYaGvys-Qh33imBkuLIPtHvlkQgZ8z0spPLbQ_xchzlw3oRDvSYEm0wZ5TbxTFfLc3JLv4ZAiOahrFyslgNBxV_R1IITAKfUuslRQNsCWWkoFjzQ38KG2rk_HEz2BQRnOKo_YAoRilI935K3pPnazxyF5mgym97xOIA8NFZaomWVYrXKRqMGMUAwuF4KxIXOf5OxjWGwE4lJK7W5dettpBZ8D2pA6N0-iEU"
                  />
                  <div className="absolute top-4 left-4 bg-secondary text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
                    Recovery
                  </div>
                </div>
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg leading-tight">Haiti School Reconstruction Fund</h3>
                    <span className="material-symbols-outlined text-secondary">verified</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full mb-3">
                    <div className="bg-primary h-full rounded-full" style={{ width: '91%' }} />
                  </div>
                  <div className="flex justify-between text-xs font-bold text-outline mb-6">
                    <span>$312,000 raised</span>
                    <span className="text-on-surface">91%</span>
                  </div>
                  <button className="w-full py-3 bg-surface-container-high text-on-surface font-bold text-sm rounded-md hover:bg-primary hover:text-white transition-colors">
                    Support Campaign
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Transparency & Trust */}
        <section className="py-24 bg-on-surface text-surface px-6 overflow-hidden relative">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 leading-tight">
                Trust isn&apos;t promised.
                <br />
                It&apos;s programmed.
              </h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-container/20 flex items-center justify-center border border-primary/30">
                    <span className="material-symbols-outlined">gavel</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-2">Volunteer Verification</h4>
                    <p className="text-surface-dim text-sm leading-relaxed">
                      Our &quot;Ground Truth&quot; network of independent volunteers verifies every milestone before
                      funds are released from escrow.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-container/20 flex items-center justify-center border border-primary/30">
                    <span className="material-symbols-outlined">account_balance_wallet</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-2">Milestone Tracking</h4>
                    <p className="text-surface-dim text-sm leading-relaxed">
                      Funds are disbursed in phases. Each phase requires photographic and geo-tagged proof of completion
                      to unlock the next tranche.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-container/20 flex items-center justify-center border border-primary/30">
                    <span className="material-symbols-outlined">lock_open</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-2">Immutable Transparency</h4>
                    <p className="text-surface-dim text-sm leading-relaxed">
                      Every transaction and verification step is logged on a public ledger, providing an audit trail that
                      cannot be altered or obscured.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-surface-container-highest/10 rounded-2xl p-4 backdrop-blur-md border border-white/10 rotate-3">
                <img
                  className="rounded-lg shadow-2xl"
                  alt="Dashboard UI showing impact charts and fund flows"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPW_UqbXqWXfSmNh2tDo9PkG23hV5tgB9TJywymtXADc58c9QMumMLf9ViqCcLaywrZ68iwdEeQdI3t36ZgMWLqqeetgUgesTMWVlzy-kPWgrM92RM1F04gCm9qsq3JQQqGMCQxDM8CPtFw48nxkjE4WIw_pd8ngmBf84exOL_SJD32Myhj9GsnV1rgc4LSCYLQZQH1G3ICYU4u4XmkTFexg26O-gAl4lKFiYPS1IF2TcodcFplGyWMbmUJfMGV7zOToIU-oPwWjs"
                />
              </div>
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-24 px-6 bg-surface-container-low">
          <div className="max-w-5xl mx-auto bg-surface-container-lowest p-12 rounded-2xl shadow-ambient border border-outline-variant/5">
            <div className="flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-6xl text-primary/30 mb-8">format_quote</span>
              <p className="text-2xl md:text-3xl font-medium text-on-surface leading-snug mb-10">
                &quot;DeReFund has completely transformed how we respond to local crises. The speed at which we can now
                access verified donor funds means we can deploy aid in hours, not weeks.&quot;
              </p>
              <div className="flex items-center gap-4 text-left">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200">
                  <img
                    className="w-full h-full object-cover"
                    alt="Portrait of humanitarian worker"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpjLU-UL_jlonuGXyKKhunYTeUBSP_NEOjMC0xR_DD6ASuIc2VvqlYzE4tGlrY_H8K0kXoUfMpAsst8jfvCwTAsj-wMYR6LNxIqyxb6nACUJ1Cg5n_BNyZd-_tP2L352FPXiWP3oYKWMKh41zrS8ApFZc60fbjKOTnR5OLSumNcWue20j5GVZ7J0SscEw9lNNBITMerptkC8BkjMukuHY2uYLmivhfLHdxYYc3GKBaNbpHmBsiOmM5mwvSiSbQGsHFKZwUqdDIjV8"
                  />
                </div>
                <div>
                  <p className="font-bold text-on-surface">Elena Rodriguez</p>
                  <p className="text-sm text-on-surface-variant">Director, Hope First NGO</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl font-black tracking-tighter mb-6">
              Ready to make a difference?
            </h2>
            <p className="text-on-surface-variant text-lg mb-10">
              Join thousands of donors and verified NGOs working together to rebuild what matters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="primary-gradient text-white px-10 py-5 rounded-md font-bold text-xl shadow-lg active:scale-95 duration-150">
                Browse All Campaigns
              </button>
              <button className="bg-surface-container-highest text-on-surface px-10 py-5 rounded-md font-bold text-xl hover:bg-surface-dim transition-colors">
                Partner With Us
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer (Stitch layout) */}
      <footer className="w-full py-12 px-8 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <div className="col-span-1 md:col-span-1">
            <span className="text-xl font-black text-slate-900 dark:text-white mb-4 block">DeReFund</span>
            <p className="text-xs font-normal leading-loose text-slate-500">
              Humanitarian Crowdfunding Reimagined. Built for speed, trust, and radical transparency.
            </p>
          </div>
          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white mb-6">
              Platform
            </h5>
            <ul className="space-y-4">
              <li>
                <a className="text-xs font-normal leading-loose text-slate-500 hover:text-blue-600 underline decoration-blue-500/30 underline-offset-4 transition-all">
                  Mission
                </a>
              </li>
              <li>
                <a className="text-xs font-normal leading-loose text-slate-500 hover:text-blue-600 underline decoration-blue-500/30 underline-offset-4 transition-all">
                  NGO Partners
                </a>
              </li>
              <li>
                <a className="text-xs font-normal leading-loose text-slate-500 hover:text-blue-600 underline decoration-blue-500/30 underline-offset-4 transition-all">
                  Transparency
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white mb-6">
              Company
            </h5>
            <ul className="space-y-4">
              <li>
                <a className="text-xs font-normal leading-loose text-slate-500 hover:text-blue-600 underline decoration-blue-500/30 underline-offset-4 transition-all">
                  Contact
                </a>
              </li>
              <li>
                <a className="text-xs font-normal leading-loose text-slate-500 hover:text-blue-600 underline decoration-blue-500/30 underline-offset-4 transition-all">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a className="text-xs font-normal leading-loose text-slate-500 hover:text-blue-600 underline decoration-blue-500/30 underline-offset-4 transition-all">
                  Careers
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white mb-6">
              Newsletter
            </h5>
            <p className="text-xs text-slate-500 mb-4">Stay updated on active relief efforts.</p>
            <div className="flex">
              <input
                className="bg-surface-container-high border-none text-xs p-2 rounded-l-md w-full focus:ring-1 focus:ring-primary"
                placeholder="Email address"
                type="email"
              />
              <button className="bg-primary text-white p-2 rounded-r-md">
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <p className="text-xs font-normal leading-loose text-slate-500">
            © 2024 DeReFund. Humanitarian Crowdfunding Reimagined.
          </p>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-primary">public</span>
            <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-primary">hub</span>
            <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-primary">share</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

