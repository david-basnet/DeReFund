import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, uploadAPI } from '../../utils/api';
import NGOLayout from '../../components/NGOLayout';
import { Upload, FileText, X, Wallet } from 'lucide-react';
import { useAccount } from 'wagmi';

const NGOProfile = () => {
  const { user, fetchUserProfile } = useAuth();
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    wallet_address: user?.wallet_address || '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('REGISTRATION');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [user]);

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
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await authAPI.updateProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditing(false);
      await fetchUserProfile();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size must be less than 10MB' });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDocumentUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a file' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('document_type', documentType);

      const response = await uploadAPI.uploadNGODocument(formData);
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Document uploaded successfully! Waiting for admin approval.' });
        setSelectedFile(null);
        setDocumentType('REGISTRATION');
        
        // Use status from response if available, otherwise default to PENDING
        const newStatus = response.data?.status || 'PENDING';
        // Immediately set status to PENDING - don't refetch yet as DB might not be updated
        // Store in localStorage to persist across navigation
        localStorage.setItem('ngo_verification_status', newStatus);
        localStorage.setItem('ngo_verification_upload_time', Date.now().toString());
        
        // Dispatch event to notify NGOLayout and NGODashboard to refresh their status
        window.dispatchEvent(new CustomEvent('verificationStatusUpdated', { detail: { status: newStatus } }));
        
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to upload document' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to upload document' });
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      wallet_address: user.wallet_address || '',
    });
    setMessage({ type: '', text: '' });
  };

  if (!user || user.role !== 'NGO') {
    return (
      <NGOLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-4 tracking-tight">Access Denied</h2>
            <p className="text-gray-800 tracking-tight">This page is only available for NGOs.</p>
          </div>
        </div>
      </NGOLayout>
    );
  }

  return (
    <NGOLayout>
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Profile Settings</h1>
            <p className="text-slate-600 tracking-tight">Manage your organization information and verification documents</p>
          </div>


          {/* Profile Form */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Profile Information</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all border-2 border-slate-900 font-bold tracking-tight shadow-md"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {message.text && (
              <div className={`mb-4 p-4 rounded-xl ${
                message.type === 'success' ? 'bg-green-50 text-green-800 border-2 border-green-200' : 'bg-red-50 text-red-800 border-2 border-red-200'
              } tracking-tight font-bold`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 tracking-tight uppercase tracking-widest">
                    Organization Name
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
                  <label className="block text-sm font-bold text-slate-700 mb-2 tracking-tight uppercase tracking-widest">
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
                  <label className="block text-sm font-bold text-slate-700 mb-2 tracking-tight uppercase tracking-widest">
                    Wallet Address
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
                        <p className="text-xs text-slate-500 italic">Connect your wallet in the navigation bar to quickly fill this field.</p>
                      )}
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

          {/* Document Upload */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">Verification Documents</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 tracking-tight uppercase tracking-widest">
                  Document Type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 tracking-tight transition-all"
                >
                  <option value="REGISTRATION">Organization Registration</option>
                  <option value="TAX_ID">Tax ID / VAT Certificate</option>
                  <option value="BANK_STATEMENT">Bank Statement</option>
                  <option value="OTHER">Other Documents</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 tracking-tight uppercase tracking-widest">
                  Select File
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-xl hover:border-primary/50 transition-all bg-slate-50/50">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-slate-400" />
                    <div className="flex text-sm text-slate-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-bold text-primary hover:text-primary-focus focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary px-2">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          onChange={handleFileSelect}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-500">PDF, PNG, JPG up to 10MB</p>
                  </div>
                </div>
                {selectedFile && (
                  <div className="mt-4 p-4 bg-primary-fixed/30 rounded-xl border border-primary/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="text-sm font-bold text-slate-900 tracking-tight">{selectedFile.name}</span>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="p-1 hover:bg-white/50 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {message.text && (
              <div className={`mb-4 p-4 rounded-xl ${
                message.type === 'success' ? 'bg-green-50 text-green-800 border-2 border-green-200' : 'bg-red-50 text-red-800 border-2 border-red-200'
              } tracking-tight font-bold`}>
                {message.text}
              </div>
            )}

            <button
              onClick={handleDocumentUpload}
              disabled={uploading || !selectedFile}
              className="w-full px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-slate-900 font-bold tracking-tight shadow-md flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-sm text-slate-500 tracking-tight">
                <strong className="text-slate-900">Note:</strong> Upload your organization's verification documents. Accepted formats: PDF, DOC, DOCX, JPG, PNG. Maximum file size: 10MB.
                After upload, your documents will be reviewed by an admin. You will be notified once your verification status is updated.
              </p>
            </div>
          </div>
        </div>
      </div>
    </NGOLayout>
  );
};

export default NGOProfile;
