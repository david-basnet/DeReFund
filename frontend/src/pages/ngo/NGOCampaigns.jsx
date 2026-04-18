import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { campaignAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import NGOLayout from '../../components/NGOLayout';
import { Edit, Image as ImageIcon, Loader2, CheckCircle2, Clock, AlertCircle, FileText } from 'lucide-react';
import { assets } from '../../assets/assets';

const NGOCampaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [acting, setActing] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCampaigns();
  }, [user, filter]);

  const fetchCampaigns = async () => {
    const userId = user?.user_id || user?.id;
    if (!userId) return;

    try {
      setLoading(true);
      const response = await campaignAPI.getAll({ ngo_id: userId });
      const campaignsData = Array.isArray(response.data?.campaigns) 
        ? response.data.campaigns 
        : [];
      
      let filtered = campaignsData;
      if (filter !== 'ALL') {
        filtered = campaignsData.filter(c => c.status === filter);
      }
      
      setCampaigns(filtered);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNgoDecision = async (campaignId, approved) => {
    setActing(`${campaignId}-${approved}`);
    try {
      await campaignAPI.ngoConfirm(campaignId, approved);
      await fetchCampaigns();
    } catch (e) {
      console.error(e);
      alert(e.message || 'Action failed');
    } finally {
      setActing(null);
    }
  };

  const getStatusBadge = (status, threshold = 20) => {
    const statusMap = {
      LIVE: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2, label: 'Live' },
      PENDING_NGO_VERIFICATION: { bg: 'bg-primary-fixed/50', text: 'text-primary', icon: Clock, label: 'Needs your confirmation' },
      PENDING_VERIFICATION: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, label: `Awaiting ${threshold} volunteers` },
      PENDING_ADMIN_APPROVAL: { bg: 'bg-primary-fixed/50', text: 'text-primary', icon: Clock, label: 'Pending admin review' },
      VERIFIED_BY_VOLUNTEERS: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle2, label: 'Verified - pending admin live' },
      COMPLETED: { bg: 'bg-gray-100', text: 'text-gray-700', icon: CheckCircle2, label: 'Completed' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle, label: 'Cancelled' },
    };
    const config = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock, label: status };
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text} tracking-tight`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  return (
    <NGOLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-black mb-2 tracking-tight">My Campaigns</h1>
            <p className="text-black tracking-tight">Manage and track all your fundraising campaigns</p>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {['ALL', 'LIVE', 'PENDING_NGO_VERIFICATION', 'PENDING_VERIFICATION', 'PENDING_ADMIN_APPROVAL', 'COMPLETED'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full font-bold text-xs transition-all uppercase tracking-wider ${
                  filter === status
                    ? 'bg-primary text-on-primary shadow-md border-2 border-primary'
                    : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-primary/50'
                }`}
              >
                {status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-slate-600 tracking-tight">Loading campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-outline-variant/30">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">No campaigns found</h3>
            <p className="text-slate-600 tracking-tight">
              {filter === 'ALL' 
                ? "You haven't created any campaigns yet." 
                : `No campaigns with status "${filter.replace('_', ' ')}"`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => {
              const progressPercentage = campaign.target_amount > 0 
                ? ((campaign.current_amount || 0) / campaign.target_amount) * 100 
                : 0;
              
              return (
                <div
                  key={campaign.campaign_id}
                  className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-6 hover:border-primary hover:shadow-lg transition-all"
                >
                  <div className="mb-4">
                    {campaign.image_urls && campaign.image_urls[0] ? (
                      <img
                        src={campaign.image_urls[0]}
                        alt={campaign.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    ) : campaign.images && campaign.images[0] ? (
                      <img
                        src={campaign.images[0]}
                        alt={campaign.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    ) : campaign.disaster_images && campaign.disaster_images[0] ? (
                      <img
                        src={campaign.disaster_images[0]}
                        alt={campaign.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    ) : (
                      <div className="w-full h-48 rounded-lg mb-4 overflow-hidden bg-primary-fixed/30 flex items-center justify-center">
                        <img src={assets.hero1} alt="" className="w-full h-full object-cover opacity-90" />
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 tracking-tight">
                      {campaign.title}
                    </h3>
                    {campaign.creation_source === 'DONOR' && campaign.creator_name && (
                      <p className="text-xs font-semibold text-primary mb-1">
                        Proposed by donor: {campaign.creator_name}
                      </p>
                    )}
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3 tracking-tight">
                      {campaign.description}
                    </p>
                    {getStatusBadge(campaign.status, campaign.verification_threshold)}
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2 tracking-tight">
                      <span className="text-primary font-bold">
                        ${(campaign.current_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-slate-600">
                        ${campaign.target_amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-primary to-[#001a38] h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1 tracking-tight">
                      {Math.round(progressPercentage)}% funded
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {campaign.status === 'PENDING_NGO_VERIFICATION' && (
                      <div className="flex gap-2 mb-1">
                        <button
                          type="button"
                          disabled={!!acting}
                          onClick={() => handleNgoDecision(campaign.campaign_id, true)}
                          className="flex-1 text-center px-3 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm disabled:opacity-50 hover:bg-slate-800 transition-colors"
                        >
                          {acting === `${campaign.campaign_id}-true` ? '…' : 'Confirm'}
                        </button>
                        <button
                          type="button"
                          disabled={!!acting}
                          onClick={() => handleNgoDecision(campaign.campaign_id, false)}
                          className="flex-1 text-center px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm disabled:opacity-50 hover:bg-slate-50 transition-colors"
                        >
                          {acting === `${campaign.campaign_id}-false` ? '…' : 'Decline'}
                        </button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Link
                        to={`/ngo/campaigns/${campaign.campaign_id}`}
                        className="flex-1 text-center px-4 py-2 bg-primary-fixed/70 text-primary rounded-lg hover:bg-primary-fixed transition-all font-bold text-sm tracking-tight"
                      >
                        Manage
                      </Link>
                      {campaign.status === 'DRAFT' && (
                        <Link
                          to={`/ngo/campaigns/${campaign.campaign_id}/edit`}
                          className="flex-1 text-center px-4 py-2 bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-200 transition-colors font-bold text-sm tracking-tight"
                        >
                          Edit
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </NGOLayout>
  );
};

export default NGOCampaigns;
