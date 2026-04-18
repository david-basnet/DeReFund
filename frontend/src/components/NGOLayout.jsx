import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../utils/api';
import { useAccount } from 'wagmi';
import {
  Home,
  LayoutDashboard,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Building2,
  AlertCircle,
  Plus,
  Menu,
  UserCircle,
  X,
  Bell,
  Check,
  Trash2,
  Wallet,
} from 'lucide-react';

const NGOLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { address, isConnected } = useAccount();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/ngo', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/ngo/campaigns', icon: FileText, label: 'My Campaigns' },
    { path: '/ngo/create-campaign', icon: Plus, label: 'Create Campaign' },
    { path: '/ngo/disasters/report', icon: AlertCircle, label: 'Disaster Management' },
    { path: '/ngo/donations', icon: DollarSign, label: 'Donations' },
    { path: '/ngo/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/ngo/profile', icon: Settings, label: 'Profile' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    if (path === '/ngo') {
      return location.pathname === '/ngo';
    }
    // For campaigns, also match campaign detail pages
    if (path === '/ngo/campaigns') {
      return location.pathname.startsWith('/ngo/campaigns');
    }
    return location.pathname.startsWith(path);
  };

  const [verificationStatus, setVerificationStatus] = useState('ACTION_REQUIRED');
  const [showRejectionNotification, setShowRejectionNotification] = useState(false);
  const [hasCheckedNotification, setHasCheckedNotification] = useState(false);
  
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getAll();
      if (response.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.notification_id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationAPI.delete(id);
      setNotifications(notifications.filter(n => n.notification_id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll for new notifications every 2 minutes
      const interval = setInterval(fetchNotifications, 120000);
      return () => clearInterval(interval);
    }
  }, [user]);
  
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
    <div className="min-h-screen bg-gray-50">
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
                <h3 className="text-xl font-bold text-black mb-2 tracking-tight">
                  Verification Rejected
                </h3>
                <p className="text-gray-700 mb-4 tracking-tight">
                  Your verification documents have been rejected. Please review and resubmit your documents with the necessary corrections.
                </p>
                <div className="flex gap-3">
                  <Link
                    to="/ngo/profile"
                    onClick={() => setShowRejectionNotification(false)}
                    className="flex-1 bg-primary text-on-primary px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-center font-bold tracking-tight"
                  >
                    Go to Profile
                  </Link>
                  <button
                    onClick={() => setShowRejectionNotification(false)}
                    className="px-4 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors font-bold tracking-tight"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isMobile && sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-[1px] lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen flex-col overflow-hidden bg-gradient-to-b from-[#022649] via-[#032f55] to-[#001a38] text-white shadow-2xl transition-all duration-300 ${
          isMobile
            ? sidebarOpen
              ? 'w-72 translate-x-0'
              : 'w-72 -translate-x-full'
            : sidebarOpen
              ? 'w-64'
              : 'w-20'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="border-b border-white/10 px-3 py-3">
            <div
              className={`flex items-center gap-2 ${
                sidebarOpen ? 'justify-between' : 'justify-center'
              }`}
            >
              <button
                type="button"
                onClick={() => setSidebarOpen((open) => !open)}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 transition-colors hover:bg-white/20"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5 text-white" />
              </button>
              {sidebarOpen && (
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="min-w-0">
                    <h1 className="truncate text-sm font-semibold tracking-tight text-white">
                      NGO Portal
                    </h1>
                    <p className="truncate text-[11px] text-white/80">Quick access</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center rounded-2xl transition-all duration-200 ${
                        sidebarOpen
                          ? 'gap-3 px-4 py-3 justify-start'
                          : 'justify-center px-0 py-3'
                      } ${
                        active
                          ? 'bg-white/20 text-white shadow-lg'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {sidebarOpen && (
                        <span className="truncate text-sm font-medium tracking-tight">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Info & Logout (Desktop Sidebar Bottom) */}
          <div className="border-t border-white/20 px-3 py-4">
            {sidebarOpen && (
              <div className="flex items-center gap-3 px-2 py-2 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 border border-white/10">
                  <span className="text-sm font-bold text-white tracking-tight">
                    {user?.name?.charAt(0).toUpperCase() || 'N'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate tracking-tight">
                    {user?.name || 'NGO'}
                  </div>
                  <div className="text-xs font-medium text-white/60 truncate tracking-tight">
                    {user?.email || 'ngo@example.com'}
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all duration-200 hover:bg-white/20 ${
                sidebarOpen
                  ? 'w-full gap-2 px-3 py-2 text-[13px] font-medium'
                  : 'h-11 w-full px-0'
              }`}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`min-h-screen transition-all duration-300 ${
          isMobile ? 'ml-0' : sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <div className="sticky top-0 z-20 bg-white/95 shadow-sm border-b border-slate-200/10 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              {isMobile && (
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#022649] text-white shadow-sm transition-colors hover:bg-[#03325d] lg:hidden"
                  aria-label="Open sidebar"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-primary">
                <UserCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {user?.name || 'NGO'}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {user?.email || 'ngo@example.com'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              {/* Wallet Status */}
              <div className={`hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 ${
                isConnected 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-amber-50 text-amber-700 opacity-60'
              }`}>
                <Wallet className={`w-4 h-4 ${isConnected ? 'animate-pulse' : ''}`} />
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                    {isConnected ? 'Wallet Connected' : 'No Wallet'}
                  </span>
                  {isConnected && (
                    <span className="text-xs font-bold font-mono leading-none mt-1">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                  )}
                </div>
              </div>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-400 hover:text-primary transition-colors bg-slate-100 rounded-xl"
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-slate-900">Notifications</h3>
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div 
                            key={notification.notification_id}
                            className={`p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors relative group ${
                              !notification.is_read ? 'bg-primary/5' : ''
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                                notification.type === 'WARNING' ? 'bg-amber-500' : 
                                notification.type === 'ERROR' ? 'bg-red-500' : 
                                notification.type === 'SUCCESS' ? 'bg-green-500' : 'bg-blue-500'
                              }`} />
                              <div className="flex-1">
                                <h4 className="text-sm font-bold text-slate-900 mb-1">{notification.title}</h4>
                                <p className="text-xs text-slate-600 mb-2 leading-relaxed">{notification.message}</p>
                                <div className="flex items-center gap-4">
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {new Date(notification.created_at).toLocaleDateString()}
                                  </span>
                                  {notification.link && (
                                    <Link 
                                      to={notification.link}
                                      onClick={() => {
                                        markNotificationAsRead(notification.notification_id);
                                        setShowNotifications(false);
                                      }}
                                      className="text-[10px] text-primary font-bold hover:underline"
                                    >
                                      View Details
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notification.is_read && (
                                <button 
                                  onClick={() => markNotificationAsRead(notification.notification_id)}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                  title="Mark as read"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              )}
                              <button 
                                onClick={() => deleteNotification(notification.notification_id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-slate-400">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                          <p className="text-sm">No notifications yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative group">
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-100 sm:px-4"
                >
                  <UserCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Account</span>
                </button>
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute right-0 top-full mt-2 w-40 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg ring-1 ring-slate-200/70">
                  <Link
                    to="/ngo/profile"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Settings className="w-4 h-4" />
                    Profile settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="min-h-screen px-4 py-4 sm:px-5">
          {children}
        </div>
      </main>
    </div>
  );
};

export default NGOLayout;

