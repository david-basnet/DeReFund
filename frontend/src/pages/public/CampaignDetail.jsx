import { useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const CampaignDetail = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="bg-surface font-body text-on-surface">
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Campaign Hero */}
          <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            <div className="lg:col-span-8 relative">
              <div className="rounded-xl overflow-hidden aspect-[16/9] shadow-lg bg-surface-container-high">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwxbbXZVRFJCLdJKAXJ4gH4yFOYhFopuwTG7HnwQHi9JqilZ-fpnwzv5p4yzDPojYwK6HXl4DMckDAR7CpLP-3GlVrobmpnYsZfyk_a2TUyoRnDrKmZGKSNPdN6GBmpOutJ2BiC3FVLws34ab-Vhl71l4pejS8m9kY08dngAbzeHPW5CcloAvZzAKqOuChY_Rqrbl2YTosIZEiiZiIVZYGLG0tRP06lSrPRq5b_-J6G39Pu6DX_kf2fA6Xq49ryStSfrikSr7UDyI"
                  alt="Emergency relief action"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                      fiber_manual_record
                    </span>
                    LIVE
                  </span>
                  <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-xs">emergency</span>
                    URGENT
                  </span>
                </div>
              </div>
            </div>

            {/* Donation Sidebar */}
            <div className="lg:col-span-4">
              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_20px_40px_rgba(25,28,29,0.06)] h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-3xl font-black text-on-surface tracking-tighter">$142,500</span>
                    <span className="text-on-surface-variant text-sm font-medium mb-1">of $250,000 goal</span>
                  </div>
                  <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden mb-6">
                    <div className="h-full primary-gradient" style={{ width: '57%' }} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-surface-container-low p-4 rounded-lg">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                        Donors
                      </p>
                      <p className="text-xl font-bold">1,248</p>
                    </div>
                    <div className="bg-surface-container-low p-4 rounded-lg">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                        Days Left
                      </p>
                      <p className="text-xl font-bold">12</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    type="button"
                    className="w-full primary-gradient text-on-primary py-4 rounded-md font-bold text-lg shadow-lg active:scale-95 duration-150 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">favorite</span>
                    Donate Now
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 py-3 bg-surface-container-highest text-on-surface font-semibold text-sm rounded-md hover:bg-surface-dim transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">share</span>
                      Share
                    </button>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 py-3 bg-surface-container-highest text-on-surface font-semibold text-sm rounded-md hover:bg-surface-dim transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">bookmark</span>
                      Save
                    </button>
                  </div>
                  <p className="text-[10px] text-center text-outline leading-relaxed mt-4">
                    Fully transparent. Funds are released only upon milestone verification by donors.
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-12">
              {/* Title & NGO Info */}
              <section>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-on-surface mb-4 leading-tight">
                  Coastal Flood Relief: Restoration for the Sundarbans Region
                </h1>
                <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex-shrink-0">
                    <img
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjO6K00HjIZlk25mAjG_oJjtoHMEWbzpTseVO8CqL-MF082V9Y2pNGm1qVoe21SB9XuI7k0pjZVwZnRU4cAP-n5l895lxYOYcnM_JVPPfgRiY-fdhFz3gMxt-2KhSNOXabcz3W2TtKzFpPYJIGdqI3vOlbVKznE2GHciQ_KwoMywN5gSbhtOi5DFThqiEHsLLTcSSkWiplm1H1V4eNzPvfNQUwPVon74N_cqeGkAxgA6_75_T3_5E2_FXDtpin44YpkPmoZEbwyWU"
                      alt="Global Green Aid logo"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-on-surface">Global Green Aid</span>
                      <span
                        className="material-symbols-outlined text-blue-600 text-lg"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        verified
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">
                      Verified Humanitarian Partner
                    </p>
                  </div>
                  <button
                    type="button"
                    className="ml-auto text-primary text-xs font-bold uppercase tracking-widest hover:underline"
                  >
                    View NGO Profile
                  </button>
                </div>
              </section>

              {/* About Campaign */}
              <section>
                <h3 className="text-xl font-black tracking-tight mb-4 uppercase text-on-surface-variant">
                  About the Campaign
                </h3>
                <div className="max-w-none text-on-surface leading-relaxed text-lg">
                  <p className="mb-6">
                    The recent super-cyclone has devastated over 40 coastal villages in the Sundarbans region. With
                    homes destroyed and saltwater contaminating local drinking wells, the immediate focus is on emergency
                    survival and long-term sanitation infrastructure.
                  </p>
                  <p>
                    Our mission is two-fold: immediate delivery of 5,000 emergency ration kits and the reconstruction of
                    12 community water filtration plants. Every dollar donated goes directly toward these procurement and
                    labor costs, tracked on-chain for total visibility.
                  </p>
                </div>
              </section>

              {/* Milestones Timeline */}
              <section className="bg-surface-container-low p-8 rounded-2xl">
                <h3 className="text-xl font-black tracking-tight mb-8 uppercase text-on-surface-variant">
                  Restoration Milestones
                </h3>
                <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant">
                  {/* Milestone 1 */}
                  <div className="relative pl-12">
                    <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-on-secondary z-10 shadow-md">
                      <span className="material-symbols-outlined text-xl">check</span>
                    </div>
                    <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border-l-4 border-secondary">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg">Emergency Food &amp; Water Kits</h4>
                        <span className="bg-secondary/10 text-secondary px-2 py-1 rounded text-[10px] font-black uppercase">
                          COMPLETED
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant mb-4">
                        Distribution of 5,000 high-calorie meal blocks and 10,000 liters of bottled water to the
                        hardest-hit villages.
                      </p>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest hover:gap-3 transition-all"
                      >
                        View Impact Report <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                  </div>

                  {/* Milestone 2 */}
                  <div className="relative pl-12">
                    <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary z-10 shadow-md">
                      <span className="material-symbols-outlined text-xl">autorenew</span>
                    </div>
                    <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border-l-4 border-primary">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg">Sanitation Plant Construction</h4>
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-black uppercase">
                          IN PROGRESS
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant mb-4">
                        Breaking ground on the first 6 filtration centers. Materials are being shipped from the central
                        hub today.
                      </p>
                      <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full" style={{ width: '35%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Milestone 3 */}
                  <div className="relative pl-12">
                    <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-surface-container-highest border-2 border-outline-variant flex items-center justify-center text-outline z-10">
                      <span className="material-symbols-outlined text-xl">lock</span>
                    </div>
                    <div className="bg-surface-container-lowest p-5 rounded-xl opacity-60 border-l-4 border-outline-variant">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg">Permanent Shelter Rebuilding</h4>
                        <span className="bg-surface-container-high text-outline px-2 py-1 rounded text-[10px] font-black uppercase">
                          UPCOMING
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant">
                        Long-term housing for 120 displaced families using flood-resistant materials.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              {/* Verification Status */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-blue-600"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified_user
                  </span>
                  Donor Verification
                </h4>
                <div className="text-center py-6 border-2 border-dashed border-outline-variant rounded-xl mb-4">
                  <span className="text-4xl font-black text-on-surface">412</span>
                  <p className="text-xs font-bold text-on-surface-variant uppercase mt-1">Verified Donors</p>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed text-center px-4">
                  These donors have confirmed receipt of aid on the ground or via secondary evidence. Join the
                  verification squad after donating.
                </p>
              </div>

              {/* Recent Donations */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-6">
                  Recent Donations
                </h4>
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">person</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold">Anonymous Donor</p>
                      <p className="text-xs text-on-surface-variant">2 hours ago</p>
                    </div>
                    <span className="ml-auto font-black text-primary">$500</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">person</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold">Sarah Jenkins</p>
                      <p className="text-xs text-on-surface-variant">5 hours ago</p>
                    </div>
                    <span className="ml-auto font-black text-primary">$1,200</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">person</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold">Marcus Thorne</p>
                      <p className="text-xs text-on-surface-variant">8 hours ago</p>
                    </div>
                    <span className="ml-auto font-black text-primary">$50</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full mt-8 py-3 text-xs font-black uppercase tracking-widest border border-outline-variant rounded-md hover:bg-surface-container-low transition-colors"
                >
                  View Transaction Ledger
                </button>
              </div>

              {/* Location Context */}
              <div className="bg-surface-container-high rounded-xl overflow-hidden h-64 relative group cursor-pointer">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3H6nmYlYCo66VLqcAhP_OhSzTBHF47vx0BVZRIyj27KzBFjVfWksyZL-BhpWoKc11W_8HGpHqfxN6SwceSA9UJi43jDIuYbXjFfsm-RKbsk2jWmLeeurcCC-GxYM2N9gzeajv5WqYqQON7BPnHnsNVCdnA2OmN0w6cJIacxOfyNBVhP-5UraAoW8WIBeY9C3IeTbezH3QeWDgBVD0u6IPiBe-zm0hZOo87v_fX1S0EcydKPHJWXW_u0F1nAAc4z6Mu1sfkGjALoo"
                  alt="Sundarbans, Bangladesh map"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 to-transparent flex items-end p-4">
                  <div>
                    <h5 className="text-white font-bold text-sm">Sundarbans, Bangladesh</h5>
                    <p className="text-white/80 text-xs">Coastal Delta Region</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Campaigns */}
          <section className="mt-20">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-black tracking-tighter text-on-surface">Related Campaigns</h2>
                <p className="text-on-surface-variant text-sm font-medium">
                  Similar humanitarian efforts that need your help.
                </p>
              </div>
              <button
                type="button"
                className="text-primary font-bold text-sm uppercase tracking-widest hover:underline"
              >
                See All Campaigns
              </button>
            </div>

            {/* Placeholder related cards – you can replace with real data later */}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CampaignDetail;

