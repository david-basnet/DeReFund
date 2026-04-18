import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { volunteerVerificationAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import DonorLayout from '../../components/DonorLayout';
import AdminLayout from '../../components/AdminLayout';
import { ShieldCheck, Users, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

const VolunteerVoting = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await volunteerVerificationAPI.getPendingCampaigns({ limit: 100 });
      setCampaigns(response.data?.campaigns || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (campaignId) => {
    try {
      setVerifyingId(campaignId);
      await volunteerVerificationAPI.verifyCampaign(campaignId);
      await fetchCampaigns(); // Refresh the list
    } catch (error) {
      console.error('Error verifying campaign:', error);
      alert(error.message || 'Failed to verify campaign');
    } finally {
      setVerifyingId(null);
    }
  };

  const Content = (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-primary-fixed/70 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-black mb-2 tracking-tight">Volunteer Voting</h1>
              <p className="text-gray-700 text-lg tracking-tight">
                Participate in the community trust process by voting to verify campaigns. A campaign requires volunteer votes to proceed.
              </p>
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-gray-800 tracking-tight">Loading campaigns...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12">
              <ShieldCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-black mb-2 tracking-tight">No Campaigns Pending Verification</h3>
              <p className="text-gray-700 tracking-tight">
                All campaigns have been verified or there are no campaigns awaiting verification at the moment.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => {
                const verificationCount = campaign.verification_count || 0;
                const threshold = campaign.verification_threshold || 20;
                const progress = (verificationCount / threshold) * 100;
                const isFullyVerified = verificationCount >= threshold;
                const hasVoted = campaign.has_verified;

                return (
                  <div
                    key={campaign.campaign_id}
                    className="bg-white border-2 border-gray rounded-xl p-6 hover:border-purple hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-black tracking-tight flex-1">
                        {campaign.title}
                      </h3>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold tracking-tight">
                        Pending
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-4 line-clamp-3 tracking-tight text-sm">
                      {campaign.description}
                    </p>

                    {campaign.disaster_title && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600 tracking-tight mb-1">Related Disaster:</div>
                        <div className="font-bold text-black tracking-tight">{campaign.disaster_title}</div>
                        {campaign.disaster_location && (
                          <div className="text-xs text-gray-600 tracking-tight">{campaign.disaster_location}</div>
                        )}
                      </div>
                    )}

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          <span className="text-sm font-bold text-primary tracking-tight">
                            {verificationCount} / {threshold} Verified
                          </span>
                        </div>
                        <span className="text-xs text-gray-700 tracking-tight">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-primary to-[#001a38] h-3 rounded-full transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {isFullyVerified ? (
                        <div className="flex-1 flex items-center justify-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold tracking-tight">
                          <CheckCircle className="w-4 h-4" />
                          Fully Verified
                        </div>
                      ) : hasVoted ? (
                        <div className="flex-1 flex items-center justify-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold tracking-tight border border-emerald-200">
                          <CheckCircle className="w-4 h-4" />
                          Voted
                        </div>
                      ) : (
                        <button
                          onClick={() => handleVerify(campaign.campaign_id)}
                          disabled={verifyingId === campaign.campaign_id}
                          className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 text-sm font-bold tracking-tight"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {verifyingId === campaign.campaign_id ? 'Voting...' : 'Vote to Verify'}
                        </button>
                      )}
                      <Link
                        to={`/campaigns/${campaign.campaign_id}`}
                        className="flex items-center justify-center gap-2 bg-gray-100 text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-bold tracking-tight"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Choose layout based on user role
  if (user?.role === 'ADMIN') {
    return <AdminLayout>{Content}</AdminLayout>;
  }

  return <DonorLayout>{Content}</DonorLayout>;
};

export default VolunteerVoting;
