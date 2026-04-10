import { useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const DisasterDetail = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-fixed">
      <Navbar />

      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 text-xs font-bold tracking-widest rounded uppercase">
                  CRITICAL SEVERITY
                </span>
                <span className="flex items-center gap-1.5 bg-secondary-container text-on-secondary-container px-3 py-1 text-xs font-bold tracking-widest rounded uppercase">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                  Verified Relief
                </span>
                <span className="text-outline text-sm font-medium">Last updated: 14 mins ago</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight text-on-surface">
                Coastal Cyclone <br />
                <span className="text-primary italic">Amara Relief</span>
              </h1>

              <p className="text-xl text-on-surface-variant leading-relaxed font-body max-w-2xl">
                A Category 4 storm has made landfall, affecting over 1.2 million residents across the southeastern
                coastline. Critical infrastructure has been compromised, leaving thousands without shelter or potable
                water. Horizon Relief is coordinating with verified partners to deliver immediate medical aid and
                nutritional support.
              </p>
            </div>

            {/* Status Card */}
            <div className="lg:col-span-5 bg-surface-container-lowest p-8 rounded-xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-9xl">storm</span>
              </div>
              <div className="relative z-10 space-y-8">
                <div>
                  <div className="text-sm font-bold text-outline tracking-widest uppercase mb-1">Impact Stats</div>
                  <div className="text-4xl font-black text-primary tracking-tighter">1.2M+ People</div>
                  <div className="text-on-surface-variant">Estimated displacement and urgent need</div>
                </div>

                <div className="h-px bg-surface-container" />

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-xs font-bold text-outline tracking-widest uppercase">Verified Teams</div>
                    <div className="text-2xl font-bold">42 Active</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-outline tracking-widest uppercase">Supply Chain</div>
                    <div className="text-2xl font-bold text-secondary">Operational</div>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-md shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all duration-300"
                >
                  Support All Active Campaigns
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Map & Context */}
        <section className="max-w-7xl mx-auto px-6 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3 h-[500px] rounded-xl overflow-hidden bg-surface-container shadow-sm relative group">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQxQA14hnV0UmLtgVjRQWu1z1G34xFcBH1NqKDAVFt4mGwzFo_Dxep7DDg-Q_D6DR3cHft9BFMTIvA0LXtvp8oYbVZZza8v20780W-qfe9hAglkW3l4YJ6zFPudLIhFHKq2CqWzPbEFNA-plXAKS6xS5XIh5rwF8-1dih9qtQ7eWSBAU6PRTO25AUkEMtDM38cTnt4cvpcAwE6UN57v-n58ER8DPo5Bk-_KB-9h_NQt_VGJFngsz_oQAdGuzPOsjKW-tXCmDrnyxU"
                alt="High detail topographical map showing storm trajectory"
              />
              <div className="absolute bottom-6 left-6 bg-surface-container-lowest/90 backdrop-blur p-4 rounded-lg shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-tertiary rounded-full animate-pulse" />
                  <div>
                    <div className="text-sm font-bold uppercase tracking-wider">Epicenter Located</div>
                    <div className="text-xs text-outline">District of Valoria &amp; Surrounds</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-1 space-y-6">
              <div className="bg-surface-container-low p-6 rounded-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">info</span>
                  Key Narrative
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed italic">
                  &quot;The storm surged at 3 AM local time. Our priority is the high-density coastal settlements where
                  flooding reached historic levels.&quot;
                </p>
                <div className="mt-4 text-xs font-bold text-on-surface uppercase">
                  — Chief Coordinator, Red Cross
                </div>
              </div>

              <div className="bg-surface-container-low p-6 rounded-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">water_drop</span>
                  Critical Needs
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm font-medium">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Potable Water Kits
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Mobile Medical Units
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Satellite Comm Links
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Active Relief Campaigns (static cards for now) */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8 border-b-2 border-surface-container pb-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight">Active Relief Campaigns</h2>
              <p className="text-on-surface-variant mt-1">
                Direct support for verified on-ground responders
              </p>
            </div>
            <div className="text-sm font-bold text-primary cursor-pointer hover:underline">
              View All 18 Operations
            </div>
          </div>

          {/* You can paste the 3 campaign cards from your Stitch HTML here if needed */}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DisasterDetail;

