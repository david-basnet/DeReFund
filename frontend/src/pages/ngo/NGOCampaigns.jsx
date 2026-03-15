import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { campaignAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import NGOLayout from '../../components/NGOLayout';
import { Edit, Image as ImageIcon, Loader2, CheckCircle2, Clock, AlertCircle, FileText } from 'lucide-react';

const NGOCampaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

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

  const getStatusBadge = (status) => {
    const statusMap = {
      LIVE: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2, label: 'Live' },
      PENDING_VERIFICATION: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Pending Verification' },
      PENDING_ADMIN_APPROVAL: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock, label: 'Pending Admin Approval' },
      VERIFIED_BY_VOLUNTEERS: { bg: 'bg-purple-100', text: 'text-purple-700', icon: CheckCircle2, label: 'Verified' },
      COMPLETED: { bg: 'bg-gray-100', text: 'text-gray-700', icon: CheckCircle2, label: 'Completed' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle, label: 'Cancelled' },
    };
    const config = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock, label: status };
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text} font-dmsans tracking-tight`}>
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
            <h1 className="text-4xl font-bold text-black mb-2 font-playfair tracking-tight">My Campaigns</h1>
            <p className="text-black font-dmsans tracking-tight">Manage and track all your fundraising campaigns</p>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {['ALL', 'LIVE', 'PENDING_VERIFICATION', 'PENDING_ADMIN_APPROVAL', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors font-dmsans tracking-tight ${
                  filter === status
                    ? 'bg-purple text-white border-2 border-purple'
                    : 'bg-white text-black hover:bg-purple-50 border-2 border-slate-300 hover:border-purple-300'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-purple animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-dmsans tracking-tight">Loading campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-purple-100">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2 font-playfair tracking-tight">No campaigns found</h3>
            <p className="text-slate-600 font-dmsans tracking-tight">
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
                  className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="mb-4">
                    {campaign.images && campaign.images[0] ? (
                      <img 
                        src={campaign.images[0]} 
                        alt={campaign.title} 
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    ) : (
                      <div className="w-full h-48 bg-purple-50 rounded-lg mb-4 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-purple-300" />
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 font-playfair tracking-tight">
                      {campaign.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3 font-dmsans tracking-tight">
                      {campaign.description}
                    </p>
                    {getStatusBadge(campaign.status)}
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2 font-dmsans tracking-tight">
                      <span className="text-purple font-bold">
                        ${(campaign.current_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-slate-600">
                        ${campaign.target_amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple to-light-purple h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-dmsans tracking-tight">
                      {Math.round(progressPercentage)}% funded
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/ngo/campaigns/${campaign.campaign_id}`}
                      className="flex-1 text-center px-4 py-2 bg-purple-50 text-purple border-2 border-purple-200 rounded-lg hover:bg-purple-100 hover:border-purple-300 transition-colors font-bold text-sm font-dmsans tracking-tight"
                    >
                      Manage
                    </Link>
                    {campaign.status === 'DRAFT' && (
                      <Link
                        to={`/ngo/campaigns/${campaign.campaign_id}/edit`}
                        className="flex-1 text-center px-4 py-2 bg-slate-100 text-black border-2 border-slate-300 rounded-lg hover:bg-slate-200 hover:border-slate-400 transition-colors font-bold text-sm font-dmsans tracking-tight"
                      >
                        Edit
                      </Link>
                    )}
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
