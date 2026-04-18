import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { disasterAPI } from '../../utils/api';

const getStatusBadge = (status) => {
  const map = {
    PENDING: { label: 'Pending approval', style: 'bg-amber-100 text-amber-800' },
    APPROVED: { label: 'Approved for campaigns', style: 'bg-emerald-100 text-emerald-800' },
    REJECTED: { label: 'Rejected', style: 'bg-red-100 text-red-700' },
  };
  return map[status] || { label: status || 'Unknown', style: 'bg-slate-100 text-slate-700' };
};

const BrowseDisasters = () => {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const loadDisasters = async () => {
      try {
        setLoading(true);
        const response = await disasterAPI.getAll({ limit: 24 });
        const data = response.data?.disasters || response.disasters || response.data || response;
        setDisasters(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading disasters:', error);
        setDisasters([]);
      } finally {
        setLoading(false);
      }
    };
    loadDisasters();
  }, []);

  const filteredDisasters = disasters.filter((disaster) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      disaster.title?.toLowerCase().includes(query) ||
      disaster.location?.toLowerCase().includes(query) ||
      disaster.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      <Navbar />

      <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
        <header className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-4 block">
                Active Response Registry
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight text-on-surface mb-6">
                Global Disaster <br />
                <span className="text-primary">Catalog</span>
              </h1>
              <p className="text-lg text-on-surface-variant max-w-xl leading-relaxed">
                Explore disaster cases that are reported, approved, and ready to be promoted into donor-backed campaigns.
              </p>
            </div>
            <div className="lg:col-span-5 flex justify-end">
              <div className="bg-surface-container-high p-6 rounded-xl w-full max-w-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-on-surface-variant">Disaster cases</span>
                  <span className="text-sm font-semibold text-primary">{disasters.length}</span>
                </div>
                <div className="text-4xl font-black tracking-tight text-on-surface">
                  {loading ? '...' : disasters.length}
                </div>
                <div className="mt-2 text-xs text-on-surface-variant font-medium uppercase tracking-wider">
                  Total reported cases
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="mb-8">
          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xl flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[240px] relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-container-high border-none rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary text-on-surface transition-all placeholder:text-outline-variant"
                placeholder="Search by disaster title, location, or description..."
              />
            </div>
            <Link
              to="/donor/report-disaster"
              className="px-5 py-3 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors"
            >
              Report a disaster
            </Link>
          </div>
        </section>

        {loading ? (
          <div className="text-center py-20 text-on-surface-variant">Loading disasters...</div>
        ) : filteredDisasters.length === 0 ? (
          <div className="text-center py-20 text-on-surface-variant">No disasters match your search.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDisasters.map((disaster) => {
              const status = getStatusBadge(disaster.status);
              return (
                <article
                  key={disaster.case_id}
                  className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant/20 overflow-hidden transition hover:shadow-ambient"
                >
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    {disaster.images?.[0] ? (
                      <img
                        src={disaster.images[0]}
                        alt={disaster.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">No image available</div>
                    )}
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-outline uppercase tracking-[0.24em] mb-1">{disaster.location}</div>
                        <h2 className="text-xl font-bold text-on-surface line-clamp-2">{disaster.title}</h2>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${status.style}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant line-clamp-3">{disaster.description}</p>
                    <div className="flex items-center justify-between text-xs text-on-surface-variant uppercase tracking-[0.2em]">
                      <span>Severity: {disaster.severity || 'Unknown'}</span>
                      <Link
                        to={`/disasters/${disaster.case_id}`}
                        className="text-primary font-semibold hover:underline"
                      >
                        View details
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BrowseDisasters;

