import { useEffect, useState } from 'react';
import { adminAPI } from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import { Users, ShieldCheck, ShieldX, Search, Filter, Mail, Calendar, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [verifyingUserId, setVerifyingUserId] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchUsers();
  }, [page, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (roleFilter) params.role = roleFilter;
      
      const response = await adminAPI.getAllUsers(params);
      // Ensure we always have arrays
      const usersArray = Array.isArray(response.data?.users) 
        ? response.data.users 
        : Array.isArray(response.data) 
          ? response.data 
          : [];
      setUsers(usersArray);
      setTotal(response.data?.total || usersArray.length);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId, status) => {
    try {
      setVerifyingUserId(userId);
      await adminAPI.verifyUser(userId, { status });
      await fetchUsers();
    } catch (error) {
      console.error('Error verifying user:', error);
      alert(error.message || 'Failed to verify user');
    } finally {
      setVerifyingUserId(null);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingUserId(userId);
      await adminAPI.deleteUser(userId);
      await fetchUsers();
      alert('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.message || 'Failed to delete user');
    } finally {
      setDeletingUserId(null);
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.user_id?.toLowerCase().includes(search)
    );
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      APPROVED: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle2 },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      PENDING: { bg: 'bg-amber-100', text: 'text-amber-700', icon: ShieldCheck },
    };
    const config = statusMap[status] || { bg: 'bg-slate-100', text: 'text-slate-700', icon: ShieldCheck };
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text} font-dmsans tracking-tight`}>
        <Icon className="w-3.5 h-3.5" />
        {status || 'N/A'}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      ADMIN: { bg: 'bg-slate-700', text: 'text-white' },
      NGO: { bg: 'bg-blue-600', text: 'text-white' },
      DONOR: { bg: 'bg-emerald-600', text: 'text-white' },
    };
    const colors = roleMap[role] || { bg: 'bg-slate-300', text: 'text-slate-900' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text} font-dmsans tracking-tight`}>
        {role}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 font-playfair tracking-tight">User Management</h1>
          <p className="text-slate-600 font-dmsans tracking-tight">View and manage all platform users</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-slate-900 font-dmsans tracking-tight"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="pl-10 pr-8 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-slate-900 font-dmsans tracking-tight appearance-none bg-white"
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="NGO">NGO</option>
                <option value="DONOR">Donor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-dmsans tracking-tight">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-dmsans tracking-tight">No users found.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 font-dmsans tracking-tight">User</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 font-dmsans tracking-tight">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 font-dmsans tracking-tight">Verification</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 font-dmsans tracking-tight">Created</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 font-dmsans tracking-tight">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.user_id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-bold text-slate-900 font-dmsans tracking-tight">{user.name || 'N/A'}</div>
                            <div className="text-sm text-slate-600 font-dmsans tracking-tight flex items-center gap-1 mt-1">
                              <Mail className="w-3.5 h-3.5" />
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-6 py-4">
                          {user.role === 'NGO' ? getStatusBadge(user.verification_status || 'PENDING') : (
                            <span className="text-sm text-slate-500 font-dmsans tracking-tight">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-slate-600 font-dmsans tracking-tight">
                            <Calendar className="w-4 h-4" />
                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {/* NGO Verification Buttons */}
                            {user.role === 'NGO' && user.verification_status !== 'APPROVED' && (
                              <>
                                <button
                                  onClick={() => handleVerify(user.user_id, 'APPROVED')}
                                  disabled={verifyingUserId === user.user_id || deletingUserId === user.user_id}
                                  className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 text-sm font-bold font-dmsans tracking-tight"
                                >
                                  <ShieldCheck className="w-4 h-4" />
                                  {verifyingUserId === user.user_id ? 'Verifying...' : 'Approve'}
                                </button>
                                <button
                                  onClick={() => handleVerify(user.user_id, 'REJECTED')}
                                  disabled={verifyingUserId === user.user_id || deletingUserId === user.user_id}
                                  className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm font-bold font-dmsans tracking-tight"
                                >
                                  <ShieldX className="w-4 h-4" />
                                  Reject
                                </button>
                              </>
                            )}
                            
                            {/* Delete User Button - Show for all users except current admin */}
                            {user.user_id !== currentUser?.user_id && user.user_id !== currentUser?.id && (
                              <button
                                onClick={() => handleDelete(user.user_id, user.name || user.email)}
                                disabled={deletingUserId === user.user_id || verifyingUserId === user.user_id}
                                className="flex items-center gap-1.5 bg-slate-600 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 text-sm font-bold font-dmsans tracking-tight"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                                {deletingUserId === user.user_id ? 'Deleting...' : 'Delete'}
                              </button>
                            )}
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
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors font-bold font-dmsans tracking-tight"
                >
                  Previous
                </button>
                <span className="text-slate-600 font-dmsans tracking-tight">
                  Page {page} of {Math.ceil(total / limit)}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(Math.ceil(total / limit), p + 1))}
                  disabled={page >= Math.ceil(total / limit)}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors font-bold font-dmsans tracking-tight"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
