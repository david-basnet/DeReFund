import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { campaignAPI, donationAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import CampaignStatusBadge from '../../components/CampaignStatusBadge';

const NGOPage = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRaised: 0, totalCampaigns: 0 });

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const userId = user?.user_id || user?.id;
        const response = await campaignAPI.getAll({ ngo_id: userId });
        const campaignsData =
          response.data?.campaigns ||
          response.data?.data?.campaigns ||
          response.data ||
          response.campaigns ||
          [];
        const campaignsArray = Array.isArray(campaignsData) ? campaignsData : [];
        setCampaigns(campaignsArray);
        setStats({ totalCampaigns: campaignsArray.length });

        // Calculate total raised
        let totalRaised = 0;
        for (const campaign of campaignsArray) {
          try {
            const donationsResponse = await donationAPI.getByCampaign(campaign.campaign_id);
            const donationsData =
              donationsResponse.data?.donations ||
              donationsResponse.data?.data?.donations ||
              donationsResponse.data ||
              donationsResponse.donations ||
              [];
            const donationsArray = Array.isArray(donationsData) ? donationsData : [];
            const campaignTotal = donationsArray.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
            totalRaised += campaignTotal;
          } catch (err) {
            console.error(`Error fetching donations for campaign ${campaign.campaign_id}:`, err);
          }
        }
        setStats(prev => ({ ...prev, totalRaised }));
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.user_id || user?.id) {
      fetchCampaigns();
    }
  }, [user]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <div className="h-full overflow-y-auto">
        {/* Hero Banner - Full Screen */}
        <section className="relative h-screen flex items-center justify-center bg-gradient-to-r from-purple via-light-purple to-purple text-white overflow-hidden pt-24">
          <div className="absolute inset-0 bg-gradient-to-r from-purple/90 to-light-purple/90"></div>
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)'
          }}></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center mb-12">
              <h1 className="text-6xl md:text-7xl font-bold mb-6 font-playfair tracking-tight leading-tight">NGO Dashboard</h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-dmsans tracking-tight">
                Manage your campaigns, track donations, and make a real impact in disaster relief efforts.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                <div className="text-5xl font-bold mb-2 font-playfair tracking-tight">{stats.totalCampaigns}</div>
                <div className="text-white/90 font-dmsans tracking-tight">Active Campaigns</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                <div className="text-5xl font-bold mb-2 font-playfair tracking-tight">${stats.totalRaised.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-white/90 font-dmsans tracking-tight">Total Raised</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                <div className="text-5xl font-bold mb-2 font-playfair tracking-tight">{campaigns.filter(c => c.status === 'LIVE').length}</div>
                <div className="text-white/90 font-dmsans tracking-tight">Live Campaigns</div>
              </div>
            </div>
          </div>
        </section>

        {/* Current Campaigns Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-4xl font-bold mb-2 font-playfair tracking-tight text-black">Your Campaigns</h2>
                <p className="text-gray-800 font-dmsans tracking-tight">
                  Manage your fundraising campaigns and track progress toward your goals.
                </p>
              </div>
              <Link
                to="/ngo/create-campaign"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple to-light-purple text-white px-6 py-3 rounded-xl font-bold hover-lift shadow-lg transition-all duration-300 font-dmsans tracking-tight"
              >
                Create New Campaign
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple mx-auto mb-4"></div>
                <p className="text-gray-800 font-dmsans tracking-tight">Loading campaigns...</p>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12 bg-light-gray rounded-2xl">
                <p className="text-gray-800 mb-4 font-dmsans tracking-tight">You haven't created any campaigns yet.</p>
                <Link
                  to="/ngo/create-campaign"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple to-light-purple text-white px-6 py-3 rounded-xl font-bold hover-lift shadow-lg transition-all duration-300 font-dmsans tracking-tight"
                >
                  Create Your First Campaign
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {campaigns.map((campaign) => {
                  const progressPercentage = campaign.target_amount > 0 
                    ? ((campaign.current_amount || 0) / campaign.target_amount) * 100 
                    : 0;
                  
                  return (
                    <Link
                      key={campaign.campaign_id}
                      to={`/campaigns/${campaign.campaign_id}`}
                      className="border-2 border-gray rounded-2xl p-6 hover-lift card-hover transition-all duration-300 block"
                    >
                      <div className="bg-gray h-48 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                        {campaign.images && campaign.images[0] ? (
                          <img src={campaign.images[0]} alt={campaign.title} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <p className="text-gray-800 font-dmsans tracking-tight">No Image</p>
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-2 line-clamp-2 font-playfair tracking-tight text-black">{campaign.title}</h3>
                      <p className="text-gray-800 mb-4 line-clamp-2 text-sm font-dmsans tracking-tight">{campaign.description}</p>
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1 font-dmsans tracking-tight">
                          <span className="text-purple font-bold">
                            ${(campaign.current_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-gray-800">
                            ${campaign.target_amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-purple to-light-purple h-3 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <CampaignStatusBadge status={campaign.status} size="sm" />
                        <span className="text-sm text-gray-800 font-dmsans tracking-tight">{Math.round(progressPercentage)}% funded</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Image Gallery Placeholder */}
        <section className="py-16 bg-light-gray">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold mb-8 text-center font-playfair tracking-tight text-black">Our Impact in Action</h2>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
                <div key={item} className="bg-gray aspect-square rounded-2xl flex items-center justify-center">
                  <p className="text-gray-800 text-xs font-dmsans tracking-tight">Image {item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold mb-12 text-center font-playfair tracking-tight text-black">Platform Benefits, So You Can Maximize Impact</h2>
            
            <div className="grid md:grid-cols-3 gap-12 mb-12">
              <div>
                <h3 className="text-2xl font-bold mb-4 font-playfair tracking-tight text-black">Growth</h3>
                <ul className="space-y-3 text-gray-800 font-dmsans tracking-tight">
                  <li className="flex items-start">
                    <span className="text-purple mr-2">✓</span>
                    <span>Campaign analytics & insights</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple mr-2">✓</span>
                    <span>Donor engagement tools</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple mr-2">✓</span>
                    <span>Impact tracking & reporting</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 font-playfair tracking-tight text-black">Transparency</h3>
                <ul className="space-y-3 text-gray-800 font-dmsans tracking-tight">
                  <li className="flex items-start">
                    <span className="text-purple mr-2">✓</span>
                    <span>Blockchain-verified transactions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple mr-2">✓</span>
                    <span>Public donation tracking</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple mr-2">✓</span>
                    <span>Milestone-based fund release</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 font-playfair tracking-tight text-black">Support</h3>
                <ul className="space-y-3 text-gray-800 font-dmsans tracking-tight">
                  <li className="flex items-start">
                    <span className="text-purple mr-2">✓</span>
                    <span>24/7 platform access</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple mr-2">✓</span>
                    <span>Dedicated support team</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple mr-2">✓</span>
                    <span>Comprehensive documentation</span>
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-center text-gray-800 text-lg font-dmsans tracking-tight">
              We're a global platform connecting NGOs with donors worldwide, building trust through transparency and accountability.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default NGOPage;
