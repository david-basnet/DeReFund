import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { campaignAPI, disasterAPI, donationAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import DonorLayout from '../../components/DonorLayout';
import { Heart, TrendingUp, DollarSign, AlertCircle, ArrowRight, MapPin, CalendarDays, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { volunteerVerificationAPI } from '../../utils/api';

const DASHBOARD_LIMIT = 1000;

const DonorPage = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [pendingCampaigns, setPendingCampaigns] = useState([]);
  const [loadingVoting, setLoadingVoting] = useState(false);
  const [stats, setStats] = useState({
    totalDonated: 0,
    totalDonations: 0,
    campaignsSupported: 0,
    reportedDisasters: 0,
    approvedDisasters: 0,
    pendingDisasters: 0,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = user?.user_id || user?.id || user?.userId;
        const [campaignsResponse, donationsResponse, disastersResponse, pendingResponse] = await Promise.all([
          campaignAPI.getAll({ status: 'LIVE', limit: DASHBOARD_LIMIT }),
          user ? donationAPI.getMyDonations({ limit: DASHBOARD_LIMIT }).catch(() => ({ data: { donations: [] } })) : Promise.resolve({ data: { donations: [] } }),
          userId ? disasterAPI.getMyDisasters(userId, { limit: 12 }) : Promise.resolve({ data: { disasters: [] } }),
          volunteerVerificationAPI.getPendingCampaigns({ limit: 6 }),
        ]);

        // Handle different response structures for campaigns
        const campaignsData = campaignsResponse.data?.campaigns || campaignsResponse.data || campaignsResponse.campaigns || campaignsResponse || [];
        const campaignsArray = Array.isArray(campaignsData) ? campaignsData : [];
        setCampaigns(campaignsArray);

        // Pending campaigns for voting
        setPendingCampaigns(pendingResponse.data?.campaigns || []);

        // Handle different response structures for donations
        const donationsData = donationsResponse.data?.donations || donationsResponse.data || donationsResponse.donations || donationsResponse || [];
        const donationsArray = Array.isArray(donationsData) ? donationsData : [];
        setMyDonations(donationsArray);

        // Handle different response structures for disasters
        const disastersData = disastersResponse.data?.disasters || disastersResponse.data || disastersResponse.disasters || disastersResponse || [];
        const disastersArray = Array.isArray(disastersData) ? disastersData : [];
        setDisasters(disastersArray);

        const total = donationsArray.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
        const campaignsSupported = new Set(donationsArray.map(d => d.campaign_id)).size;
        const approvedDisasters = disastersArray.filter((disaster) => disaster.status === 'APPROVED').length;
        const pendingDisasters = disastersArray.filter((disaster) => disaster.status === 'PENDING').length;

        setStats({
          totalDonated: total,
          totalDonations: donationsArray.length,
          campaignsSupported: campaignsSupported,
          reportedDisasters: disastersArray.length,
          approvedDisasters,
          pendingDisasters,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [user]);

  const handleVote = async (campaignId) => {
    try {
      setLoadingVoting(campaignId);
      await volunteerVerificationAPI.verifyCampaign(campaignId);
      toast.success('Vote submitted successfully!');
      
      // Refresh pending list
      const pendingResponse = await volunteerVerificationAPI.getPendingCampaigns({ limit: 6 });
      setPendingCampaigns(pendingResponse.data?.campaigns || []);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to submit vote');
    } finally {
      setLoadingVoting(false);
    }
  };

  return (
    <DonorLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2 tracking-tight">
            Welcome back, {user?.name || 'Donor'}!
          </h1>
          <p className="text-gray-700 text-lg tracking-tight">
            Track your impact and discover new ways to make a difference.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="rounded-xl bg-gradient-to-br from-slate-700 to-slate-950 p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-white/80" />
              <div className="text-right">
                <p className="text-3xl font-bold tracking-tight">
                  ${stats.totalDonated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm font-semibold text-white/90 tracking-tight">Total Donated</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Heart className="w-8 h-8 text-rose-500" />
              <div className="text-right">
                <p className="text-3xl font-bold text-slate-950 tracking-tight">{stats.totalDonations}</p>
                <p className="text-sm font-semibold text-slate-600 tracking-tight">My Donations</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-emerald-600" />
              <div className="text-right">
                <p className="text-3xl font-bold text-slate-950 tracking-tight">{stats.campaignsSupported}</p>
                <p className="text-sm font-semibold text-slate-600 tracking-tight">Campaigns Supported</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-700 to-emerald-950 p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-4">
              <MapPin className="w-8 h-8 text-white/80" />
              <div className="text-right">
                <p className="text-3xl font-bold tracking-tight">{stats.reportedDisasters}</p>
                <p className="text-sm font-semibold text-white/90 tracking-tight">Disasters reported</p>
              </div>
            </div>
            <div className="grid gap-2 text-xs font-semibold text-white/90">
              <div className="flex items-center justify-between">
                <span>Approved</span>
                <span>{stats.approvedDisasters}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pending</span>
                <span>{stats.pendingDisasters}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            to="/donor/report-disaster"
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border-2 border-gray hover:border-primary"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-primary-fixed/70 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-black tracking-tight">Create Disaster</h3>
            </div>
            <p className="text-sm text-gray-700 tracking-tight mb-2">
              Report a disaster case for admin review
            </p>
            <div className="flex items-center text-primary font-semibold text-sm tracking-tight">
              Report Now <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link
            to="/campaigns"
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border-2 border-gray hover:border-primary"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-primary-fixed/70 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-black tracking-tight">Live Campaigns</h3>
            </div>
            <p className="text-sm text-gray-700 tracking-tight mb-2">
              Support active campaigns ready for donation
            </p>
            <div className="flex items-center text-purple font-semibold text-sm tracking-tight">
              Explore <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link
            to="/donor/voting"
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border-2 border-gray hover:border-primary"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-bold text-black tracking-tight">Verify Campaigns</h3>
            </div>
            <p className="text-sm text-gray-700 tracking-tight mb-2">
              Help verify campaigns as a volunteer
            </p>
            <div className="flex items-center text-purple font-semibold text-sm tracking-tight">
              Verify <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link
            to="/donor/impact"
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border-2 border-gray hover:border-primary"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-primary-fixed/70 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-black tracking-tight">My Impact</h3>
            </div>
            <p className="text-sm text-gray-700 tracking-tight mb-2">
              View your donation impact report
            </p>
            <div className="flex items-center text-purple font-semibold text-sm tracking-tight">
              View Report <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        </div>

        {/* My Disaster Reports */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-black mb-1 tracking-tight">My Disaster Reports</h2>
              <p className="text-gray-700 tracking-tight">Track your submitted disaster cases and their approval status.</p>
            </div>
            <Link
              to="/donor/report-disaster"
              className="text-primary hover:text-[#0a3d6b] font-semibold tracking-tight"
            >
              Submit another report →
            </Link>
          </div>

          {disasters.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-black mb-2 tracking-tight">No disaster cases yet</h3>
              <p className="text-gray-700 tracking-tight">Report a case and wait for administrative review.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {disasters.slice(0, 4).map((disaster) => (
                <Link
                  key={disaster.case_id}
                  to={`/disasters/${disaster.case_id}`}
                  className="block rounded-3xl border border-gray-200 hover:border-primary shadow-sm hover:shadow-lg transition-all p-5 bg-surface-container-lowest"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-black tracking-tight line-clamp-2">{disaster.title}</h3>
                      <p className="text-sm text-gray-600 tracking-tight">{disaster.location}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      disaster.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : disaster.status === 'REJECTED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {disaster.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3 mb-4 tracking-tight">{disaster.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 tracking-tight">
                    <span>{disaster.severity || 'MEDIUM'} severity</span>
                    <span>{new Date(disaster.created_at).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Live Campaigns */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-black mb-1 tracking-tight">Live Campaigns</h2>
              <p className="text-gray-700 tracking-tight">
                Support active campaigns and make a direct impact
              </p>
            </div>
            <Link
              to="/campaigns"
              className="text-primary hover:text-[#0a3d6b] font-semibold tracking-tight"
            >
              View All →
            </Link>
          </div>

          {!Array.isArray(campaigns) || campaigns.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-black mb-2 tracking-tight">No Active Campaigns Yet</h3>
              <p className="text-gray-700 mb-4 tracking-tight">
                New campaigns are being added regularly. Check back soon!
              </p>
              <Link
                to="/campaigns"
                className="inline-block bg-gradient-to-r from-primary to-[#001a38] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-bold tracking-tight"
              >
                View Live Campaigns
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {campaigns.slice(0, 3).map((campaign) => (
                <Link
                  key={campaign.campaign_id}
                  to={`/campaigns/${campaign.campaign_id}`}
                  className="group block bg-surface-container-lowest rounded-3xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={campaign.image_urls?.[0] || campaign.images?.[0] || campaign.disaster_images?.[0] || '/placeholder-campaign.jpg'}
                      alt={campaign.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-primary shadow-sm uppercase tracking-wider">
                      Live
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-black mb-2 line-clamp-1 group-hover:text-primary transition-colors tracking-tight">
                      {campaign.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-4">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span className="truncate">{campaign.disaster_location || campaign.location || 'Location shared on request'}</span>
                    </div>
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="text-xs font-bold text-primary">
                        View Details
                      </div>
                      <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Volunteer Voting Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-black mb-1 tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-primary" />
                Volunteer Voting Needed
              </h2>
              <p className="text-gray-700 tracking-tight">
                Help verify these campaigns. Every campaign needs volunteer votes to go live.
              </p>
            </div>
            <Link
              to="/donor/voting"
              className="text-primary hover:text-[#0a3d6b] font-semibold tracking-tight"
            >
              View All Voting →
            </Link>
          </div>

          {pendingCampaigns.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-black mb-2 tracking-tight">No Voting Required</h3>
              <p className="text-gray-700 tracking-tight">
                All submitted campaigns are currently verified or approved.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingCampaigns.slice(0, 3).map((campaign) => {
                const verificationCount = campaign.verification_count || 0;
                const threshold = campaign.verification_threshold || 20;
                const progress = (verificationCount / threshold) * 100;
                
                return (
                  <div
                    key={campaign.campaign_id}
                    className="bg-surface-container-lowest rounded-3xl border-2 border-gray-100 p-6 hover:border-primary transition-all shadow-sm"
                  >
                    <h3 className="font-bold text-black mb-2 line-clamp-1 tracking-tight">
                      {campaign.title}
                    </h3>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-primary tracking-tight">
                          {verificationCount} / {threshold} Votes
                        </span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVote(campaign.campaign_id)}
                        disabled={loadingVoting === campaign.campaign_id}
                        className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 text-xs font-bold tracking-tight"
                      >
                        {loadingVoting === campaign.campaign_id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        {loadingVoting === campaign.campaign_id ? 'Voting...' : 'Vote Now'}
                      </button>
                      <Link
                        to={`/campaigns/${campaign.campaign_id}`}
                        className="flex items-center justify-center bg-gray-100 text-black px-4 py-2 rounded-xl hover:bg-gray-200 transition-all text-xs font-bold tracking-tight"
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

        {/* Recent Donations */}
        {myDonations.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-black mb-1 tracking-tight">Recent Donations</h2>
                <p className="text-gray-700 tracking-tight">Your latest contributions</p>
              </div>
              <Link
                to="/donor/donations"
                className="text-primary hover:text-[#0a3d6b] font-semibold tracking-tight"
            >
                View All →
              </Link>
            </div>

            <div className="space-y-3">
              {myDonations.slice(0, 5).map((donation) => (
                <div key={donation.donation_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple to-purple-700 rounded-full flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-black tracking-tight">
                        {donation.campaign?.title || 'Campaign'}
                      </p>
                      <p className="text-sm text-gray-700 tracking-tight">
                        {new Date(donation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                      <p className="text-xl font-bold text-primary tracking-tight">
                        ${parseFloat(donation.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    {donation.tx_hash && (
                      <p className="text-xs text-green-600 tracking-tight">✓ Confirmed</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DonorLayout>
  );
};

export default DonorPage;
