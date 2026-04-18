import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { campaignAPI, donationAPI, milestoneAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import NGOLayout from '../../components/NGOLayout';

const CampaignManagement = () => {
  const { campaignId } = useParams();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // All hooks must be called before any conditional returns
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        setLoading(true);
        const [campaignData, donationsData, milestonesData] = await Promise.all([
          campaignAPI.getById(campaignId),
          donationAPI.getByCampaign(campaignId),
          milestoneAPI.getByCampaign(campaignId),
        ]);

        const campaignPayload =
          campaignData.data?.campaign ||
          campaignData.data?.data?.campaign ||
          campaignData.data ||
          campaignData.campaign ||
          null;
        setCampaign(campaignPayload);

        const donationsPayload =
          donationsData.data?.donations ||
          donationsData.data?.data?.donations ||
          donationsData.data ||
          donationsData.donations ||
          [];
        setDonations(Array.isArray(donationsPayload) ? donationsPayload : []);

        const milestonesPayload =
          milestonesData.data?.milestones ||
          milestonesData.data?.data?.milestones ||
          milestonesData.data ||
          milestonesData.milestones ||
          [];
        setMilestones(Array.isArray(milestonesPayload) ? milestonesPayload : []);
      } catch (error) {
        console.error('Error fetching campaign data:', error);
        setCampaign(null);
        setDonations([]);
        setMilestones([]);
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      fetchCampaignData();
    }
  }, [campaignId]);

  // Now conditional returns can happen after all hooks
  if (!user || user.role !== 'NGO') {
    return (
      <NGOLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-4 tracking-tight">Access Denied</h2>
            <p className="text-gray-800 tracking-tight">This page is only available for NGOs.</p>
          </div>
        </div>
      </NGOLayout>
    );
  }

  if (loading) {
    return (
      <NGOLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-800 tracking-tight">Loading campaign data...</p>
          </div>
        </div>
      </NGOLayout>
    );
  }

  if (!campaign) {
    return (
      <NGOLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-4 tracking-tight">Campaign Not Found</h2>
            <Link to="/ngo/campaigns" className="text-primary hover:opacity-80 transition-opacity tracking-tight font-bold">Back to Campaigns</Link>
          </div>
        </div>
      </NGOLayout>
    );
  }

  const progressPercentage = campaign.target_amount > 0
    ? ((campaign.current_amount || 0) / campaign.target_amount) * 100
    : 0;

  return (
    <NGOLayout>
      <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2 tracking-tight">{campaign.title}</h1>
                <p className="text-gray-800 tracking-tight">{campaign.description}</p>
              </div>
              <Link
                to={`/ngo/campaigns/${campaignId}/edit`}
                className="px-6 py-3 bg-gradient-to-r from-primary to-[#001a38] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-bold tracking-tight"
              >
                Edit Campaign
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-6 mb-6">
            <div className="grid md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white border-2 border-primary/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-primary mb-1 tracking-tight">
                  ${(campaign.current_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-gray-800 font-bold tracking-tight">Raised</div>
              </div>
              <div className="bg-white border-2 border-green-500/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600 mb-1 tracking-tight">{donations.length}</div>
                <div className="text-sm text-gray-800 font-bold tracking-tight">Donations</div>
              </div>
              <div className="bg-white border-2 border-blue-500/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-600 mb-1 tracking-tight">{milestones.length}</div>
                <div className="text-sm text-gray-800 font-bold tracking-tight">Milestones</div>
              </div>
              <div className="bg-white border-2 border-orange-500/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-orange-600 mb-1 tracking-tight">{Math.round(progressPercentage)}%</div>
                <div className="text-sm text-gray-800 font-bold tracking-tight">Progress</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 mb-6 overflow-hidden">
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-bold transition tracking-tight ${
                  activeTab === 'overview'
                    ? 'text-primary border-b-4 border-primary bg-primary-fixed/30'
                    : 'text-gray-800 hover:text-primary hover:bg-slate-50'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('donations')}
                className={`px-6 py-4 font-bold transition tracking-tight ${
                  activeTab === 'donations'
                    ? 'text-primary border-b-4 border-primary bg-primary-fixed/30'
                    : 'text-gray-800 hover:text-primary hover:bg-slate-50'
                }`}
              >
                Donations ({donations.length})
              </button>
              <button
                onClick={() => setActiveTab('milestones')}
                className={`px-6 py-4 font-bold transition tracking-tight ${
                  activeTab === 'milestones'
                    ? 'text-primary border-b-4 border-primary bg-primary-fixed/30'
                    : 'text-gray-800 hover:text-primary hover:bg-slate-50'
                }`}
              >
                Milestones ({milestones.length})
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-black mb-4 tracking-tight">Campaign Progress</h2>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-2 tracking-tight">
                      <span className="text-gray-800 font-bold">Target: ${campaign.target_amount.toLocaleString()}</span>
                      <span className="font-bold text-primary">
                        ${(campaign.current_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-primary to-[#001a38] h-4 rounded-full transition-all"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-black mb-4 tracking-tight">Campaign Details</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold tracking-tight ${
                        campaign.status === 'LIVE' ? 'bg-green-100 text-green-700' :
                        campaign.status === 'COMPLETED' ? 'bg-primary-fixed/50 text-primary' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Created</p>
                      <p className="text-black font-bold tracking-tight">
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'donations' && (
              <div>
                <h2 className="text-xl font-bold text-black mb-4 tracking-tight">Donations Received</h2>
                {donations.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold tracking-tight">No donations received yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Donor</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {donations.map((d) => (
                          <tr key={d.donation_id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-bold text-slate-900 tracking-tight">
                              {d.donor_name || 'Anonymous'}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-primary tracking-tight">
                              ${parseFloat(d.amount).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 tracking-tight">
                              {new Date(d.donated_at || d.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm font-mono text-slate-400 tracking-tight">
                              {d.transaction_hash || d.tx_hash ? `${(d.transaction_hash || d.tx_hash).slice(0, 6)}...${(d.transaction_hash || d.tx_hash).slice(-4)}` : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'milestones' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-black tracking-tight">Campaign Milestones</h2>
                  <Link
                    to={`/ngo/campaigns/${campaignId}/milestones`}
                    className="px-4 py-2 bg-primary-fixed/70 text-primary rounded-lg font-bold text-sm hover:bg-primary-fixed transition-all"
                  >
                    Manage Milestones
                  </Link>
                </div>
                {milestones.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold tracking-tight">No milestones added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {milestones.map((m) => (
                      <div key={m.milestone_id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-primary/30 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-900 tracking-tight">{m.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            m.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-primary-fixed/50 text-primary'
                          }`}>
                            {m.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2 tracking-tight">{m.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </NGOLayout>
  );
};

export default CampaignManagement;
