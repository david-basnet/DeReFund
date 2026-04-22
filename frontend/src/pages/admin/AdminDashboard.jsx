import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { adminAPI } from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import { 
  Users, ShieldCheck, AlertTriangle, Activity, TrendingUp, FileText,
  DollarSign, CheckCircle2, Clock, BarChart3, ArrowUpRight, Zap, Globe
} from 'lucide-react';

const AdminDashboard = () => {
  const location = useLocation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingVerifications: 0,
    pendingDisasters: 0,
    pendingCampaigns: 0,
    totalCampaigns: 0,
    totalDonations: 0,
    totalRaised: 0,
    activeCampaigns: 0,
    verifiedNGOs: 0,
  });

  // Define fetchStats function - OPTIMIZED with single aggregation query
  async function fetchStats() {
    try {
      // Use the new optimized dashboard stats endpoint
      const response = await adminAPI.getDashboardStats();
      
      if (response.success && response.data) {
        setStats({
          totalUsers: response.data.totalUsers || 0,
          pendingVerifications: response.data.pendingVerifications || 0,
          pendingDisasters: response.data.pendingDisasters || 0,
          pendingCampaigns: response.data.pendingCampaigns || 0,
          totalCampaigns: response.data.totalCampaigns || 0,
          totalDonations: response.data.totalDonations || 0,
          totalRaised: response.data.totalRaised || 0,
          activeCampaigns: response.data.activeCampaigns || 0,
          verifiedNGOs: response.data.verifiedNGOs || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set defaults on error
      setStats({
        totalUsers: 0,
        pendingVerifications: 0,
        pendingDisasters: 0,
        pendingCampaigns: 0,
        totalCampaigns: 0,
        totalDonations: 0,
        totalRaised: 0,
        activeCampaigns: 0,
        verifiedNGOs: 0,
      });
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => {
      if (location.pathname === '/admin') {
        fetchStats();
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Additional fetch when navigating back to dashboard (already fetched on mount above)


  const primaryStats = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-slate-700 to-slate-900',
      bgColor: 'bg-slate-50',
      iconColor: 'text-slate-600',
      link: '/admin/users',
    },
    {
      title: 'Total Raised',
      value: stats.totalRaised >= 1000000 
        ? `$${(stats.totalRaised / 1000000).toFixed(2)}M`
        : stats.totalRaised >= 1000
          ? `$${(stats.totalRaised / 1000).toFixed(1)}K`
          : `$${stats.totalRaised.toFixed(2)}`,
      icon: DollarSign,
      color: 'from-emerald-600 to-emerald-800',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      link: '/admin/logs',
    },
    {
      title: 'Active Campaigns',
      value: stats.activeCampaigns,
      icon: Activity,
      color: 'from-primary to-[#001a38]',
      bgColor: 'bg-primary-fixed/50',
      iconColor: 'text-primary',
      link: '/admin/campaigns',
    },
    {
      title: 'Verified NGOs',
      value: stats.verifiedNGOs,
      icon: ShieldCheck,
      color: 'from-violet-600 to-violet-800',
      bgColor: 'bg-violet-50',
      iconColor: 'text-violet-600',
      link: '/admin/users',
    },
  ];

  const actionCards = [
    {
      title: 'Pending Verifications',
      value: stats.pendingVerifications,
      icon: Clock,
      color: 'bg-amber-500',
      link: '/admin/users',
      description: 'NGO accounts awaiting verification',
      urgent: stats.pendingVerifications > 0,
    },
    {
      title: 'Pending Disasters',
      value: stats.pendingDisasters,
      icon: AlertTriangle,
      color: 'bg-red-500',
      link: '/admin/disasters',
      description: 'Disaster cases pending review',
      urgent: stats.pendingDisasters > 0,
    },
    {
      title: 'Campaign Approvals',
      value: stats.pendingCampaigns,
      icon: CheckCircle2,
      color: 'bg-indigo-500',
      link: '/admin/campaigns',
      description: 'Campaigns ready for final approval',
      urgent: stats.pendingCampaigns > 0,
    },
  ];

  return (
    <AdminLayout>
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-full p-6 lg:p-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                  Admin Control Center
                </h1>
                <p className="text-slate-600 tracking-tight">
                  Monitor and manage platform operations
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-slate-700 tracking-tight">System Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {primaryStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Link
                  key={`primary-${index}`}
                  to={stat.link}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      Live
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="text-3xl font-bold text-slate-900 tracking-tight group-hover:text-slate-700 transition-colors">
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-600 tracking-tight mt-1">
                      {stat.title}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-4 group-hover:text-slate-700 transition-colors">
                    <span className="font-medium tracking-tight">View details</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Action Required Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {actionCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Link
                  key={`action-${index}`}
                  to={card.link}
                  className={`bg-white rounded-xl shadow-sm border-2 ${
                    card.urgent ? 'border-red-200 bg-red-50/50' : 'border-slate-200'
                  } p-6 hover:shadow-md transition-all duration-300 group relative overflow-hidden`}
                >
                  {card.urgent && (
                    <div className="absolute top-0 right-0 w-20 h-20 bg-red-100 rounded-bl-full opacity-50"></div>
                  )}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${card.color} shadow-sm`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {card.urgent && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full tracking-tight">
                          Action Required
                        </span>
                      )}
                    </div>
                    <div className="mb-2">
                      <div className="text-4xl font-bold text-slate-900 tracking-tight mb-1">
                        {card.value}
                      </div>
                      <div className="text-lg font-semibold text-slate-800 tracking-tight mb-2">
                        {card.title}
                      </div>
                      <div className="text-sm text-slate-600 tracking-tight">
                        {card.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-4 group-hover:text-slate-700 transition-colors">
                      <span className="font-medium tracking-tight">Review now</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Quick Actions & Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Quick Actions</h2>
                <Zap className="w-5 h-5 text-slate-400" />
              </div>
              <div className="space-y-3">
                <Link
                  to="/admin/users"
                  className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-200 rounded-lg group-hover:bg-slate-300 transition-colors">
                      <Users className="w-5 h-5 text-slate-700" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 tracking-tight">Manage Users</div>
                      <div className="text-sm text-slate-600 tracking-tight">View and verify user accounts</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </Link>

                <Link
                  to="/admin/disasters"
                  className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 tracking-tight">Review Disasters</div>
                      <div className="text-sm text-slate-600 tracking-tight">Approve disaster cases</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </Link>

                <Link
                  to="/admin/campaigns"
                  className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-fixed/70 rounded-lg group-hover:bg-primary-fixed transition-colors">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 tracking-tight">Approve Campaigns</div>
                      <div className="text-sm text-slate-600 tracking-tight">Final campaign approvals</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </Link>

                <Link
                  to="/admin/logs"
                  className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                      <BarChart3 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 tracking-tight">Activity Logs</div>
                      <div className="text-sm text-slate-600 tracking-tight">View platform activity</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </Link>
              </div>
            </div>

            {/* Platform Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Platform Overview</h2>
                <Globe className="w-5 h-5 text-slate-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <div className="text-sm text-slate-600 tracking-tight mb-1">Total Campaigns</div>
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">{stats.totalCampaigns}</div>
                  </div>
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <div className="text-sm text-slate-600 tracking-tight mb-1">Total Donations</div>
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">{stats.totalDonations}</div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-slate-400" />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <div className="text-sm text-slate-600 tracking-tight mb-1">Total Raised</div>
                    <div className="text-2xl font-bold text-emerald-600 tracking-tight">
                      ${stats.totalRaised.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <DollarSign className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
