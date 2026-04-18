import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { donationAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import DonorLayout from '../../components/DonorLayout';

const MyDonations = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalDonated, setTotalDonated] = useState(0);

  useEffect(() => {
    const fetchDonations = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await donationAPI.getMyDonations();
        // Handle different response structures: response.data.donations, response.data, or response
        const donationsData = response.data?.donations || response.data || response.donations || response || [];
        // Ensure it's always an array
        const donationsArray = Array.isArray(donationsData) ? donationsData : [];
        setDonations(donationsArray);
        
        const total = donationsArray.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
        setTotalDonated(total);
      } catch (error) {
        console.error('Error fetching donations:', error);
        setDonations([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [user]);

  if (!user) {
    return (
      <DonorLayout>
        <div className="p-6 lg:p-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-black mb-4 tracking-tight">Please Log In</h2>
            <p className="text-gray-800 mb-4 tracking-tight">You need to be logged in to view your donations.</p>
            <Link to="/" className="text-purple hover:text-light-purple underline-animate tracking-tight font-bold">Go to Home</Link>
          </div>
        </div>
      </DonorLayout>
    );
  }

  return (
    <DonorLayout>
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-black mb-2 tracking-tight">My Donations</h1>
            <p className="text-gray-700 text-lg tracking-tight">
              Track all your contributions and see the impact you're making.
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-primary to-[#001a38] rounded-xl p-6 text-white">
              <div className="text-3xl font-bold mb-2 tracking-tight">
                ${totalDonated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-sm opacity-90 tracking-tight">Total Donated</div>
            </div>
            <div className="bg-gradient-to-br from-primary to-primary-container rounded-xl p-6 text-white">
              <div className="text-3xl font-bold mb-2 tracking-tight">{donations.length}</div>
              <div className="text-sm opacity-90 tracking-tight">Total Donations</div>
            </div>
            <div className="bg-gradient-to-br from-primary to-primary-container rounded-xl p-6 text-white">
              <div className="text-3xl font-bold mb-2 tracking-tight">
                {Array.isArray(donations) ? new Set(donations.map(d => d.campaign_id)).size : 0}
              </div>
              <div className="text-sm opacity-90 tracking-tight">Campaigns Supported</div>
            </div>
          </div>

          {/* Donations List */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple mx-auto mb-4"></div>
                <p className="text-gray-800 tracking-tight">Loading your donations...</p>
              </div>
            ) : !Array.isArray(donations) || donations.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <p className="text-gray-800 mb-4 tracking-tight">You haven't made any donations yet.</p>
                <Link
                  to="/campaigns"
                  className="inline-block bg-gradient-to-r from-primary to-[#001a38] text-white px-6 py-3 rounded-xl font-bold hover-lift shadow-lg transition-all duration-300 tracking-tight"
                >
                  View Live Campaigns
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-primary to-[#001a38]">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-white tracking-tight">Campaign</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-white tracking-tight">Amount</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-white tracking-tight">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-white tracking-tight">Transaction</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-white tracking-tight">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray">
                      {Array.isArray(donations) && donations.map((donation) => (
                        <tr key={donation.donation_id} className="hover:bg-light-gray transition-colors">
                          <td className="px-6 py-4">
                            <Link
                              to={`/campaigns/${donation.campaign_id}`}
                              className="text-primary hover:text-[#0a3d6b] font-medium underline-animate tracking-tight"
                            >
                              {donation.campaign?.title || 'Campaign'}
                            </Link>
                          </td>
                          <td className="px-6 py-4 font-bold text-primary tracking-tight">
                            ${parseFloat(donation.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 text-gray-800 tracking-tight">
                            {new Date(donation.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            {donation.tx_hash ? (
                              <a
                                href={`https://polygonscan.com/tx/${donation.tx_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple hover:text-light-purple underline-animate  text-sm tracking-tight"
                              >
                                View on PolygonScan
                              </a>
                            ) : (
                              <span className="text-gray  text-sm tracking-tight">Pending</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-tight ${
                              donation.tx_hash ? 'bg-green-100 text-green-700' : 'bg-yellow/20 text-yellow-700'
                            }`}>
                              {donation.tx_hash ? 'Confirmed' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DonorLayout>
  );
};

export default MyDonations;
