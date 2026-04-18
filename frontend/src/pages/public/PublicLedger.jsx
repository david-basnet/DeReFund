import { useState, useEffect } from 'react';
import { Search, ExternalLink, Filter, ArrowUpRight, ArrowDownLeft, Database } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const PublicLedger = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // We'll fetch real transactions from the blockchain or backend later
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        // Placeholder for real API call
        // const response = await publicAPI.getTransactions();
        // setTransactions(response.data);
        setTransactions([]); // Clear dummy data
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

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
                  ) : transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-surface-container-high transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-primary font-mono text-sm">
                            {tx.id}
                            <ExternalLink className="h-3 w-3" />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">{tx.from}</td>
                        <td className="px-6 py-4 text-sm">{tx.to}</td>
                        <td className="px-6 py-4 font-semibold text-sm">{tx.amount}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            tx.type === 'Donation' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {tx.type === 'Donation' ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-green-600 text-sm font-medium">
                            <span className="h-2 w-2 rounded-full bg-green-600"></span>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">{tx.timestamp}</td>
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
            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant">
              <h3 className="text-on-surface-variant text-sm font-medium mb-1">Total Volume</h3>
              <p className="text-2xl font-bold">0.00 ETH</p>
            </div>
            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant">
              <h3 className="text-on-surface-variant text-sm font-medium mb-1">Total Transactions</h3>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant">
              <h3 className="text-on-surface-variant text-sm font-medium mb-1">Unique Wallets</h3>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PublicLedger;
