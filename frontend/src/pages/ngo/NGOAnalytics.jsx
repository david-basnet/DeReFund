import { useEffect, useState } from 'react';
import { campaignAPI, donationAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import NGOLayout from '../../components/NGOLayout';
import { BarChart3, TrendingUp, DollarSign, Users, Activity, CheckCircle2 } from 'lucide-react';

const NGOAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    window.scrollTo(0, 0);
    // Fetch immediately without showing loading state
    fetchAnalytics();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchAnalytics = async () => {
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
        } catch (err) {
          console.error(`Error fetching donations for campaign ${campaign.campaign_id}:`, err);
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
          } catch (err) {
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
  };

  const maxDonation = donationsOverTime.length > 0 
    ? Math.max(...donationsOverTime.map(d => d.amount))
    : 1;

  return (
    <NGOLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-purple" />
            <h1 className="text-4xl font-bold text-slate-900 font-playfair tracking-tight">Analytics</h1>
          </div>
          <p className="text-slate-600 font-dmsans tracking-tight">Real-time insights into your fundraising performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1 font-playfair tracking-tight">
              ${stats.totalRaised.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-slate-600 font-dmsans tracking-tight">Total Raised</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1 font-playfair tracking-tight">
              {stats.totalCampaigns}
            </div>
            <div className="text-sm text-slate-600 font-dmsans tracking-tight">Total Campaigns</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1 font-playfair tracking-tight">
              {stats.totalDonations}
            </div>
            <div className="text-sm text-slate-600 font-dmsans tracking-tight">Total Donations</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1 font-playfair tracking-tight">
              ${stats.averageDonation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-slate-600 font-dmsans tracking-tight">Average Donation</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Activity className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1 font-playfair tracking-tight">
              {stats.liveCampaigns}
            </div>
            <div className="text-sm text-slate-600 font-dmsans tracking-tight">Live Campaigns</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-gray-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1 font-playfair tracking-tight">
              {stats.completedCampaigns}
            </div>
            <div className="text-sm text-slate-600 font-dmsans tracking-tight">Completed</div>
          </div>
        </div>

        {/* Donations Over Time Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 font-playfair tracking-tight">Donations Over Time (Last 7 Days)</h2>
          {donationsOverTime.length === 0 ? (
            <div className="text-center py-8 text-slate-500 font-dmsans tracking-tight">
              No donation data available
            </div>
          ) : (
            <div className="flex items-end gap-4 h-64">
              {donationsOverTime.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center justify-end" style={{ height: '200px' }}>
                    <div
                      className="w-full bg-gradient-to-t from-purple to-light-purple rounded-t-lg transition-all duration-500 hover:opacity-80"
                      style={{ height: `${(item.amount / maxDonation) * 100}%` }}
                      title={`$${item.amount.toLocaleString()}`}
                    ></div>
                  </div>
                  <div className="mt-2 text-xs text-slate-600 font-dmsans tracking-tight text-center">
                    {item.date}
                  </div>
                  <div className="text-xs font-bold text-purple font-dmsans tracking-tight mt-1">
                    ${item.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Campaign Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 font-playfair tracking-tight">Campaign Performance</h2>
          {campaignPerformance.length === 0 ? (
            <div className="text-center py-8 text-slate-500 font-dmsans tracking-tight">
              No campaign data available
            </div>
          ) : (
            <div className="space-y-4">
              {campaignPerformance.map((campaign) => (
                <div key={campaign.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 font-dmsans tracking-tight">{campaign.title}</h3>
                    <span className="text-sm font-bold text-purple font-dmsans tracking-tight">
                      ${campaign.raised.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-gradient-to-r from-purple to-light-purple h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(campaign.progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 font-dmsans tracking-tight">
                    <span>{Math.round(campaign.progress)}% of ${campaign.target.toLocaleString()}</span>
                    <span>{campaign.donations} donations</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </NGOLayout>
  );
};

export default NGOAnalytics;
