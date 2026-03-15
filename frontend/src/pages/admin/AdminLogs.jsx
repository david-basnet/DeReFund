import { useEffect, useState } from 'react';
import { adminAPI } from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import { Activity, Calendar, User, Search, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAdminLogs({ page, limit });
      // Ensure we always have arrays
      const logsArray = Array.isArray(response.data?.logs) 
        ? response.data.logs 
        : Array.isArray(response.data) 
          ? response.data 
          : [];
      setLogs(logsArray);
      setTotal(response.data?.total || logsArray.length);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      log.action?.toLowerCase().includes(search) ||
      log.admin_name?.toLowerCase().includes(search) ||
      log.details?.toLowerCase().includes(search)
    );
  });

  const getActionBadge = (action) => {
    const actionMap = {
      USER_VERIFICATION: { bg: 'bg-blue-100', text: 'text-blue-700' },
      DISASTER_APPROVAL: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
      DISASTER_REJECTION: { bg: 'bg-red-100', text: 'text-red-700' },
      CAMPAIGN_APPROVAL: { bg: 'bg-violet-100', text: 'text-violet-700' },
      MILESTONE_APPROVAL: { bg: 'bg-purple-100', text: 'text-purple-700' },
    };
    const colors = actionMap[action] || { bg: 'bg-slate-100', text: 'text-slate-700' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text} font-dmsans tracking-tight`}>
        {action?.replace(/_/g, ' ') || 'UNKNOWN'}
      </span>
    );
  };

  const formatDetails = (details) => {
    try {
      const parsed = typeof details === 'string' ? JSON.parse(details) : details;
      return JSON.stringify(parsed, null, 2);
    } catch {
      return details || 'N/A';
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 font-playfair tracking-tight">Activity Logs</h1>
          <p className="text-slate-600 font-dmsans tracking-tight">Monitor all admin actions and platform activity</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-slate-900 font-dmsans tracking-tight"
            />
          </div>
        </div>

        {/* Logs Table */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-dmsans tracking-tight">Loading logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-dmsans tracking-tight">No logs found.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 font-dmsans tracking-tight">Action</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 font-dmsans tracking-tight">Admin</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 font-dmsans tracking-tight">Details</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 font-dmsans tracking-tight">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredLogs.map((log) => (
                      <tr key={log.log_id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          {getActionBadge(log.action)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-slate-600" />
                            </div>
                            <span className="font-semibold text-slate-900 font-dmsans tracking-tight">
                              {log.admin_name || 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <details className="cursor-pointer">
                            <summary className="text-slate-600 font-dmsans tracking-tight text-sm hover:text-slate-900 flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              View Details
                            </summary>
                            <pre className="mt-2 p-3 bg-slate-50 rounded-lg text-xs font-mono text-slate-700 overflow-x-auto font-dmsans tracking-tight border border-slate-200">
                              {formatDetails(log.details)}
                            </pre>
                          </details>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-600 font-dmsans tracking-tight text-sm">
                            <Calendar className="w-4 h-4" />
                            {new Date(log.created_at).toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {total > limit && (
              <div className="mt-6 flex justify-center items-center gap-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors font-bold font-dmsans tracking-tight flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="text-slate-600 font-dmsans tracking-tight">
                  Page {page} of {Math.ceil(total / limit)}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(Math.ceil(total / limit), p + 1))}
                  disabled={page >= Math.ceil(total / limit)}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors font-bold font-dmsans tracking-tight flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminLogs;
