import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { disasterAPI } from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-hot-toast';
import { AlertTriangle, CheckCircle, XCircle, Search, Filter, MapPin, Calendar, Globe } from 'lucide-react';

// Helper function to get disaster image URL
const getDisasterImageUrl = (disaster, index = 0) => {
  if (!disaster.images || disaster.images.length === 0) {
    return null;
  }
  
  const image = disaster.images[index];
  
  // If it's already a URL (starts with http), return it
  if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://'))) {
    return image;
  }
  
  // If it's an uploaded file, construct the API URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${API_BASE_URL}/api/upload/disaster/image/${disaster.case_id}/${index}`;
};

const AdminDisasters = () => {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDisasters();
  }, [statusFilter]);

  const fetchDisasters = async () => {
    try {
      setLoading(true);
      // Use pagination for better performance
      const params = { status: statusFilter, page: 1, limit: 20 };
      const response = await disasterAPI.getAll(params);
      setDisasters(response.data?.disasters || response.data || []);
    } catch (error) {
      console.error('Error fetching disasters:', error);
      setDisasters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (caseId, status) => {
    try {
      setUpdatingId(caseId);
      await disasterAPI.updateStatus(caseId, status);
      toast.success(`Disaster status updated to ${status}`);
      await fetchDisasters();
    } catch (error) {
      console.error('Error updating disaster status:', error);
      toast.error(error.message || 'Failed to update disaster status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredDisasters = disasters.filter(disaster => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      disaster.title?.toLowerCase().includes(search) ||
      disaster.location?.toLowerCase().includes(search) ||
      disaster.description?.toLowerCase().includes(search)
    );
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      APPROVED: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      PENDING: { bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertTriangle },
    };
    const config = statusMap[status] || { bg: 'bg-slate-100', text: 'text-slate-700', icon: AlertTriangle };
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text} tracking-tight`}>
        <Icon className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  };

  const getSeverityBadge = (severity) => {
    const severityMap = {
      CRITICAL: { bg: 'bg-red-600', text: 'text-white' },
      HIGH: { bg: 'bg-orange-500', text: 'text-white' },
      MEDIUM: { bg: 'bg-amber-500', text: 'text-white' },
      LOW: { bg: 'bg-emerald-500', text: 'text-white' },
    };
    const colors = severityMap[severity] || { bg: 'bg-slate-300', text: 'text-slate-900' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text} tracking-tight`}>
        {severity}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Disaster Management</h1>
          <p className="text-slate-600 tracking-tight">Review and approve disaster case reports</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search disasters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-slate-900 tracking-tight"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-slate-900 tracking-tight appearance-none bg-white"
              >
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Disasters Grid */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
            <p className="text-slate-600 tracking-tight">Loading disasters...</p>
          </div>
        ) : filteredDisasters.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 tracking-tight">No disasters found.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDisasters.map((disaster) => (
              <div
                key={disaster.case_id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300"
              >
                {getDisasterImageUrl(disaster) ? (
                  <div className="h-48 bg-gradient-to-br from-red-500 to-orange-500 overflow-hidden">
                    <img
                      src={getDisasterImageUrl(disaster)}
                      alt={disaster.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.background = 'linear-gradient(to bottom right, #ef4444, #f97316)';
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-red-500 to-orange-500 overflow-hidden flex items-center justify-center">
                    <AlertTriangle className="w-12 h-12 text-white/50" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight flex-1 pr-2">
                      {disaster.title}
                    </h3>
                    {getStatusBadge(disaster.status)}
                  </div>
                  
                  <p className="text-slate-600 mb-4 line-clamp-3 tracking-tight text-sm">
                    {disaster.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-slate-600 tracking-tight text-sm">
                      <MapPin className="w-4 h-4" />
                      {disaster.location || 'Location not specified'}
                    </div>
                    {disaster.latitude && disaster.longitude && (
                      <div className="flex items-center gap-2 text-slate-500 tracking-tight text-xs">
                        <span>📍 {disaster.latitude}, {disaster.longitude}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-600 tracking-tight text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(disaster.created_at).toLocaleDateString()}
                    </div>
                    {disaster.submitted_by_name && (
                      <div className="text-slate-500 tracking-tight text-xs">
                        Reported by: {disaster.submitted_by_name}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 tracking-tight text-sm">Severity:</span>
                      {getSeverityBadge(disaster.severity)}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    {disaster.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(disaster.case_id, 'APPROVED')}
                          disabled={updatingId === disaster.case_id}
                          className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 text-sm font-bold tracking-tight"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {updatingId === disaster.case_id ? 'Updating...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(disaster.case_id, 'REJECTED')}
                          disabled={updatingId === disaster.case_id}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm font-bold tracking-tight"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                    <Link
                      to={`/disasters/${disaster.case_id}`}
                      className="flex items-center justify-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm font-bold tracking-tight"
                    >
                      <Globe className="w-4 h-4" />
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDisasters;
