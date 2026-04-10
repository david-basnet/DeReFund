import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FileText, DollarSign, BarChart3, Settings,
  LogOut, X, Building2, AlertCircle, CheckCircle2, Plus
} from 'lucide-react';

const NGOLayout = ({ children }) => {
  const [sidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/ngo', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/ngo/campaigns', icon: FileText, label: 'My Campaigns' },
    { path: '/ngo/create-campaign', icon: Plus, label: 'Create Campaign' },
    { path: '/ngo/donations', icon: DollarSign, label: 'Donations' },
    { path: '/ngo/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/ngo/profile', icon: Settings, label: 'Profile' },
  ];

  const isActive = (path) => {
    if (path === '/ngo') {
      return location.pathname === '/ngo';
    }
    // For campaigns, also match campaign detail pages
    if (path === '/ngo/campaigns') {
      return location.pathname.startsWith('/ngo/campaigns');
    }
    return location.pathname.startsWith(path);
  };

  // Check verification status
  const [verificationStatus, setVerificationStatus] = useState('ACTION_REQUIRED');
  const [showRejectionNotification, setShowRejectionNotification] = useState(false);
  const [hasCheckedNotification, setHasCheckedNotification] = useState(false);
  
  useEffect(() => {
    const fetchVerificationStatus = async (skipIfPending = false) => {
      try {
        // Check localStorage for recent upload timestamp
        const recentUploadTime = localStorage.getItem('ngo_verification_upload_time');
        const recentUpload = recentUploadTime && (Date.now() - parseInt(recentUploadTime)) < 30000; // 30 seconds

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users?role=NGO&limit=1000`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.success && data.data?.users) {
          const ngoUser = data.data.users.find(u => u.user_id === user?.user_id || u.user_id === user?.id);
          if (ngoUser) {
            // If verification_status exists, documents have been uploaded
            const status = ngoUser.verification_status;
            // If status is null, undefined, or empty, it means ACTION_REQUIRED (no documents uploaded)
            // Only show PENDING if status is explicitly 'PENDING' (meaning documents were uploaded)
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
              
              // Show notification if status is REJECTED and we haven't shown it yet for this session
              if (status === 'REJECTED' && !hasCheckedNotification) {
                setShowRejectionNotification(true);
                setHasCheckedNotification(true);
              }
            }
          } else {
            // New NGO user, no verification record - only set if not PENDING
            setVerificationStatus(current => {
              if ((skipIfPending || recentUpload) && current === 'PENDING') {
                return current;
              }
              return 'ACTION_REQUIRED';
            });
          }
        } else {
          // If API call fails or no users found, only default to ACTION_REQUIRED if not PENDING
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

    // Listen for verification status updates from other components
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
  }, [user, hasCheckedNotification]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-light-purple-50 flex">
      {/* Rejection Notification Popup */}
      {showRejectionNotification && verificationStatus === 'REJECTED' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowRejectionNotification(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-50 rounded-full">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-black mb-2 font-playfair tracking-tight">
                  Verification Rejected
                </h3>
                <p className="text-gray-700 mb-4 font-dmsans tracking-tight">
                  Your verification documents have been rejected. Please review and resubmit your documents with the necessary corrections.
                </p>
                <div className="flex gap-3">
                  <Link
                    to="/ngo/profile"
                    onClick={() => setShowRejectionNotification(false)}
                    className="flex-1 bg-purple text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-center font-bold font-dmsans tracking-tight"
                  >
                    Go to Profile
                  </Link>
                  <button
                    onClick={() => setShowRejectionNotification(false)}
                    className="px-4 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors font-bold font-dmsans tracking-tight"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Sidebar */}
      <aside
        className={`bg-gradient-to-b from-purple to-light-purple text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } fixed left-0 top-0 h-screen z-50 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-purple-300/30">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg font-playfair tracking-tight">NGO Portal</span>
            </div>
          )}
          {!sidebarOpen && (
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mx-auto">
              <Building2 className="w-5 h-5" />
            </div>
          )}
        </div>


        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    active
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : ''}`} />
                  {sidebarOpen && (
                    <span className="font-medium font-dmsans tracking-tight flex-1">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-purple-300/30 p-4">
          {sidebarOpen ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-white font-dmsans tracking-tight">
                    {user?.name?.charAt(0).toUpperCase() || 'N'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-black truncate font-dmsans tracking-tight">
                    {user?.name || 'NGO'}
                  </div>
                  <div className="text-xs font-medium text-black truncate font-dmsans tracking-tight">
                    {user?.email || 'ngo@example.com'}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors font-dmsans tracking-tight"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-bold">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white font-dmsans tracking-tight">
                  {user?.name?.charAt(0).toUpperCase() || 'N'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-white/80 hover:bg-white/10 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-purple-100 h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40 shadow-sm">
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default NGOLayout;

