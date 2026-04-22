import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { donationAPI } from '../../utils/api';
import NGOLayout from '../../components/NGOLayout';
import { DollarSign, Search, Download, ArrowUpRight, Wallet, Calendar, User, TrendingUp } from 'lucide-react';

const DONATIONS_LIMIT = 1000;

const NGODonations = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAmount: 0,
    count: 0,
    avgDonation: 0
  });
  const [searchTerm, setSearchInput] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchDonations = async () => {
      try {
        setLoading(true);
        const response = await donationAPI.getByNgo({ limit: DONATIONS_LIMIT });
        const data = response.data?.donations || response.data || [];
        const donationsArray = Array.isArray(data) ? data : [];
        setDonations(donationsArray);

        const total = donationsArray.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
        setStats({
          totalAmount: total,
          count: donationsArray.length,
          avgDonation: donationsArray.length > 0 ? total / donationsArray.length : 0
        });
      } catch (error) {
        console.error('Error fetching donations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const filteredDonations = donations.filter(d => {
    const matchesSearch = 
      (d.donor_name || 'Anonymous').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.campaign_title || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <NGOLayout>
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">Donations</h1>
            <p className="text-slate-600 font-bold tracking-tight">Track and manage all contributions to your campaigns</p>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-8 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary-fixed/70 rounded-xl text-primary">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Revenue</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">
                    ${stats.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-8 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Donors</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">{stats.count}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-8 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Avg. Contribution</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">
                    ${stats.avgDonation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-6 mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by donor or campaign..."
                value={searchTerm}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-bold text-black transition-all"
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black hover:bg-slate-800 transition-all shadow-md">
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>

          {/* Donations Table */}
          <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-100 overflow-hidden">
            {loading ? (
              <div className="text-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                <p className="text-slate-500 font-bold">Loading donations...</p>
              </div>
            ) : filteredDonations.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <DollarSign className="w-10 h-10 text-slate-300" />
                </div>
                <p className="text-slate-500 font-bold text-lg">No donations found matching your search.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b-2 border-slate-100">
                    <tr>
                      <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Donor</th>
                      <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Campaign</th>
                      <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Amount</th>
                      <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-50">
                    {filteredDonations.map((donation) => (
                      <tr key={donation.donation_id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-fixed/70 rounded-full flex items-center justify-center text-primary font-black">
                              {(donation.donor_name || 'A').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-black text-slate-900 tracking-tight">{donation.donor_name || 'Anonymous'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="font-bold text-slate-600 tracking-tight line-clamp-1">{donation.campaign_title}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="font-black text-primary tracking-tighter text-lg">${parseFloat(donation.amount).toLocaleString()}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                            <Calendar className="w-4 h-4" />
                            {new Date(donation.donated_at || donation.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <a
                            href={`https://polygonscan.com/tx/${donation.tx_hash || donation.transaction_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:text-primary-focus font-black text-sm border-2 border-primary/10 px-4 py-2 rounded-xl hover:bg-primary-fixed transition-all tracking-tighter"
                          >
                            TX <ArrowUpRight className="w-4 h-4" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </NGOLayout>
  );
};

export default NGODonations;
