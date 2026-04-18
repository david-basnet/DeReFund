import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { publicAPI } from '../../utils/api';
import { assets } from '../../assets/assets';

function formatUsd(n) {
  const x = Number(n) || 0;
  return x.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

const BrowseCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 9;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await publicAPI.getCampaigns({ page, limit, search: search.trim() });
        const list = res.data?.campaigns || res.campaigns || [];
        const t = res.data?.total ?? res.total ?? list.length;
        if (!cancelled) {
          setCampaigns(Array.isArray(list) ? list : []);
          setTotal(typeof t === 'number' ? t : parseInt(t, 10) || 0);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setCampaigns([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const id = setTimeout(load, search ? 300 : 0);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [page, search]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  return (
    <div className="bg-surface font-body text-on-surface">
      <Navbar />

      <main className="pt-24 pb-16 min-h-screen">
        <header className="max-w-screen-2xl mx-auto px-6 mb-12">
          <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-10 md:p-16 border border-outline-variant/15">
            <div className="relative z-10 max-w-2xl">
              <span className="text-primary font-bold tracking-widest text-xs uppercase mb-4 block">
                Crowdfunding reimagined
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-on-surface tracking-tighter mb-6 leading-none">
                Live relief campaigns
              </h1>
              <p className="text-lg text-on-surface-variant leading-relaxed max-w-xl">
                Support active disaster relief efforts. All campaigns here are administrator-approved and ready to collect donations.
              </p>
            </div>
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-[20rem] absolute -right-20 -top-20">public</span>
            </div>
          </div>
        </header>

        <section className="max-w-screen-2xl mx-auto px-6 mb-12">
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/15">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline">search</span>
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                className="w-full bg-surface-container-high border-none rounded-md py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary text-sm text-on-surface"
                placeholder="Search by title, disaster, NGO, or location…"
              />
            </div>
          </div>
        </section>

        <section className="max-w-screen-2xl mx-auto px-6">
          {loading ? (
            <p className="text-center text-on-surface-variant py-12">Loading campaigns…</p>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-16 bg-surface-container-low rounded-xl border border-outline-variant/15">
              <p className="text-on-surface-variant">No live campaigns match your search.</p>
              <Link to="/" className="inline-block mt-4 text-primary font-semibold hover:underline">
                Back home
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {campaigns.map((c) => {
                const img =
                  (c.image_urls && c.image_urls[0]) ||
                  (c.disaster_images && c.disaster_images[0]);
                const hasVideo = !!c.disaster_video;
                const raised = Number(c.current_amount) || 0;
                const target = Number(c.target_amount) || 1;
                const pct = Math.min(100, Math.round((raised / target) * 100));
                return (
                  <article
                    key={c.campaign_id}
                    className="group bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-[0px_20px_40px_rgba(25,28,29,0.06)] transition-all duration-300 border border-outline-variant/15"
                  >
                    <Link to={`/campaigns/${c.campaign_id}`} className="block">
                      <div className="relative h-56 overflow-hidden bg-surface-container-high">
                        {img ? (
                          <img
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            src={img}
                            alt=""
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-on-surface-variant opacity-20">
                            <span className="material-symbols-outlined text-6xl">image</span>
                          </div>
                        )}
                        <div className="absolute top-4 left-4 flex gap-2">
                          <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-sm shadow-lg">
                            Live
                          </span>
                          {hasVideo && (
                            <span className="bg-black/60 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-sm shadow-lg flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">play_circle</span>
                              Video
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="material-symbols-outlined text-secondary text-sm">verified</span>
                          <span className="text-xs font-semibold text-outline tracking-wider uppercase truncate">
                            {c.ngo_name || 'NGO'}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-on-surface mb-4 leading-tight line-clamp-2">{c.title}</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-end">
                              <span className="text-2xl font-black text-primary tracking-tighter">{formatUsd(raised)}</span>
                              <span className="text-xs font-bold text-outline">Goal {formatUsd(target)}</span>
                            </div>
                            <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <span className="inline-flex w-full items-center justify-center primary-gradient text-on-primary py-3 rounded-md font-bold text-sm">
                            View campaign
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && campaigns.length > 0 && (
            <div className="mt-16 flex flex-col items-center justify-center gap-4">
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-md border border-outline-variant bg-surface-container-highest px-4 py-2 text-sm font-semibold disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-on-surface-variant">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-md border border-outline-variant bg-surface-container-highest px-4 py-2 text-sm font-semibold disabled:opacity-40"
                >
                  Next
                </button>
              </div>
              <p className="text-xs text-outline font-medium tracking-widest uppercase">
                Showing {campaigns.length} of {total} live campaigns
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BrowseCampaigns;
