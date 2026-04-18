import { useEffect, useState } from 'react';
import { campaignAPI, donationAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import NGOLayout from '../../components/NGOLayout';
import { BarChart3, TrendingUp, DollarSign, Users, Activity, CheckCircle2 } from 'lucide-react';

const NGOAnalytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRaised: 0,
    totalCampaigns: 0,
    totalDonations: 0,
    averageDonation: 0,
    liveCampaigns: 0,
    completedCampaigns: 0,
  });
  const [donationsOverTime, setDonationsOverTime] = useState([]);
  const [campaignPerformance, setCampaignPerformance] = useState([]);

  async function fetchAnalytics() {
    const userId = user?.user_id || user?.id;
    if (!userId) return;

    try {
      // Don't set loading to true - show data immediately as it loads
      const campaignsResponse = await campaignAPI.getAll({ ngo_id: userId });
      const campaigns = Array.isArray(campaignsResponse.data?.campaigns) 
        ? campaignsResponse.data.campaigns 
        : [];

      let allDonations = [];
      let totalRaised = 0;
      const donationsByDate = {};

      for (const campaign of campaigns) {
        try {
          const donationsResponse = await donationAPI.getByCampaign(campaign.campaign_id);
          const donations = Array.isArray(donationsResponse.data?.donations) 
            ? donationsResponse.data.donations 
            : [];
          
          allDonations = [...allDonations, ...donations];
          
          donations.forEach(donation => {
            const amount = parseFloat(donation.amount || 0);
            totalRaised += amount;
            
            // Group by date for chart
            const date = new Date(donation.created_at || donation.donated_at).toLocaleDateString();
            donationsByDate[date] = (donationsByDate[date] || 0) + amount;
          });
        } catch (error) {
          console.error(`Error fetching donations for campaign ${campaign.campaign_id}:`, error);
        }
      }

      // Process donations over time
      const donationsOverTimeData = Object.entries(donationsByDate)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-7); // Last 7 days

      // Campaign performance
      const campaignPerformanceData = await Promise.all(
        campaigns.map(async (campaign) => {
          try {
            const donationsResponse = await donationAPI.getByCampaign(campaign.campaign_id);
            const donations = Array.isArray(donationsResponse.data?.donations) 
              ? donationsResponse.data.donations 
              : [];
            const raised = donations.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
            const progress = campaign.target_amount > 0 ? (raised / campaign.target_amount) * 100 : 0;
            
            return {
              id: campaign.campaign_id,
              title: campaign.title,
              raised,
              target: campaign.target_amount,
              progress,
              donations: donations.length,
            };
          } catch {
            return {
              id: campaign.campaign_id,
              title: campaign.title,
              raised: 0,
              target: campaign.target_amount,
              progress: 0,
              donations: 0,
            };
          }
        })
      );

      setStats({
        totalRaised,
        totalCampaigns: campaigns.length,
        totalDonations: allDonations.length,
        averageDonation: allDonations.length > 0 ? totalRaised / allDonations.length : 0,
        liveCampaigns: campaigns.filter(c => c.status === 'LIVE').length,
        completedCampaigns: campaigns.filter(c => c.status === 'COMPLETED').length,
      });

      setDonationsOverTime(donationsOverTimeData);
      setCampaignPerformance(campaignPerformanceData.sort((a, b) => b.raised - a.raised));
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
    // Don't set loading to false - data updates in background
  }

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => {
      fetchAnalytics();
    }, 0);
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [user]);

  const maxDonation = donationsOverTime.length > 0 
    ? Math.max(...donationsOverTime.map(d => d.amount))
    : 1;

  return (
    <NGOLayout>
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Campaign Analytics</h1>
            <p className="text-slate-600 tracking-tight">Detailed insights into your fundraising performance</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary-fixed/70 rounded-xl">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Raised</p>
                  <p className="text-3xl font-bold text-slate-900 tracking-tight">
                    ${stats.totalRaised.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Donations</p>
                  <p className="text-3xl font-bold text-slate-900 tracking-tight">{stats.totalDonations}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Avg. Donation</p>
                  <p className="text-3xl font-bold text-slate-900 tracking-tight">
                    ${stats.averageDonation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Donations Chart Placeholder */}
            <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Fundraising Activity
              </h3>
              <div className="space-y-4">
                {donationsOverTime.length === 0 ? (
                  <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold tracking-tight">No recent activity data</p>
                  </div>
                ) : (
                  donationsOverTime.map((data, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm font-bold tracking-tight">
                        <span className="text-slate-600">{data.date}</span>
                        <span className="text-primary">${data.amount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(data.amount / Math.max(...donationsOverTime.map(d => d.amount))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Campaign Performance */}
            <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Campaign Performance
              </h3>
              <div className="space-y-6">
                {campaignPerformance.length === 0 ? (
                  <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold tracking-tight">No campaign data available</p>
                  </div>
                ) : (
                  campaignPerformance.slice(0, 5).map((campaign) => (
                    <div key={campaign.id} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate tracking-tight">{campaign.title}</p>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                            ${campaign.raised.toLocaleString()} of ${campaign.target.toLocaleString()}
                          </p>
                        </div>
                        <span className="text-sm font-black text-primary tracking-tight">
                          {Math.round(campaign.progress)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-primary to-[#001a38] h-3 rounded-full transition-all"
                          style={{ width: `${Math.min(campaign.progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </NGOLayout>
  );
};

export default NGOAnalytics;
