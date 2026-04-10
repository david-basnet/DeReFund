import { useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const BrowseCampaigns = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="bg-surface font-body text-on-surface">
      <Navbar />

      <main className="pt-24 pb-16 min-h-screen">
        {/* Hero Section */}
        <header className="max-w-screen-2xl mx-auto px-6 mb-12">
          <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-10 md:p-16">
            <div className="relative z-10 max-w-2xl">
              <span className="text-primary font-bold tracking-widest text-xs uppercase mb-4 block">
                Crowdfunding Reimagined
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-on-surface tracking-tighter mb-6 leading-none">
                Active Relief Campaigns
              </h1>
              <p className="text-lg text-on-surface-variant leading-relaxed max-w-xl">
                Transparent, blockchain-verified direct aid for global emergencies. Browse active initiatives and
                provide immediate support where it is needed most.
              </p>
            </div>
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-[20rem] absolute -right-20 -top-20">
                public
              </span>
            </div>
          </div>
        </header>

        {/* Search & Filter Bar */}
        <section className="max-w-screen-2xl mx-auto px-6 mb-12">
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="relative flex items-center md:col-span-1">
              <span className="material-symbols-outlined absolute left-3 text-outline">search</span>
              <input
                type="text"
                className="w-full bg-surface-container-high border-none rounded-md py-3 pl-10 focus:ring-2 focus:ring-primary text-sm"
                placeholder="Search campaigns..."
              />
            </div>

            <div className="relative">
              <select className="w-full bg-surface-container-high border-none rounded-md py-3 px-4 focus:ring-2 focus:ring-primary text-sm appearance-none cursor-pointer">
                <option>All Disasters</option>
                <option>Earthquake</option>
                <option>Flood</option>
                <option>Wildfire</option>
                <option>Humanitarian Crisis</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
                expand_more
              </span>
            </div>

            <div className="relative">
              <select className="w-full bg-surface-container-high border-none rounded-md py-3 px-4 focus:ring-2 focus:ring-primary text-sm appearance-none cursor-pointer">
                <option>Global Locations</option>
                <option>Europe</option>
                <option>Asia Pacific</option>
                <option>Middle East</option>
                <option>Africa</option>
                <option>Americas</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
                location_on
              </span>
            </div>

            <div className="relative">
              <select className="w-full bg-surface-container-high border-none rounded-md py-3 px-4 focus:ring-2 focus:ring-primary text-sm appearance-none cursor-pointer">
                <option>Any Urgency</option>
                <option>Critical (Live)</option>
                <option>Ongoing Relief</option>
                <option>Recovery Phase</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
                bolt
              </span>
            </div>
          </div>
        </section>

        {/* Campaigns Grid (static placeholders for now) */}
        <section className="max-w-screen-2xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <article className="group bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-[0px_20px_40px_rgba(25,28,29,0.06)] transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative h-56 overflow-hidden">
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJ3nVZdwU-ejECNX5ohSVjqFRLHyTzZiyDbFBGx4Elqb-7BMK98HDwXnW4KCTONHQErANm11BQxvJLXQg1SSKdfA-UWmPbF37wgapdGJnTPe-l6G2fme5j9fhdyc1WawhYGYc06MC8VUXy4BhNp4S4BGaaLKOn59bc154XfzVp8UVPo-u03Vrn3Zf9lxRT0Wenz0H5PO1nObL6raAzQGcE2EHg4W-LU-gvyaOM14g0K6FN_I66zJK5ILkTfYVFWd6AggVCZLvYq1c"
                  alt="Flood-stricken residential area"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-tertiary-container text-on-tertiary-container text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-sm shadow-lg">
                    Urgent
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-secondary text-sm">verified</span>
                  <span className="text-xs font-semibold text-outline tracking-wider uppercase">Global Relief Nexus</span>
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-4 leading-tight">
                  Eastern Region Flood Emergency Response
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-2xl font-black text-primary tracking-tighter">$142,500</span>
                      <span className="text-xs font-bold text-outline">Target: $250k</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '57%' }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <button
                      type="button"
                      className="flex-1 primary-gradient text-on-primary py-3 rounded-md font-bold text-sm shadow-md active:scale-95 transition-transform"
                    >
                      Donate Now
                    </button>
                    <button
                      type="button"
                      className="p-3 bg-surface-container-high rounded-md text-on-surface-variant hover:bg-surface-dim transition-colors"
                    >
                      <span className="material-symbols-outlined">share</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>

            {/* Card 2 */}
            <article className="group bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-[0px_20px_40px_rgba(25,28,29,0.06)] transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative h-56 overflow-hidden">
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfln9plOxtILnXf_fc28byWo50NKiNWFTtSetxfuQNSHqtxXeyUC4NYi-z81OOBmkFbpksqnJyFPog8ffOrvD9p0CQsKufyGYaD9Us_edsaEwOP735Vtu1TxYuYEEFUGzZOW3aHy7AnzxMhKZDPno_ZNyW0Bgzczb3JiNfYGIETlVsHEBQwAVwQPOjP7ksYFMUwfvm5jwPxVhXEtLLLrUzjddYFIP-ue0fRqk9GBazeCAXo1Yx5K9_m3xU1S9o8A_xlOCq5vPNBEI"
                  alt="Volunteer distribution of food and water"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-sm shadow-lg">
                    Live
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-secondary text-sm">verified</span>
                  <span className="text-xs font-semibold text-outline tracking-wider uppercase">Horizon Partners</span>
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-4 leading-tight">
                  Post-Earthquake Community Reconstruction
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-2xl font-black text-primary tracking-tighter">$892,100</span>
                      <span className="text-xs font-bold text-outline">Target: $1.2M</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full bg-secondary rounded-full" style={{ width: '74%' }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <button
                      type="button"
                      className="flex-1 primary-gradient text-on-primary py-3 rounded-md font-bold text-sm shadow-md active:scale-95 transition-transform"
                    >
                      Donate Now
                    </button>
                    <button
                      type="button"
                      className="p-3 bg-surface-container-high rounded-md text-on-surface-variant hover:bg-surface-dim transition-colors"
                    >
                      <span className="material-symbols-outlined">share</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>

            {/* Card 3 */}
            <article className="group bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-[0px_20px_40px_rgba(25,28,29,0.06)] transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative h-56 overflow-hidden">
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwLFc4f83zDvVBe9aQkj-h-7vsnWaO00VBWt0mKmEflqRVez4A7WD7niIXZ_tkN_Z_o630GhM1Wb0svriDIEDVEQlibV5n1YktsK37RSGBuVqDwpXNz6V8mG_b9dp3U8tBe2PFIP5Ige7cWmDdVlLdgn0zHVBGZZxm_Ni-hhR54E7zSHSEBdMFNwPCfMeM4wmx13YE72cGnJlx9TD3Ayg0j_yQcnw_uj6Jcx6v_jAz3gyOzwqDZgJNEtp67L0v-5jJAN88G14tkdU"
                  alt="Healthcare workers providing medical aid"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-sm shadow-lg">
                    Live
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-secondary text-sm">verified</span>
                  <span className="text-xs font-semibold text-outline tracking-wider uppercase">
                    Doctors without Borders
                  </span>
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-4 leading-tight">
                  Mobile Medical Units for Remote Villages
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-2xl font-black text-primary tracking-tighter">$45,000</span>
                      <span className="text-xs font-bold text-outline">Target: $500k</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full bg-secondary rounded-full" style={{ width: '9%' }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <button
                      type="button"
                      className="flex-1 primary-gradient text-on-primary py-3 rounded-md font-bold text-sm shadow-md active:scale-95 transition-transform"
                    >
                      Donate Now
                    </button>
                    <button
                      type="button"
                      className="p-3 bg-surface-container-high rounded-md text-on-surface-variant hover:bg-surface-dim transition-colors"
                    >
                      <span className="material-symbols-outlined">share</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Pagination */}
          <div className="mt-16 flex flex-col items-center justify-center gap-4">
            <button
              type="button"
              className="bg-surface-container-highest text-on-surface px-10 py-4 rounded-md font-bold text-sm hover:bg-surface-dim transition-all active:scale-95"
            >
              View More Campaigns
            </button>
            <p className="text-xs text-outline font-medium tracking-widest uppercase">
              Showing 3 of 42 campaigns
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BrowseCampaigns;

