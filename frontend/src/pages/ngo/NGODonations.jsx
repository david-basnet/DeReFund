import { useEffect, useState } from 'react';
import { campaignAPI, donationAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import NGOLayout from '../../components/NGOLayout';
import { DollarSign, TrendingUp, Calendar, ExternalLink } from 'lucide-react';

const NGODonations = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ campaign: 'ALL', date: 'ALL' });
  const [stats, setStats] = useState({
    totalReceived: 0,
    totalDonations: 0,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
    // Real-time updates every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user, filter]);

  const fetchData = async () => {
    const userId = user?.user_id || user?.id;
    if (!userId) return;

    try {
      setLoading(true);
      const campaignsResponse = await campaignAPI.getAll({ ngo_id: userId });
      const campaignsData = Array.isArray(campaignsResponse.data?.campaigns) 
        ? campaignsResponse.data.campaigns 
        : [];
      setCampaigns(campaignsData);

      let allDonations = [];
      let totalReceived = 0;

      for (const campaign of campaignsData) {
        try {
          const donationsResponse = await donationAPI.getByCampaign(campaign.campaign_id);
          const donations = Array.isArray(donationsResponse.data?.donations) 
            ? donationsResponse.data.donations 
            : [];
          
          donations.forEach(donation => {
            allDonations.push({
              ...donation,
              campaign_title: campaign.title,
              campaign_id: campaign.campaign_id,
            });
            totalReceived += parseFloat(donation.amount || 0);
          });
        } catch (err) {
          console.error(`Error fetching donations for campaign ${campaign.campaign_id}:`, err);
        }
      }

      // Apply filters
      let filtered = allDonations;
      if (filter.campaign !== 'ALL') {
        filtered = filtered.filter(d => d.campaign_id === filter.campaign);
      }
      if (filter.date !== 'ALL') {
        const now = new Date();
        filtered = filtered.filter(d => {
          const donationDate = new Date(d.created_at || d.donated_at);
          switch (filter.date) {
            case 'TODAY':
              return donationDate.toDateString() === now.toDateString();
            case 'WEEK':
              return donationDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case 'MONTH':
              return donationDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            default:
              return true;
          }
        });
      }

      // Sort by date (newest first)
      filtered.sort((a, b) => new Date(b.created_at || b.donated_at) - new Date(a.created_at || a.donated_at));

      setDonations(filtered);
      setStats({
        totalReceived,
        totalDonations: allDonations.length,
      });
    } catch (error) {
      console.error('Error fetching donations:', error);
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <NGOLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8 text-purple" />
            <h1 className="text-4xl font-bold text-slate-900 font-playfair tracking-tight">Donations</h1>
          </div>
          <p className="text-slate-600 font-dmsans tracking-tight">View and track all donations received</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1 font-playfair tracking-tight">
              ${stats.totalReceived.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-slate-600 font-dmsans tracking-tight">Total Received</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1 font-playfair tracking-tight">
              {stats.totalDonations}
            </div>
            <div className="text-sm text-slate-600 font-dmsans tracking-tight">Total Donations</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2 font-dmsans tracking-tight">Campaign</label>
              <select
                value={filter.campaign}
                onChange={(e) => setFilter({ ...filter, campaign: e.target.value })}
                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-purple focus:border-purple bg-white text-black font-bold font-dmsans tracking-tight"
              >
                <option value="ALL">All Campaigns</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.campaign_id} value={campaign.campaign_id}>
                    {campaign.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2 font-dmsans tracking-tight">Date Range</label>
              <select
                value={filter.date}
                onChange={(e) => setFilter({ ...filter, date: e.target.value })}
                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-purple focus:border-purple bg-white text-black font-bold font-dmsans tracking-tight"
              >
                <option value="ALL">All Time</option>
                <option value="TODAY">Today</option>
                <option value="WEEK">Last 7 Days</option>
                <option value="MONTH">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Donations Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple mx-auto mb-4"></div>
            <p className="text-slate-600 font-dmsans tracking-tight">Loading donations...</p>
          </div>
        ) : donations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-purple-100">
            <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2 font-playfair tracking-tight">No donations found</h3>
            <p className="text-slate-600 font-dmsans tracking-tight">
              {filter.campaign !== 'ALL' || filter.date !== 'ALL'
                ? 'No donations match your filters.'
                : "You haven't received any donations yet."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-50 border-b border-purple-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 font-dmsans tracking-tight">Donor</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 font-dmsans tracking-tight">Campaign</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 font-dmsans tracking-tight">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 font-dmsans tracking-tight">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 font-dmsans tracking-tight">Transaction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {donations.map((donation) => (
                    <tr key={donation.donation_id} className="hover:bg-purple-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 font-dmsans tracking-tight">
                          {donation.donor_name || 'Anonymous'}
                        </div>
                        {donation.donor_email && (
                          <div className="text-sm text-slate-600 font-dmsans tracking-tight">
                            {donation.donor_email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 font-dmsans tracking-tight">
                          {donation.campaign_title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-purple text-lg font-playfair tracking-tight">
                          ${parseFloat(donation.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 font-dmsans tracking-tight">
                          <Calendar className="w-4 h-4" />
                          {new Date(donation.created_at || donation.donated_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {donation.tx_hash ? (
                          <a
                            href={`https://polygonscan.com/tx/${donation.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-purple hover:text-purple-dark font-bold text-sm border-2 border-purple-200 px-3 py-1 rounded-lg hover:bg-purple-50 transition-colors font-dmsans tracking-tight"
                          >
                            View <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="text-slate-500 text-sm font-bold font-dmsans tracking-tight">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </NGOLayout>
  );
};

export default NGODonations;
