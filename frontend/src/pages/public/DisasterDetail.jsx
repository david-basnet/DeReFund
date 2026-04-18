import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { disasterAPI } from '../../utils/api';

const statusConfig = {
  PENDING: { label: 'Pending admin approval', badge: 'bg-amber-100 text-amber-800' },
  APPROVED: { label: 'Approved for campaign promotion', badge: 'bg-emerald-100 text-emerald-800' },
  REJECTED: { label: 'Rejected', badge: 'bg-red-100 text-red-700' },
};

const DisasterDetail = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { disasterId } = useParams();
  const [disaster, setDisaster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const loadDisaster = async () => {
      try {
        setLoading(true);
        const response = await disasterAPI.getById(disasterId);
        const data = response.data?.disaster || response.disaster || response.data || response;
        if (!data) {
          setError('Disaster not found.');
          setDisaster(null);
        } else {
          setDisaster(data);
        }
      } catch (err) {
        console.error('Error fetching disaster detail:', err);
        setError(err.message || 'Failed to load disaster details.');
      } finally {
        setLoading(false);
      }
    };
    loadDisaster();
  }, [disasterId]);

  const handlePromote = () => {
    navigate(`/donor/create-campaign?case_id=${disaster.case_id}`);
  };

  if (loading) {
    return (
      <div className="bg-surface text-on-surface selection:bg-primary-fixed">
        <Navbar />
        <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto text-center">Loading disaster details…</main>
        <Footer />
      </div>
    );
  }

  if (error || !disaster) {
    return (
      <div className="bg-surface text-on-surface selection:bg-primary-fixed">
        <Navbar />
        <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
          <div className="rounded-3xl bg-surface-container-lowest p-10 text-center">
            <p className="text-lg font-semibold text-on-surface">{error || 'Disaster details unavailable.'}</p>
            <Link to="/disasters" className="mt-6 inline-flex px-5 py-3 bg-primary text-on-primary rounded-xl font-bold">
              Back to disaster list
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const status = statusConfig[disaster.status] || { label: disaster.status || 'Unknown', badge: 'bg-slate-100 text-slate-700' };

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-fixed">
      <Navbar />

      <main className="pt-24 pb-20 px-6">
        <section className="max-w-7xl mx-auto mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-surface-container-high px-3 py-1 text-xs font-bold tracking-widest rounded-full uppercase text-on-surface-variant">
                  {disaster.severity || 'Medium'} severity
                </span>
                <span className={`px-3 py-1 text-xs font-bold tracking-widest rounded-full uppercase ${status.badge}`}>
                  {status.label}
                </span>
                <span className="text-outline text-sm font-medium">
                  Reported by {disaster.submitted_by_name || 'a community responder'}
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight text-on-surface">
                {disaster.title}
              </h1>

              <p className="text-xl text-on-surface-variant leading-relaxed max-w-3xl">
                {disaster.description}
              </p>
            </div>

            <div className="lg:col-span-5 bg-surface-container-lowest p-8 rounded-3xl shadow-ambient overflow-hidden">
              {disaster.images?.[0] ? (
                <img
                  src={disaster.images[0]}
                  alt={disaster.title}
                  className="w-full h-56 object-cover rounded-3xl mb-6"
                />
              ) : (
                <div className="w-full h-56 rounded-3xl bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-6">
                  No disaster image available
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold text-on-surface-variant uppercase tracking-[0.28em] mb-2">
                    Location
                  </div>
                  <p className="text-lg font-bold text-on-surface">{disaster.location}</p>
                </div>

                {disaster.latitude && disaster.longitude && (
                  <div>
                    <div className="text-sm font-semibold text-on-surface-variant uppercase tracking-[0.28em] mb-2">
                      Coordinates
                    </div>
                    <p className="text-sm text-on-surface">{`${disaster.latitude}, ${disaster.longitude}`}</p>
                  </div>
                )}

                <div>
                  <div className="text-sm font-semibold text-on-surface-variant uppercase tracking-[0.28em] mb-2">
                    Admin review
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    {disaster.status === 'APPROVED'
                      ? 'This disaster is approved and can be promoted into a campaign.'
                      : disaster.status === 'PENDING'
                      ? 'An administrator must approve this disaster before it can be promoted.'
                      : 'This disaster report was rejected and cannot be promoted.'}
                  </p>
                </div>

                {user?.role === 'DONOR' && disaster.status === 'APPROVED' && (
                  <button
                    type="button"
                    onClick={handlePromote}
                    className="w-full py-4 bg-primary text-on-primary rounded-3xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary-container transition-colors"
                  >
                    Promote this disaster to a campaign
                  </button>
                )}

                {user?.role !== 'DONOR' && disaster.status === 'APPROVED' && (
                  <div className="rounded-3xl border border-primary/15 bg-primary/5 p-4 text-sm text-on-surface-variant">
                    Approved disasters can be promoted by donors into NGO-backed campaigns.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            <div className="rounded-3xl bg-surface-container-low p-8 shadow-ambient">
              <h2 className="text-2xl font-bold mb-4">What this means</h2>
              <p className="text-on-surface-variant leading-relaxed">
                Once a disaster report is approved by an administrator, donors can request campaign promotion for this
                case. Donors then choose a verified NGO to review and confirm the campaign before funds are collected.
              </p>
            </div>

            <div className="rounded-3xl bg-surface-container-low p-8 shadow-ambient">
              <h2 className="text-2xl font-bold mb-4">Related campaign flow</h2>
              <ul className="space-y-3 text-on-surface-variant">
                <li>1. Report disaster → admin approves.</li>
                <li>2. Donor selects an NGO for campaign promotion.</li>
                <li>3. NGO confirms the proposal.</li>
                <li>4. Administrator publishes the campaign live.</li>
              </ul>
            </div>
          </div>

          <div className="rounded-3xl bg-surface-container-low p-8 shadow-ambient space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Case submitted by</h3>
              <p className="text-sm text-on-surface-variant">{disaster.submitted_by_name || 'Community or donor volunteer'}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Reported</h3>
              <p className="text-sm text-on-surface-variant">{new Date(disaster.created_at).toLocaleDateString()}</p>
            </div>
            {disaster.video && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Video evidence</h3>
                <a
                  href={disaster.video}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary font-semibold hover:underline"
                >
                  View submitted video
                </a>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DisasterDetail;

