import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { campaignAPI, publicAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import DonorLayout from '../../components/DonorLayout';
import {
  FileText,
  Search,
  Loader2,
  Image as ImageIcon,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  MapPin,
  CalendarDays,
} from 'lucide-react';
import { assets } from '../../assets/assets';

const DonorCampaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('explore');
  const [filter, setFilter] = useState('ALL');

  const uid = user?.user_id || user?.id;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (view === 'explore') {
          const res = await publicAPI.getCampaigns({ page: 1, limit: 60 });
          const list = res.data?.campaigns || res.campaigns || [];
          setCampaigns(Array.isArray(list) ? list : []);
        } else if (uid) {
          const params =
            filter !== 'ALL' ? { creator_user_id: uid, status: filter } : { creator_user_id: uid };
          const response = await campaignAPI.getAll(params);
          const list = response.data?.campaigns || [];
          setCampaigns(Array.isArray(list) ? list : []);
        } else {
          setCampaigns([]);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [view, filter, uid]);

  const getStatusBadge = (status) => {
    const statusMap = {
      LIVE: { bg: 'bg-secondary-container/30', text: 'text-secondary', icon: CheckCircle2, label: 'Live' },
      PENDING_VERIFICATION: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, label: 'Awaiting 20 volunteers' },
      PENDING_NGO_VERIFICATION: { bg: 'bg-primary-fixed/50', text: 'text-primary', icon: Clock, label: 'Awaiting NGO confirmation' },
      PENDING_ADMIN_APPROVAL: { bg: 'bg-primary-container/20', text: 'text-primary-container', icon: Clock, label: 'Awaiting admin review' },
      VERIFIED_BY_VOLUNTEERS: { bg: 'bg-secondary-fixed/50', text: 'text-on-secondary-fixed', icon: CheckCircle2, label: 'Verified - pending admin live' },
      COMPLETED: { bg: 'bg-surface-container-high', text: 'text-on-surface', icon: CheckCircle2, label: 'Completed' },
      CANCELLED: { bg: 'bg-error-container', text: 'text-on-error-container', icon: Clock, label: 'Cancelled' },
    };

    const statusInfo = statusMap[status] || {
      bg: 'bg-surface-container-high',
      text: 'text-on-surface-variant',
      icon: FileText,
      label: status,
    };
    const Icon = statusInfo.icon;

    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${statusInfo.bg} ${statusInfo.text} tracking-tight`}
      >
        <Icon className="w-3 h-3" />
        <span>{statusInfo.label}</span>
      </div>
    );
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const imgFor = (c) =>
    (c.image_urls && c.image_urls[0]) || (c.images && c.images[0]) || null;

  return (
    <DonorLayout>
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-on-surface mb-2 tracking-tight">Campaigns</h1>
              <p className="text-on-surface-variant tracking-tight">
                Explore live relief or track proposals you submitted.
              </p>
            </div>
            <Link
              to="/donor/create-campaign"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-on-primary shadow-md hover:opacity-95"
            >
              <Plus className="w-5 h-5" />
              Propose a campaign
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <button
              type="button"
              onClick={() => setView('explore')}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                view === 'explore' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              Live campaigns
            </button>
            <button
              type="button"
              onClick={() => setView('mine')}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                view === 'mine' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              My proposals
            </button>
          </div>

          {view === 'mine' && (
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-on-surface-variant">Status:</span>
              {['ALL', 'PENDING_NGO_VERIFICATION', 'PENDING_ADMIN_APPROVAL', 'LIVE', 'CANCELLED'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilter(s)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold border ${
                    filter === s
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline-variant text-on-surface-variant'
                  }`}
                >
                  {s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          )}

          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-outline" />
                <input
                  type="text"
                  placeholder="Search…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-outline-variant rounded-xl focus:ring-2 focus:ring-primary bg-surface-container-lowest text-on-surface"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                <p className="text-on-surface-variant tracking-tight">Loading…</p>
              </div>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 p-12 text-center">
              <FileText className="w-16 h-16 text-outline mx-auto mb-4" />
              <h3 className="text-xl font-bold text-on-surface mb-2 tracking-tight">Nothing to show</h3>
              <p className="text-on-surface-variant tracking-tight">
                {view === 'explore'
                  ? 'No live campaigns are available yet.'
                  : 'You have not submitted any proposals, or none match this filter.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign) => {
                const progressPercentage =
                  campaign.target_amount > 0
                    ? ((campaign.current_amount || 0) / campaign.target_amount) * 100
                    : 0;
                const hero = imgFor(campaign);

                return (
                  <div
                    key={campaign.campaign_id}
                    className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="mb-4">
                      {hero ? (
                        <img src={hero} alt="" className="w-full h-48 object-cover rounded-lg mb-4" />
                      ) : campaign.disaster_images?.[0] ? (
                        <img src={campaign.disaster_images[0]} alt="" className="w-full h-48 object-cover rounded-lg mb-4" />
                      ) : (
                        <div className="w-full h-48 bg-primary-fixed/30 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                          <img src={assets.hero1} alt="" className="w-full h-full object-cover opacity-90" />
                        </div>
                      )}

                      <h3 className="text-xl font-bold text-on-surface mb-2 line-clamp-2 tracking-tight">
                        {campaign.title}
                      </h3>
                      
                      <div className="grid gap-2 text-xs text-on-surface-variant mb-4">
                        {campaign.disaster_location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            <span className="font-medium">{campaign.disaster_location}</span>
                          </div>
                        )}
                        {campaign.ngo_name && (
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-primary" />
                            <span className="font-medium">NGO: {campaign.ngo_name}</span>
                          </div>
                        )}
                      </div>
                      
                      {getStatusBadge(campaign.status)}
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2 tracking-tight">
                        <span className="text-primary font-bold">
                          $
                          {(campaign.current_amount || 0).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        <span className="text-on-surface-variant">${campaign.target_amount?.toLocaleString?.() ?? '—'}</span>
                      </div>
                      <div className="w-full bg-surface-container-high rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm mb-4 tracking-tight text-on-surface-variant">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{campaign.ngo_name || 'NGO'}</span>
                      </div>
                    </div>

                    {campaign.status === 'LIVE' && (
                      <Link
                        to={`/campaigns/${campaign.campaign_id}`}
                        className="block w-full text-center px-4 py-3 bg-primary text-on-primary rounded-xl font-bold shadow-sm hover:opacity-95"
                      >
                        View campaign
                      </Link>
                    )}
                    {campaign.status !== 'LIVE' && view === 'mine' && (
                      <p className="text-center text-xs text-on-surface-variant">
                        Visible publicly only after NGO confirmation and admin approval.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DonorLayout>
  );
};

export default DonorCampaigns;
