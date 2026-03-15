import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignAPI, disasterAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import NGOLayout from '../../components/NGOLayout';
import { AlertCircle, FileText, DollarSign, Image as ImageIcon, Globe, Loader2, CheckCircle2, XCircle } from 'lucide-react';

const CreateCampaign = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [disasters, setDisasters] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_amount: '',
    case_id: '',
    images: [],
  });

  useEffect(() => {
    // Fetch approved disasters for dropdown
    const fetchDisasters = async () => {
      try {
        const response = await disasterAPI.getAll({ status: 'APPROVED' });
        const disastersData =
          response.data?.disasters ||
          response.data?.data?.disasters ||
          response.data ||
          response.disasters ||
          [];
        setDisasters(Array.isArray(disastersData) ? disastersData : []);
      } catch (err) {
        console.error('Error fetching disasters:', err);
        setDisasters([]);
      }
    };
    fetchDisasters();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Frontend validation
      if (!formData.title || formData.title.trim().length < 5) {
        setError('Title must be at least 5 characters long');
        setLoading(false);
        return;
      }
      
      if (formData.title.trim().length > 200) {
        setError('Title must be less than 200 characters');
        setLoading(false);
        return;
      }
      
      if (!formData.description || formData.description.trim().length < 20) {
        setError('Description must be at least 20 characters long');
        setLoading(false);
        return;
      }
      
      if (!formData.target_amount || parseFloat(formData.target_amount) <= 0) {
        setError('Target amount must be greater than 0');
        setLoading(false);
        return;
      }
      
      if (!formData.case_id) {
        setError('Please select a disaster case');
        setLoading(false);
        return;
      }

      const campaignData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        target_amount: parseFloat(formData.target_amount),
        case_id: formData.case_id,
        ...(formData.images.length > 0 && { images: formData.images }),
      };

      const response = await campaignAPI.create(campaignData);
      
      console.log('Campaign creation response:', response); // Debug log
      
      // Handle response structure - backend returns { success, message, data: { campaign } }
      if (response && response.success) {
        // Always redirect to My Campaigns page after successful creation
        navigate('/ngo/campaigns');
      } else {
        throw new Error(response?.message || 'Failed to create campaign');
      }
    } catch (err) {
      console.error('Campaign creation error:', err);
      
      // Extract detailed error messages from backend validation
      let errorMessage = 'Failed to create campaign. Please try again.';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.errors && Array.isArray(err.errors)) {
        // Backend validation errors array
        const errorDetails = err.errors.map(e => e.msg || e.message).join(', ');
        errorMessage = `Validation failed: ${errorDetails}`;
      } else if (err.response?.data) {
        // Axios-style error response
        const data = err.response.data;
        if (data.errors && Array.isArray(data.errors)) {
          const errorDetails = data.errors.map(e => e.msg || e.message || e).join(', ');
          errorMessage = `Validation failed: ${errorDetails}`;
        } else if (data.message) {
          errorMessage = data.message;
        }
      }
      
      setError(errorMessage);
      
      // If it's a network/connection error, the campaign might still be created
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to fetch')) {
        setError('Network error occurred. Please refresh the page to check if your campaign was created.');
      }
    } finally {
      setLoading(false);
    }
  };

  const [verificationStatus, setVerificationStatus] = useState(null);
  const [checkingVerification, setCheckingVerification] = useState(true);

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        // Use the new endpoint that allows NGOs to check their own status
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/verification-status`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          console.error('API response not OK:', response.status, response.statusText);
          // If 403, user might not be authenticated, check localStorage
          if (response.status === 403 || response.status === 401) {
            const storedStatus = localStorage.getItem('ngo_verification_status');
            setVerificationStatus(storedStatus ? storedStatus.toUpperCase() : 'ACTION_REQUIRED');
            setCheckingVerification(false);
            return;
          }
          throw new Error(`API call failed with status ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Verification status API response:', data);
        
        if (data.success && data.data) {
          const status = data.data.verification_status;
          console.log('Raw verification_status from backend:', status, 'Type:', typeof status);
          
          // If status is null/empty, it means ACTION_REQUIRED (no documents uploaded)
          // Otherwise use the actual status from backend
          const finalStatus = (!status || status === null || status === undefined || status === '') 
            ? 'ACTION_REQUIRED' 
            : String(status).toUpperCase().trim(); // Ensure uppercase and trim whitespace
          
          console.log('Final verification status:', finalStatus);
          setVerificationStatus(finalStatus);
          // Always update localStorage with the latest status
          localStorage.setItem('ngo_verification_status', finalStatus);
          console.log('Updated localStorage with status:', finalStatus);
        } else {
          // If API response structure is unexpected, check localStorage
          console.log('Unexpected API response structure, checking localStorage');
          const storedStatus = localStorage.getItem('ngo_verification_status');
          if (storedStatus) {
            setVerificationStatus(storedStatus.toUpperCase());
          } else {
            setVerificationStatus('ACTION_REQUIRED');
          }
        }
      } catch (error) {
        console.error('Error fetching verification status:', error);
        // Check localStorage as fallback
        const storedStatus = localStorage.getItem('ngo_verification_status');
        setVerificationStatus(storedStatus ? storedStatus.toUpperCase() : 'ACTION_REQUIRED');
      } finally {
        setCheckingVerification(false);
      }
    };
    
    if (user) {
      // Always fetch from backend to get latest status
      fetchVerificationStatus();
    } else {
      setCheckingVerification(false);
    }
  }, [user]);

  if (!user || user.role !== 'NGO') {
    return (
      <NGOLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-black mb-4 font-playfair tracking-tight">Access Denied</h2>
            <p className="text-gray-800 font-dmsans tracking-tight">Only NGOs can create campaigns.</p>
          </div>
        </div>
      </NGOLayout>
    );
  }

  // Check if status is APPROVED (case-insensitive, handle null/undefined)
  const statusUpper = verificationStatus ? String(verificationStatus).toUpperCase().trim() : '';
  const canCreateCampaign = statusUpper === 'APPROVED';
  
  // Debug log
  console.log('CreateCampaign - verificationStatus:', verificationStatus, 'statusUpper:', statusUpper, 'canCreateCampaign:', canCreateCampaign, 'checkingVerification:', checkingVerification);
  
  // Also check localStorage as fallback
  const storedStatus = localStorage.getItem('ngo_verification_status');
  const storedStatusUpper = storedStatus ? String(storedStatus).toUpperCase().trim() : '';
  const canCreateFromStorage = storedStatusUpper === 'APPROVED';
  console.log('Stored status from localStorage:', storedStatus, 'canCreateFromStorage:', canCreateFromStorage);
  
  // Allow access if either check passes
  const finalCanCreate = canCreateCampaign || canCreateFromStorage;

  // Block access if not verified
  if (!checkingVerification && !finalCanCreate) {
    return (
      <NGOLayout>
        <div className="p-6 lg:p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 p-8">
              <div className="text-center mb-6">
                <AlertCircle className="w-20 h-20 mx-auto mb-4 text-slate-500" />
                <h1 className="text-3xl font-bold text-black mb-3 font-playfair tracking-tight">
                  Verification Required
                </h1>
                <p className="text-gray-700 text-lg font-dmsans tracking-tight mb-6">
                  Please go to Profile Settings and submit your verification documents. Once approved, you will be able to create campaigns.
                </p>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/ngo/profile')}
                  className="bg-purple text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors border-2 border-purple-800 font-bold font-dmsans tracking-tight"
                >
                  Go to Profile Settings
                </button>
                <button
                  onClick={() => navigate('/ngo')}
                  className="bg-slate-100 text-black border-2 border-slate-300 px-6 py-3 rounded-xl hover:bg-slate-200 hover:border-slate-400 transition-colors font-bold font-dmsans tracking-tight"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </NGOLayout>
    );
  }

  if (checkingVerification) {
    return (
      <NGOLayout>
        <div className="p-6 lg:p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Loader2 className="w-12 h-12 text-purple animate-spin mx-auto mb-4" />
              <p className="text-gray-700 font-dmsans tracking-tight">Checking verification status...</p>
            </div>
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
            <h1 className="text-4xl font-bold text-black mb-2 font-playfair tracking-tight">Create New Campaign</h1>
            <p className="text-gray-700 font-dmsans tracking-tight">Fill out the form below to start a new fundraising campaign</p>
          </div>
        
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-xl mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold font-dmsans tracking-tight mb-1">{error}</p>
                  {error.includes('Validation failed:') && (
                    <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                      {error.split('Validation failed:')[1]?.split(',').map((err, idx) => (
                        <li key={idx} className="font-dmsans tracking-tight">{err.trim()}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-purple-100 p-8 space-y-8">
            {/* Campaign Title */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-black font-dmsans tracking-tight">
                <FileText className="w-4 h-4 text-purple" />
                Campaign Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple focus:border-purple bg-white text-black font-dmsans tracking-tight transition-all"
                placeholder="Enter a compelling campaign title..."
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-black font-dmsans tracking-tight">
                <FileText className="w-4 h-4 text-purple" />
                Description *
              </label>
              <textarea
                rows={6}
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple focus:border-purple bg-white text-black font-dmsans tracking-tight transition-all resize-none"
                placeholder="Describe your campaign, its goals, and how the funds will be used..."
                required
              />
              <p className="text-xs text-gray-500 font-dmsans tracking-tight">Be detailed and transparent about your campaign's purpose</p>
            </div>

            {/* Target Amount and Disaster Case in Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-black font-dmsans tracking-tight">
                  <DollarSign className="w-4 h-4 text-purple" />
                  Target Amount (USD) *
                </label>
                <input
                  type="number"
                  name="target_amount"
                  value={formData.target_amount}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple focus:border-purple bg-white text-black font-dmsans tracking-tight transition-all"
                  placeholder="50000"
                  min="1"
                  step="0.01"
                  required
                />
                <p className="text-xs text-gray-500 font-dmsans tracking-tight">Set a realistic fundraising goal</p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-black font-dmsans tracking-tight">
                  <Globe className="w-4 h-4 text-purple" />
                  Disaster Case *
                </label>
                <select
                  name="case_id"
                  value={formData.case_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple focus:border-purple bg-white text-black font-bold font-dmsans tracking-tight transition-all"
                  required
                >
                  <option value="">Select a disaster case</option>
                  {disasters.length === 0 ? (
                    <option value="" disabled>No approved disasters available</option>
                  ) : (
                    disasters.map((disaster) => (
                      <option key={disaster.case_id} value={disaster.case_id}>
                        {disaster.title} - {disaster.location}
                      </option>
                    ))
                  )}
                </select>
                <p className="text-xs text-gray-500 font-dmsans tracking-tight">Link to an approved disaster case</p>
              </div>
            </div>

            {/* Image URLs */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-black font-dmsans tracking-tight">
                <ImageIcon className="w-4 h-4 text-purple" />
                Image URLs (Optional)
              </label>
              <textarea
                name="images"
                value={formData.images.join('\n')}
                onChange={(e) => {
                  const images = e.target.value.split('\n').filter(url => url.trim());
                  setFormData(prev => ({ ...prev, images }));
                }}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple focus:border-purple bg-white text-black font-dmsans tracking-tight transition-all resize-none"
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              />
              <p className="text-xs text-gray-500 font-dmsans tracking-tight">
                Enter image URLs, one per line. Use image hosting services like Imgur or Cloudinary.
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-purple text-white px-8 py-3 rounded-xl hover:bg-purple-700 shadow-lg border-2 border-purple-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold font-dmsans tracking-tight"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Campaign...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Create Campaign
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/ngo')}
                className="flex-1 sm:flex-initial bg-slate-100 text-black border-2 border-slate-300 px-8 py-3 rounded-xl hover:bg-slate-200 hover:border-slate-400 transition-colors font-bold font-dmsans tracking-tight"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </NGOLayout>
  );
};

export default CreateCampaign;

