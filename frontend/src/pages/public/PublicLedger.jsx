import { useState, useEffect } from 'react';
import { Search, ExternalLink, Filter, ArrowUpRight, ArrowDownLeft, Database } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { donationAPI } from '../../utils/api';

const PublicLedger = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    total_volume: 0,
    total_transactions: 0,
    unique_donors: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await donationAPI.getAll({ limit: 50 });
        if (response.success) {
          setTransactions(response.data.donations);
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(tx => 
    (tx.tx_hash?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (tx.donor_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (tx.campaign_title?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const formatAddress = (addr) => {
    if (!addr) return 'Unknown';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-on-surface mb-2">Public Ledger</h1>
            <p className="text-on-surface-variant">Transparency through blockchain. Every donation and disbursement is recorded here.</p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search by transaction hash, address, or campaign..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-outline-variant hover:bg-surface-container-high transition-colors">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Transaction Table */}
          <div className="bg-surface-container-low rounded-2xl border border-outline-variant overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-high">
                    <th className="px-6 py-4 text-sm font-semibold text-on-surface-variant">Transaction Hash</th>
                    <th className="px-6 py-4 text-sm font-semibold text-on-surface-variant">From</th>
                    <th className="px-6 py-4 text-sm font-semibold text-on-surface-variant">To</th>
                    <th className="px-6 py-4 text-sm font-semibold text-on-surface-variant">Amount</th>
                    <th className="px-6 py-4 text-sm font-semibold text-on-surface-variant">Type</th>
                    <th className="px-6 py-4 text-sm font-semibold text-on-surface-variant">Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-on-surface-variant">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan="7" className="px-6 py-4">
                          <div className="h-4 bg-outline-variant/20 rounded w-full"></div>
                        </td>
                      </tr>
                    ))
                  ) : filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.donation_id} className="hover:bg-surface-container-high transition-colors">
                        <td className="px-6 py-4">
                          <a 
                            href={`https://sepolia.etherscan.io/tx/${tx.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary font-mono text-xs hover:underline"
                          >
                            {formatAddress(tx.tx_hash)}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">{tx.donor_name || 'Anonymous Donor'}</td>
                        <td className="px-6 py-4 text-sm">{tx.campaign_title}</td>
                        <td className="px-6 py-4 font-bold text-sm text-on-surface">
                          ${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            tx.token_type === 'ETH' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {tx.token_type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-green-600 text-xs font-black uppercase tracking-widest">
                            <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse"></span>
                            Verified
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-on-surface-variant">
                          {new Date(tx.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3 text-on-surface-variant">
                          <Database className="h-12 w-12 opacity-20" />
                          <p className="text-lg font-medium">No transactions recorded yet.</p>
                          <p className="text-sm">When donations are made on-chain, they will appear here in real-time.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-surface-container-low p-6 rounded-2xl border border-black shadow-sm">
              <h3 className="text-on-surface-variant text-xs font-black uppercase tracking-widest mb-2">Total Impact (USD)</h3>
              <p className="text-3xl font-black">${stats.total_volume.toLocaleString()}</p>
            </div>
            <div className="bg-surface-container-low p-6 rounded-2xl border border-black shadow-sm">
              <h3 className="text-on-surface-variant text-xs font-black uppercase tracking-widest mb-2">Total Contributions</h3>
              <p className="text-3xl font-black">{stats.total_transactions}</p>
            </div>
            <div className="bg-surface-container-low p-6 rounded-2xl border border-black shadow-sm">
              <h3 className="text-on-surface-variant text-xs font-black uppercase tracking-widest mb-2">Unique Donors</h3>
              <p className="text-3xl font-black">{stats.unique_donors}</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PublicLedger;
