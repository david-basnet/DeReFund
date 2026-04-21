import { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { useAccount } from 'wagmi';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';

const AdminProfile = () => {
  const { user, fetchUserProfile } = useAuth();
  const { address, isConnected } = useAccount();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    wallet_address: user?.wallet_address || '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        wallet_address: user.wallet_address || '',
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await authAPI.updateProfile(formData);
      await fetchUserProfile();
      setEditing(false);
      setMessage({ type: 'success', text: 'Admin profile updated successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update admin profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      wallet_address: user?.wallet_address || '',
    });
    setMessage({ type: '', text: '' });
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Admin Profile</h1>
            <p className="text-slate-600 tracking-tight">
              Store the admin wallet used for escrow ownership and milestone release approvals.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Profile Information</h2>
              {!editing && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all border-2 border-slate-900 font-bold tracking-tight shadow-md"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {message.text && (
              <div className={`mb-4 p-4 rounded-xl font-bold tracking-tight ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border-2 border-green-200'
                  : 'bg-red-50 text-red-800 border-2 border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest">
                    Admin Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 tracking-tight transition-all"
                      required
                    />
                  ) : (
                    <p className="text-slate-900 font-bold tracking-tight text-lg">{formData.name || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest">
                    Email Address
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 tracking-tight transition-all"
                      required
                    />
                  ) : (
                    <p className="text-slate-900 font-bold tracking-tight text-lg">{formData.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest">
                    Admin Wallet Address
                  </label>
                  {editing ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.wallet_address}
                          onChange={(e) => handleInputChange('wallet_address', e.target.value)}
                          placeholder="0x..."
                          className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 font-mono text-sm tracking-tight transition-all"
                        />
                        {isConnected && address && address.toLowerCase() !== formData.wallet_address?.toLowerCase() && (
                          <button
                            type="button"
                            onClick={() => handleInputChange('wallet_address', address)}
                            className="px-4 py-2 bg-primary/10 text-primary rounded-xl border-2 border-primary/20 hover:bg-primary/20 transition-all flex items-center gap-2 text-sm font-bold"
                            title="Use connected wallet address"
                          >
                            <Wallet className="w-4 h-4" />
                            Use Connected
                          </button>
                        )}
                      </div>
                      {!isConnected && (
                        <p className="text-xs text-slate-500 italic">
                          Connect the admin wallet in the navigation bar to quickly fill this field.
                        </p>
                      )}
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        Use the same wallet as your backend escrow private key. If a different wallet owns the escrow,
                        backend release transactions can fail.
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-900 font-mono text-sm tracking-tight bg-slate-50 p-2 rounded-lg border border-slate-200 inline-block">
                      {formData.wallet_address || 'Not connected'}
                    </p>
                  )}
                </div>

                {editing && (
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all disabled:opacity-50 border-2 border-slate-900 font-bold tracking-tight shadow-md"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-8 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-lg hover:bg-slate-50 transition-all font-bold tracking-tight"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
