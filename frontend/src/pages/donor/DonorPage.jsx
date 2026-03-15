import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { campaignAPI, donationAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import DonorLayout from '../../components/DonorLayout';
import { Heart, TrendingUp, DollarSign, AlertCircle, ArrowRight } from 'lucide-react';

const DonorPage = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [totalDonated, setTotalDonated] = useState(0);
  const [stats, setStats] = useState({
    totalDonated: 0,
    totalDonations: 0,
    campaignsSupported: 0,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campaignsResponse, donationsResponse] = await Promise.all([
          campaignAPI.getAll({ status: 'LIVE' }),
          user ? donationAPI.getMyDonations().catch(() => ({ data: { donations: [] } })) : Promise.resolve({ data: { donations: [] } })
        ]);

        // Handle different response structures for campaigns
        const campaignsData = campaignsResponse.data?.campaigns || campaignsResponse.data || campaignsResponse.campaigns || campaignsResponse || [];
        const campaignsArray = Array.isArray(campaignsData) ? campaignsData : [];
        setCampaigns(campaignsArray);

        // Handle different response structures for donations
        const donationsData = donationsResponse.data?.donations || donationsResponse.data || donationsResponse.donations || donationsResponse || [];
        const donationsArray = Array.isArray(donationsData) ? donationsData : [];
        setMyDonations(donationsArray);

        // Calculate stats
        const total = donationsArray.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
        const campaignsSupported = new Set(donationsArray.map(d => d.campaign_id)).size;
        
        setStats({
          totalDonated: total,
          totalDonations: donationsArray.length,
          campaignsSupported: campaignsSupported,
        });
        setTotalDonated(total);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [user]);

  return (
    <DonorLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2 font-playfair tracking-tight">
            Welcome back, {user?.name || 'Donor'}!
          </h1>
          <p className="text-gray-700 text-lg font-dmsans tracking-tight">
            Track your impact and discover new ways to make a difference.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-3xl font-bold font-playfair tracking-tight">
                  ${stats.totalDonated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm opacity-90 font-dmsans tracking-tight">Total Donated</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-4">
              <Heart className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-3xl font-bold font-playfair tracking-tight">{stats.totalDonations}</p>
                <p className="text-sm opacity-90 font-dmsans tracking-tight">My Donations</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-3xl font-bold font-playfair tracking-tight">{stats.campaignsSupported}</p>
                <p className="text-sm opacity-90 font-dmsans tracking-tight">Campaigns Supported</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            to="/donor/report-disaster"
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border-2 border-gray hover:border-blue-500"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-black font-playfair tracking-tight">Create Disaster</h3>
            </div>
            <p className="text-sm text-gray-700 font-dmsans tracking-tight mb-2">
              Report a disaster case for admin review
            </p>
            <div className="flex items-center text-blue-600 font-semibold text-sm font-dmsans tracking-tight">
              Report Now <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link
            to="/campaigns"
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border-2 border-gray hover:border-blue-500"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-black font-playfair tracking-tight">Browse Campaigns</h3>
            </div>
            <p className="text-sm text-gray-700 font-dmsans tracking-tight mb-2">
              Discover verified campaigns to support
            </p>
            <div className="flex items-center text-purple font-semibold text-sm font-dmsans tracking-tight">
              Explore <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link
            to="/donor/verify"
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border-2 border-gray hover:border-blue-500"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-bold text-black font-playfair tracking-tight">Verify Campaigns</h3>
            </div>
            <p className="text-sm text-gray-700 font-dmsans tracking-tight mb-2">
              Help verify campaigns as a volunteer
            </p>
            <div className="flex items-center text-purple font-semibold text-sm font-dmsans tracking-tight">
              Verify <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link
            to="/donor/impact"
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border-2 border-gray hover:border-blue-500"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-black font-playfair tracking-tight">My Impact</h3>
            </div>
            <p className="text-sm text-gray-700 font-dmsans tracking-tight mb-2">
              View your donation impact report
            </p>
            <div className="flex items-center text-purple font-semibold text-sm font-dmsans tracking-tight">
              View Report <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        </div>

        {/* Active Campaigns */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-black mb-1 font-playfair tracking-tight">Active Campaigns</h2>
              <p className="text-gray-700 font-dmsans tracking-tight">
                Browse verified campaigns and make a direct impact
              </p>
            </div>
            <Link
              to="/campaigns"
              className="text-blue-600 hover:text-blue-700 font-semibold font-dmsans tracking-tight"
            >
              View All →
            </Link>
          </div>

          {!Array.isArray(campaigns) || campaigns.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-black mb-2 font-playfair tracking-tight">No Active Campaigns Yet</h3>
              <p className="text-gray-700 mb-4 font-dmsans tracking-tight">
                New campaigns are being added regularly. Check back soon!
              </p>
              <Link
                to="/campaigns"
                className="inline-block bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-bold font-dmsans tracking-tight"
              >
                Browse All Campaigns
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {campaigns.slice(0, 6).map((campaign) => {
                const progressPercentage = campaign.target_amount > 0
                  ? ((campaign.current_amount || 0) / campaign.target_amount) * 100
                  : 0;

                return (
                  <Link
                    key={campaign.campaign_id}
                    to={`/campaigns/${campaign.campaign_id}`}
                    className="bg-white border-2 border-gray rounded-xl p-4 hover:border-blue-500 hover:shadow-lg transition-all"
                  >
                    <div className="bg-gray h-40 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      {campaign.images && campaign.images[0] ? (
                        <img src={campaign.images[0]} alt={campaign.title} className="w-full h-full object-cover" />
                      ) : (
                        <Heart className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <h3 className="font-bold text-black mb-2 line-clamp-2 font-playfair tracking-tight">{campaign.title}</h3>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2 font-dmsans tracking-tight">{campaign.description}</p>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1 font-dmsans tracking-tight">
                        <span className="text-gray-700">Raised</span>
                        <span className="font-bold text-blue-600">
                          ${(campaign.current_amount || 0).toLocaleString()} / ${campaign.target_amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-blue-800 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-xs text-center text-gray-800 font-semibold font-dmsans tracking-tight">
                      {Math.round(progressPercentage)}% funded
                    </div>
                  </Link>
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
                <h2 className="text-2xl font-bold text-black mb-1 font-playfair tracking-tight">Recent Donations</h2>
                <p className="text-gray-700 font-dmsans tracking-tight">Your latest contributions</p>
              </div>
              <Link
                to="/donor/donations"
                className="text-blue-600 hover:text-blue-700 font-semibold font-dmsans tracking-tight"
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
                      <p className="font-bold text-black font-playfair tracking-tight">
                        {donation.campaign?.title || 'Campaign'}
                      </p>
                      <p className="text-sm text-gray-700 font-dmsans tracking-tight">
                        {new Date(donation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                      <p className="text-xl font-bold text-blue-600 font-playfair tracking-tight">
                        ${parseFloat(donation.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    {donation.tx_hash && (
                      <p className="text-xs text-green-600 font-dmsans tracking-tight">✓ Confirmed</p>
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
