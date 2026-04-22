import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { campaignAPI, donationAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import NGOLayout from '../../components/NGOLayout';
import CampaignStatusBadge from '../../components/CampaignStatusBadge';
import { DollarSign, FileText, TrendingUp, Users, Plus, Heart, ArrowRight } from 'lucide-react';

const DASHBOARD_LIMIT = 1000;

const NGOPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRaised: 0, totalCampaigns: 0 });

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const userId = user?.user_id || user?.id;
        const response = await campaignAPI.getAll({ ngo_id: userId, limit: DASHBOARD_LIMIT });
        const campaignsData =
          response.data?.campaigns ||
          response.data?.data?.campaigns ||
          response.data ||
          response.campaigns ||
          [];
        const campaignsArray = Array.isArray(campaignsData) ? campaignsData : [];
        setCampaigns(campaignsArray);
        setStats({ totalCampaigns: campaignsArray.length });

        // Calculate live totals from database-backed campaign rows.
        let totalRaised = campaignsArray.reduce(
          (sum, campaign) => sum + parseFloat(campaign.current_amount || 0),
          0
        );
        let totalDonors = 0;
        for (const campaign of campaignsArray) {
          try {
            const donationsResponse = await donationAPI.getByCampaign(campaign.campaign_id, { limit: 1 });
            const donationsData =
              donationsResponse.data?.donations ||
              donationsResponse.data?.data?.donations ||
              donationsResponse.data ||
              donationsResponse.donations ||
              [];
            const donationsArray = Array.isArray(donationsData) ? donationsData : [];
            totalDonors += Number(donationsResponse.data?.total ?? donationsArray.length);
          } catch (err) {
            console.error(`Error fetching donations for campaign ${campaign.campaign_id}:`, err);
          }
        }
        setStats(prev => ({ ...prev, totalRaised, totalDonors }));
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
    <NGOLayout>
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 bg-gradient-to-r from-primary to-[#001a38] p-8 md:p-12 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter leading-none">
                NGO Dashboard
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-2xl font-bold tracking-tight">
                Manage your relief efforts, track impact, and connect with global donors.
              </p>
            </div>
            <Link
              to="/ngo/create-campaign"
              className="relative z-10 group flex items-center gap-3 bg-white text-primary px-8 py-5 rounded-2xl font-black text-lg hover:shadow-xl transition-all active:scale-[0.98] tracking-tighter"
            >
              <Plus className="w-6 h-6" />
              Start New Campaign
            </Link>
            
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-fixed/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-8 hover:border-primary/20 transition-all">
              <div className="p-3 bg-primary-fixed/70 rounded-xl w-fit mb-4 text-primary">
                <DollarSign className="w-8 h-8" />
              </div>
              <div className="text-3xl font-black text-slate-900 mb-1 tracking-tighter">
                ${stats.totalRaised.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Raised</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-8 hover:border-primary/20 transition-all">
              <div className="p-3 bg-primary-fixed/70 rounded-xl w-fit mb-4 text-primary">
                <FileText className="w-8 h-8" />
              </div>
              <div className="text-3xl font-black text-slate-900 mb-1 tracking-tighter">
                {stats.totalCampaigns}
              </div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Campaigns</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-8 hover:border-primary/20 transition-all">
              <div className="p-3 bg-emerald-50 rounded-xl w-fit mb-4 text-emerald-600">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="text-3xl font-black text-slate-900 mb-1 tracking-tighter">
                {campaigns.filter(c => c.status === 'LIVE').length}
              </div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Live Now</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-8 hover:border-primary/20 transition-all">
              <div className="p-3 bg-blue-50 rounded-xl w-fit mb-4 text-blue-600">
                <Users className="w-8 h-8" />
              </div>
              <div className="text-3xl font-black text-slate-900 mb-1 tracking-tighter">
                {stats.totalDonors || 0}
              </div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Donors</p>
            </div>
          </div>

          {/* Campaigns Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                <Heart className="w-8 h-8 text-primary" />
                Your Campaigns
              </h2>
              <Link to="/ngo/campaigns" className="text-primary font-black flex items-center gap-1 group">
                View All <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border-2 border-slate-100 border-dashed">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
                <p className="font-bold text-slate-500">Loading your campaigns...</p>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-slate-100 border-dashed">
                <p className="text-slate-500 font-bold text-lg mb-6">No campaigns created yet.</p>
                <Link
                  to="/ngo/create-campaign"
                  className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl"
                >
                  Start First Campaign
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {campaigns.slice(0, 3).map((campaign) => {
                  const progress = campaign.target_amount > 0 
                    ? ((campaign.current_amount || 0) / campaign.target_amount) * 100 
                    : 0;
                  
                  return (
                    <div
                      key={campaign.campaign_id}
                      className="bg-white border-2 border-slate-100 rounded-[2rem] p-6 hover:shadow-2xl transition-all group overflow-hidden"
                    >
                      <div className="aspect-video rounded-2xl bg-slate-100 mb-6 overflow-hidden relative">
                        {campaign.image_urls?.[0] ? (
                          <img src={campaign.image_urls[0]} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Heart className="w-12 h-12 opacity-20" />
                          </div>
                        )}
                        <div className="absolute top-4 right-4">
                          <CampaignStatusBadge status={campaign.status} size="sm" />
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-black text-slate-900 mb-2 line-clamp-1 tracking-tighter">
                        {campaign.title}
                      </h3>
                      <p className="text-slate-500 text-sm font-bold line-clamp-2 mb-6 leading-relaxed">
                        {campaign.description}
                      </p>

                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Raised</p>
                            <p className="text-xl font-black text-primary tracking-tighter">
                              ${parseFloat(campaign.current_amount || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Goal</p>
                            <p className="text-sm font-black text-slate-900 tracking-tighter">
                              ${parseFloat(campaign.target_amount).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-[#001a38] transition-all duration-1000 ease-out rounded-full"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>

                        <Link
                          to={`/ngo/campaigns/${campaign.campaign_id}`}
                          className="flex items-center justify-center w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl font-black transition-all border-2 border-slate-200 mt-2"
                        >
                          Manage Campaign
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
    </NGOLayout>
  );
};

export default NGOPage;
