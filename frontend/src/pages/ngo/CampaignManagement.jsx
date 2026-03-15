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
            <h2 className="text-2xl font-bold text-black mb-4 font-playfair tracking-tight">Access Denied</h2>
            <p className="text-gray-800 font-dmsans tracking-tight">This page is only available for NGOs.</p>
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-800 font-dmsans tracking-tight">Loading campaign data...</p>
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
            <h2 className="text-2xl font-bold text-black mb-4 font-playfair tracking-tight">Campaign Not Found</h2>
            <Link to="/ngo/campaigns" className="text-purple hover:text-light-purple underline-animate font-dmsans tracking-tight font-bold">Back to Campaigns</Link>
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
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2 font-playfair tracking-tight">{campaign.title}</h1>
                <p className="text-gray-800 font-dmsans tracking-tight">{campaign.description}</p>
              </div>
              <Link
                to={`/ngo/campaigns/${campaignId}/edit`}
                className="px-6 py-3 bg-gradient-to-r from-purple to-light-purple text-white rounded-xl hover-lift shadow-lg transition-all duration-300 font-bold font-dmsans tracking-tight"
              >
                Edit Campaign
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white border-2 border-purple/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple mb-1 font-playfair tracking-tight">
                  ${(campaign.current_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-gray-800 font-dmsans tracking-tight">Raised</div>
              </div>
              <div className="bg-white border-2 border-green-500/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600 mb-1 font-playfair tracking-tight">{donations.length}</div>
                <div className="text-sm text-gray-800 font-dmsans tracking-tight">Donations</div>
              </div>
              <div className="bg-white border-2 border-purple/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple mb-1 font-playfair tracking-tight">{milestones.length}</div>
                <div className="text-sm text-gray-800 font-dmsans tracking-tight">Milestones</div>
              </div>
              <div className="bg-white border-2 border-orange-500/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600 mb-1 font-playfair tracking-tight">{Math.round(progressPercentage)}%</div>
                <div className="text-sm text-gray-800 font-dmsans tracking-tight">Progress</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-bold transition font-dmsans tracking-tight ${
                  activeTab === 'overview'
                    ? 'text-purple border-b-2 border-purple'
                    : 'text-gray-800 hover:text-purple'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('donations')}
                className={`px-6 py-4 font-bold transition font-dmsans tracking-tight ${
                  activeTab === 'donations'
                    ? 'text-purple border-b-2 border-purple'
                    : 'text-gray-800 hover:text-purple'
                }`}
              >
                Donations ({donations.length})
              </button>
              <button
                onClick={() => setActiveTab('milestones')}
                className={`px-6 py-4 font-bold transition font-dmsans tracking-tight ${
                  activeTab === 'milestones'
                    ? 'text-purple border-b-2 border-purple'
                    : 'text-gray-800 hover:text-purple'
                }`}
              >
                Milestones ({milestones.length})
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-black mb-4 font-playfair tracking-tight">Campaign Progress</h2>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-2 font-dmsans tracking-tight">
                      <span className="text-gray-800">Target: ${campaign.target_amount.toLocaleString()}</span>
                      <span className="font-bold text-purple">
                        ${(campaign.current_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="w-full bg-gray rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-purple to-light-purple h-4 rounded-full transition-all"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-black mb-4 font-playfair tracking-tight">Campaign Details</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-800 font-dmsans tracking-tight">Status</p>
                      <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-bold font-dmsans tracking-tight ${
                        campaign.status === 'LIVE' ? 'bg-green-100 text-green-700' :
                        campaign.status === 'COMPLETED' ? 'bg-purple/10 text-purple' :
                        'bg-gray text-black'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 font-dmsans tracking-tight">Created</p>
                      <p className="text-black mt-1 font-dmsans tracking-tight">
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'donations' && (
              <div>
                <h2 className="text-xl font-bold text-black mb-4 font-playfair tracking-tight">Donations Received</h2>
                {donations.length === 0 ? (
                  <p className="text-gray-800 text-center py-8 font-dmsans tracking-tight">No donations yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-purple to-light-purple">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-bold text-white font-dmsans tracking-tight">Donor</th>
                          <th className="px-6 py-3 text-left text-sm font-bold text-white font-dmsans tracking-tight">Amount</th>
                          <th className="px-6 py-3 text-left text-sm font-bold text-white font-dmsans tracking-tight">Date</th>
                          <th className="px-6 py-3 text-left text-sm font-bold text-white font-dmsans tracking-tight">Transaction</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {donations.map((donation) => (
                          <tr key={donation.donation_id} className="hover:bg-light-gray">
                            <td className="px-6 py-4 text-black font-dmsans tracking-tight">
                              {donation.donor?.name || 'Anonymous'}
                            </td>
                            <td className="px-6 py-4 font-bold text-purple font-dmsans tracking-tight">
                              ${parseFloat(donation.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 text-gray-800 font-dmsans tracking-tight">
                              {new Date(donation.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              {donation.tx_hash ? (
                                <a
                                  href={`https://polygonscan.com/tx/${donation.tx_hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple hover:text-light-purple underline-animate text-sm font-dmsans tracking-tight font-bold"
                                >
                                  View
                                </a>
                              ) : (
                                <span className="text-gray-800 text-sm font-dmsans tracking-tight">Pending</span>
                              )}
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
                <h2 className="text-xl font-bold text-black mb-4 font-playfair tracking-tight">Milestones</h2>
                {milestones.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-800 mb-4 font-dmsans tracking-tight">No milestones created yet.</p>
                    <button className="px-6 py-3 bg-gradient-to-r from-purple to-light-purple text-white rounded-xl hover-lift shadow-lg transition-all duration-300 font-bold font-dmsans tracking-tight">
                      Create Milestone
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {milestones.map((milestone, index) => (
                      <div key={milestone.milestone_id} className="border-2 border-gray rounded-lg p-4 hover:border-purple transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="w-8 h-8 bg-gradient-to-br from-purple to-light-purple text-white rounded-full flex items-center justify-center font-bold font-dmsans tracking-tight">
                                {index + 1}
                              </span>
                              <h3 className="font-bold text-black font-playfair tracking-tight">{milestone.title}</h3>
                            </div>
                            <p className="text-gray-800 text-sm mb-2 font-dmsans tracking-tight">{milestone.description}</p>
                            <div className="flex items-center space-x-4 text-sm font-dmsans tracking-tight">
                              <span className="text-gray-800">
                                Amount: <span className="font-bold text-purple">${milestone.amount_to_release?.toLocaleString() || '0'}</span>
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                milestone.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                milestone.status === 'SUBMITTED' ? 'bg-yellow/20 text-yellow-700' :
                                'bg-gray text-black'
                              }`}>
                                {milestone.status}
                              </span>
                            </div>
                          </div>
                        </div>
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
