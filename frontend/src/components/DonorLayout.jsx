import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Heart, Shield, TrendingUp, Settings,
  LogOut, AlertTriangle, FileText, Plus
} from 'lucide-react';

const DonorLayout = ({ children }) => {
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
    { path: '/donor', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/donor/campaigns', icon: FileText, label: 'Campaigns' },
    { path: '/donor/report-disaster', icon: Plus, label: 'Create Disaster' },
    { path: '/donor/donations', icon: Heart, label: 'My Donations' },
    { path: '/donor/verify', icon: Shield, label: 'Verify Campaigns' },
    { path: '/donor/impact', icon: TrendingUp, label: 'My Impact' },
    { path: '/donor/profile', icon: Settings, label: 'Profile Settings' },
  ];

  const isActive = (path) => {
    if (path === '/donor') {
      return location.pathname === '/donor';
    }
    // For campaigns, also match campaign detail pages
    if (path === '/donor/campaigns') {
      return location.pathname.startsWith('/donor/campaigns');
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-blue-600 via-blue-700 to-blue-800 text-white transition-all duration-300 fixed h-screen z-40 shadow-2xl`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <h1 className="text-2xl font-bold font-playfair tracking-tight">Donor Portal</h1>
              )}
              {!sidebarOpen && (
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6" />
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-white/20">
            {sidebarOpen ? (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                    {user?.name?.charAt(0).toUpperCase() || 'D'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate font-dmsans">{user?.name || 'Donor'}</p>
                    <p className="text-sm text-white/80 truncate font-dmsans">{user?.email || ''}</p>
                  </div>
                </div>
                <div className="mt-2 px-3 py-2 bg-white/10 rounded-lg">
                  <p className="text-xs text-white/90 font-dmsans">Donor/Volunteer</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                  {user?.name?.charAt(0).toUpperCase() || 'D'}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        active
                          ? 'bg-white/20 text-white shadow-lg'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {sidebarOpen && (
                        <span className="font-medium font-dmsans tracking-tight">{item.label}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/20">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 bg-red-600/80 hover:bg-red-600 text-white rounded-xl transition-all duration-200 font-bold font-dmsans tracking-tight"
            >
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span>LOGOUT</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DonorLayout;

