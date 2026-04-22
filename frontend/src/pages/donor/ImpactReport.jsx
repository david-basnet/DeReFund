import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { donationAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import DonorLayout from '../../components/DonorLayout';
import { Target, DollarSign, TrendingUp, Award, Download, Calendar, Loader2, Heart, CheckCircle2, ArrowRight } from 'lucide-react';

const IMPACT_LIMIT = 1000;

const ImpactReport = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDonated: 0,
    campaignsSupported: 0,
    totalDonations: 0,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchImpactData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await donationAPI.getMyDonations({ limit: IMPACT_LIMIT });
        // Handle different response structures: response.data.donations, response.data, or response
        const donationsData = response.data?.donations || response.data || response.donations || response || [];
        // Ensure it's always an array
        const donationsArray = Array.isArray(donationsData) ? donationsData : [];
        setDonations(donationsArray);

        const totalDonated = donationsArray.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
        const campaignsSupported = new Set(donationsArray.map(d => d.campaign_id)).size;

        setStats({
          totalDonated,
          campaignsSupported,
          totalDonations: donationsArray.length,
        });
      } catch (error) {
        console.error('Error fetching impact data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImpactData();
  }, [user]);

  if (!user) {
    return (
      <DonorLayout>
        <div className="p-6 lg:p-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-black mb-4 tracking-tight">Please Log In</h2>
            <p className="text-gray-800 tracking-tight">You need to be logged in to view your impact.</p>
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
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-primary-fixed/70 rounded-xl flex items-center justify-center">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-black mb-2 tracking-tight">My Impact</h1>
                <p className="text-gray-700 text-lg tracking-tight">
                  See the difference you're making in the world
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-primary to-[#001a38] rounded-xl p-6 text-white">
              <div className="text-3xl font-bold mb-2 tracking-tight">
                ${stats.totalDonated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-sm opacity-90 tracking-tight">Total Donated</div>
            </div>
            <div className="bg-gradient-to-br from-primary to-primary-container rounded-xl p-6 text-white">
              <div className="text-3xl font-bold mb-2 tracking-tight">
                {stats.campaignsSupported}
              </div>
              <div className="text-sm opacity-90 tracking-tight">Campaigns Supported</div>
            </div>
            <div className="bg-gradient-to-br from-primary to-primary-container rounded-xl p-6 text-white">
              <div className="text-3xl font-bold mb-2 tracking-tight">
                {stats.totalDonations}
              </div>
              <div className="text-sm opacity-90 tracking-tight">Total Donations</div>
            </div>
          </div>

          {/* Certificate */}
          <div className="bg-gradient-to-br from-primary-fixed/60 to-primary-fixed rounded-2xl shadow-lg p-8 mb-8 border-2 border-outline-variant">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-primary to-[#001a38] rounded-xl shadow-lg">
                  <Award className="h-12 w-12 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-black mb-6 tracking-tight">Impact Certificate</h2>
              <div className="bg-white rounded-2xl p-8 inline-block shadow-xl border border-gray/20">
                <p className="text-lg text-gray-800 mb-3 tracking-tight">This certifies that</p>
                <p className="text-3xl font-bold text-primary mb-4 tracking-tight">{user.name}</p>
                <p className="text-lg text-gray-800 mb-4 tracking-tight">has contributed</p>
                <p className="text-5xl font-bold text-primary mb-4 tracking-tight">
                  ${stats.totalDonated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-lg text-gray-800 tracking-tight">to {stats.campaignsSupported} disaster relief {stats.campaignsSupported === 1 ? 'campaign' : 'campaigns'}</p>
                <div className="mt-8 pt-6 border-t border-gray">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-primary" />
                    <p className="text-sm font-bold text-primary tracking-tight">DeReFund Platform</p>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-800" />
                    <p className="text-xs text-gray-800 tracking-tight">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => window.print()}
                className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-[#001a38] text-white rounded-xl hover:shadow-lg transition-all font-bold tracking-tight"
              >
                <Download className="h-5 w-5" />
                Download Certificate
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-black mb-6 tracking-tight">Donation Timeline</h2>
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="inline-block animate-spin h-12 w-12 text-primary mb-4" />
                <p className="text-gray-800 tracking-tight">Loading your impact data...</p>
              </div>
            ) : donations.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <Heart className="h-16 w-16 text-primary/35" />
                </div>
                <p className="text-gray-800 mb-6 text-lg tracking-tight">You haven't made any donations yet.</p>
                <Link
                  to="/campaigns"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-[#001a38] text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all tracking-tight"
                >
                  Start Making an Impact
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.isArray(donations) && donations.slice(0, 10).map((donation, index) => (
                  <div 
                    key={donation.donation_id}
                    className="flex items-start space-x-4 pb-6 border-b border-gray last:border-0 hover:bg-gray-50 p-4 rounded-xl transition-colors"
                  >
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-primary to-[#001a38] rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-lg">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <Link
                            to={`/campaigns/${donation.campaign_id}`}
                            className="font-bold text-black hover:text-primary transition-colors  text-lg tracking-tight"
                          >
                            {donation.campaign?.title || 'Campaign'}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4 text-gray-800" />
                            <p className="text-sm text-gray-800 tracking-tight">
                              {new Date(donation.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary tracking-tight">
                            ${parseFloat(donation.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          {donation.tx_hash && (
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-xs text-green-600  font-semibold tracking-tight">Confirmed</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {donations.length > 10 && (
                  <div className="text-center pt-6">
                    <Link
                      to="/donor/donations"
                      className="inline-flex items-center gap-2 text-primary hover:text-[#0a3d6b] font-bold underline-animate tracking-tight"
                    >
                      View All Donations
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DonorLayout>
  );
};

export default ImpactReport;
