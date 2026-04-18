import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Heart,
  Shield,
  TrendingUp,
  Settings,
  LogOut,
  AlertTriangle,
  FileText,
  Plus,
  Menu,
  UserCircle,
  Home,
} from 'lucide-react';

const DonorLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
    { path: '/donor', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/donor/campaigns', icon: FileText, label: 'Campaigns' },
    { path: '/donor/create-campaign', icon: Plus, label: 'Propose campaign' },
    { path: '/donor/report-disaster', icon: AlertTriangle, label: 'Disaster Management' },
    { path: '/donor/donations', icon: Heart, label: 'My Donations' },
    { path: '/donor/voting', icon: Shield, label: 'Volunteer Voting' },
    { path: '/donor/impact', icon: TrendingUp, label: 'My Impact' },
    { path: '/donor/profile', icon: Settings, label: 'Profile Settings' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    if (path === '/donor') {
      return location.pathname === '/donor';
    }
    // For campaigns, also match campaign detail pages
    if (path === '/donor/campaigns') {
      return location.pathname.startsWith('/donor/campaigns');
    }
    if (path === '/donor/create-campaign') {
      return location.pathname === '/donor/create-campaign';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                      Donor Portal
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

          {/* Logout */}
          <div className="border-t border-white/20 px-3 py-4">
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
                  {user?.name || 'Donor'}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {user?.email || 'donor@example.com'}
                </p>
              </div>
            </div>
            <div className="relative group shrink-0">
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-100 sm:px-4"
              >
                <UserCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Account</span>
              </button>
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute right-0 top-full mt-2 w-40 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg ring-1 ring-slate-200/70">
                <Link
                  to="/donor/profile"
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
        <div className="min-h-screen px-4 py-4 sm:px-5">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DonorLayout;

