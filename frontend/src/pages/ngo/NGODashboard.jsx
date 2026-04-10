import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { campaignAPI, donationAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import NGOLayout from '../../components/NGOLayout';
import { 
  FileText, DollarSign, Users, TrendingUp, 
  AlertCircle, CheckCircle2, Clock, BarChart3
} from 'lucide-react';

const NGODashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRaised: 0,
    totalCampaigns: 0,
    liveCampaigns: 0,
    totalDonations: 0,
  });
  const [_verificationStatus, setVerificationStatus] = useState('ACTION_REQUIRED');

  // Fetch verification status immediately (separate from main data)
  useEffect(() => {
    const fetchVerificationStatus = async (skipIfPending = false) => {
      const userId = user?.user_id || user?.id;
      if (!userId) return;

      // Check localStorage for recent upload timestamp
      const recentUploadTime = localStorage.getItem('ngo_verification_upload_time');
      const recentUpload = recentUploadTime && (Date.now() - parseInt(recentUploadTime)) < 30000; // 30 seconds

      try {
        const usersResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users?role=NGO&limit=1000`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const usersData = await usersResponse.json();
        if (usersData.success && usersData.data?.users) {
          const ngoUser = usersData.data.users.find(u => u.user_id === userId);
          if (ngoUser) {
            const status = ngoUser.verification_status;
            if (!status || status === null || status === undefined || status === '') {
              // Set ACTION_REQUIRED, but don't downgrade if we just uploaded or have recent upload
              setVerificationStatus(current => {
                if ((skipIfPending || recentUpload) && current === 'PENDING') {
                  return current; // Don't downgrade after upload
                }
                return 'ACTION_REQUIRED'; // No documents uploaded
              });
            } else {
              // Always update if we got a valid status from backend (PENDING, APPROVED, REJECTED)
              setVerificationStatus(status);
              // Update localStorage with the latest status
              localStorage.setItem('ngo_verification_status', status);
              // Clear upload timestamp if we got a valid status
              if (status === 'PENDING' || status === 'APPROVED' || status === 'REJECTED') {
                localStorage.removeItem('ngo_verification_upload_time');
              }
            }
          } else {
            // User not found - set ACTION_REQUIRED unless we just uploaded
            setVerificationStatus(current => {
              if ((skipIfPending || recentUpload) && current === 'PENDING') {
                return current;
              }
              return 'ACTION_REQUIRED';
            });
          }
        } else {
          // If API call fails, only default to ACTION_REQUIRED if not PENDING
          setVerificationStatus(current => {
            if ((skipIfPending || recentUpload) && current === 'PENDING') {
              return current;
            }
            return 'ACTION_REQUIRED';
          });
        }
      } catch (error) {
        console.error('Error fetching verification status:', error);
        // Don't change status on error if we're already PENDING
        const recentUploadTime = localStorage.getItem('ngo_verification_upload_time');
        const recentUpload = recentUploadTime && (Date.now() - parseInt(recentUploadTime)) < 30000;
        setVerificationStatus(current => {
          if ((skipIfPending || recentUpload) && current === 'PENDING') {
            return current;
          }
          return 'ACTION_REQUIRED';
        });
      }
    };

    if (user) {
      // Always fetch fresh status from backend to ensure we have the latest
      fetchVerificationStatus();
    }

    // Listen for verification status updates from other components (e.g., when document is uploaded)
    const handleStatusUpdate = (event) => {
      const { status } = event.detail;
      if (status === 'PENDING') {
        // Immediately update to PENDING when document is uploaded
        setVerificationStatus('PENDING');
        localStorage.setItem('ngo_verification_status', 'PENDING');
        localStorage.setItem('ngo_verification_upload_time', Date.now().toString());
        // Then refetch after delay to ensure consistency, but don't downgrade
        setTimeout(() => {
          fetchVerificationStatus(true);
        }, 2000);
      }
    };

    window.addEventListener('verificationStatusUpdated', handleStatusUpdate);
    
    return () => {
      window.removeEventListener('verificationStatusUpdated', handleStatusUpdate);
    };
  }, [user]);

  async function fetchDashboardData() {
    try {
      // Don't show loading - display data as it loads
      const userId = user?.user_id || user?.id;

      // Fetch campaigns
      const campaignsResponse = await campaignAPI.getAll({ ngo_id: userId });
      const campaignsData = Array.isArray(campaignsResponse.data?.campaigns) 
        ? campaignsResponse.data.campaigns 
        : [];

      // Calculate stats
      let totalRaised = 0;
      let totalDonations = 0;
      const liveCampaigns = campaignsData.filter(c => c.status === 'LIVE').length;

      for (const campaign of campaignsData) {
        try {
          const donationsResponse = await donationAPI.getByCampaign(campaign.campaign_id);
          const donations = Array.isArray(donationsResponse.data?.donations) 
            ? donationsResponse.data.donations 
            : [];
          totalDonations += donations.length;
          totalRaised += donations.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
        } catch (err) {
          console.error(`Error fetching donations for campaign ${campaign.campaign_id}:`, err);
        }
      }

      setStats({
        totalRaised,
        totalCampaigns: campaignsData.length,
        liveCampaigns,
        totalDonations,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => {
      fetchDashboardData();
    }, 0);
    return () => clearTimeout(timer);
  }, [user]);

  return (
    <NGOLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 font-playfair tracking-tight">
            Welcome back, {user?.name || 'NGO'}!
          </h1>
          <p className="text-slate-600 font-dmsans tracking-tight">
            Manage your campaigns and track your impact
          </p>
        </div>


        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <FileText className="w-6 h-6 text-blue-600" />
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
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1 font-playfair tracking-tight">
              {stats.liveCampaigns}
            </div>
            <div className="text-sm text-slate-600 font-dmsans tracking-tight">Live Campaigns</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 rounded-lg">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1 font-playfair tracking-tight">
              {stats.totalDonations}
            </div>
            <div className="text-sm text-slate-600 font-dmsans tracking-tight">Total Donations</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 font-playfair tracking-tight">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/ngo/campaigns"
                className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-purple" />
                  <span className="font-bold text-black font-dmsans tracking-tight">View All Campaigns</span>
                </div>
              </Link>
              <Link
                to="/ngo/analytics"
                className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-purple" />
                  <span className="font-bold text-black font-dmsans tracking-tight">View Analytics</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </NGOLayout>
  );
};

export default NGODashboard;

