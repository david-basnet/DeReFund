import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, uploadAPI } from '../../utils/api';
import NGOLayout from '../../components/NGOLayout';
import { Upload, FileText, X } from 'lucide-react';

const NGOProfile = () => {
  const { user, fetchUserProfile } = useAuth();
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
            <h2 className="text-2xl font-bold text-black mb-4 font-playfair tracking-tight">Access Denied</h2>
            <p className="text-gray-800 font-dmsans tracking-tight">This page is only available for NGOs.</p>
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
            <h1 className="text-4xl font-bold text-slate-900 mb-2 font-playfair tracking-tight">Profile Settings</h1>
            <p className="text-slate-600 font-dmsans tracking-tight">Manage your organization information and verification documents</p>
          </div>


          {/* Profile Form */}
          <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 font-playfair tracking-tight">Profile Information</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-6 py-2 bg-purple text-white rounded-lg hover:bg-purple-700 transition-colors border-2 border-purple-800 font-bold font-dmsans tracking-tight"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {message.text && (
              <div className={`mb-4 p-4 rounded-lg ${
                message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
              } font-dmsans tracking-tight`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 font-dmsans tracking-tight">
                    Organization Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple focus:border-transparent text-slate-900 font-dmsans tracking-tight"
                      required
                    />
                  ) : (
                    <p className="text-slate-900 font-dmsans tracking-tight">{formData.name || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 font-dmsans tracking-tight">
                    Email Address
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple focus:border-transparent text-slate-900 font-dmsans tracking-tight"
                      required
                    />
                  ) : (
                    <p className="text-slate-900 font-dmsans tracking-tight">{formData.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 font-dmsans tracking-tight">
                    Wallet Address
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.wallet_address}
                      onChange={(e) => handleInputChange('wallet_address', e.target.value)}
                      placeholder="0x..."
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple focus:border-transparent text-slate-900 font-mono text-sm font-dmsans tracking-tight"
                    />
                  ) : (
                    <p className="text-slate-900 font-mono text-sm font-dmsans tracking-tight">
                      {formData.wallet_address || 'Not connected'}
                    </p>
                  )}
                </div>

                {editing && (
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-purple text-white rounded-lg hover:bg-purple-700 transition-colors border-2 border-purple-800 disabled:opacity-50 font-bold font-dmsans tracking-tight"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2 bg-slate-100 text-black border-2 border-slate-300 rounded-lg hover:bg-slate-200 hover:border-slate-400 transition-colors font-bold font-dmsans tracking-tight"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Document Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 font-playfair tracking-tight">Verification Documents</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 font-dmsans tracking-tight">
                  Document Type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-purple focus:border-purple bg-white text-black font-bold font-dmsans tracking-tight"
                >
                  <option value="REGISTRATION">Registration Certificate</option>
                  <option value="LICENSE">License</option>
                  <option value="CERTIFICATE">Certificate</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 font-dmsans tracking-tight">
                  Upload Document (PDF, DOC, DOCX, or Image - Max 10MB)
                </label>
                {selectedFile ? (
                  <div className="flex items-center gap-3 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                    <FileText className="w-5 h-5 text-purple flex-shrink-0" />
                    <span className="flex-1 text-sm text-black font-medium font-dmsans tracking-tight truncate">
                      {selectedFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex-shrink-0"
                      title="Remove file"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple hover:file:bg-purple-100 font-dmsans tracking-tight"
                  />
                )}
              </div>

              <button
                onClick={handleDocumentUpload}
                disabled={!selectedFile || uploading}
                className="w-full px-6 py-3 bg-purple text-white rounded-lg hover:bg-purple-700 transition-colors border-2 border-purple-800 disabled:opacity-50 disabled:cursor-not-allowed font-bold font-dmsans tracking-tight flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload Document
                  </>
                )}
              </button>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <p className="text-sm text-slate-600 font-dmsans tracking-tight">
                <strong>Note:</strong> Upload your organization's verification documents. Accepted formats: PDF, DOC, DOCX, JPG, PNG. Maximum file size: 10MB.
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
