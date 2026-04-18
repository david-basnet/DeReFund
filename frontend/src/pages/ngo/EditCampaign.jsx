import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { campaignAPI, disasterAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import NGOLayout from '../../components/NGOLayout';
import { AlertCircle, FileText, DollarSign, Globe, Loader2, CheckCircle2 } from 'lucide-react';

const EditCampaign = () => {
  const { campaignId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [disasters, setDisasters] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_amount: '',
    case_id: '',
    verification_threshold: 20,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [campaignResponse, disastersResponse] = await Promise.all([
          campaignAPI.getById(campaignId),
          disasterAPI.getAll({ status: 'APPROVED' }),
        ]);

        const campaign = campaignResponse.data;
        if (!campaign) throw new Error('Campaign not found');

        setFormData({
          title: campaign.title || '',
          description: campaign.description || '',
          target_amount: campaign.target_amount || '',
          case_id: campaign.case_id || '',
          verification_threshold: campaign.verification_threshold || 20,
        });
        
        const disastersData = disastersResponse.data?.disasters || disastersResponse.data || [];
        setDisasters(Array.isArray(disastersData) ? disastersData : []);
      } catch (err) {
        setError(err.message || 'Failed to load campaign');
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      fetchData();
    }
  }, [campaignId]);

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
    setSaving(true);

    try {
      const campaignData = {
        title: formData.title,
        description: formData.description,
        target_amount: parseFloat(formData.target_amount),
        verification_threshold: parseInt(formData.verification_threshold),
        ...(formData.case_id && { case_id: formData.case_id }),
      };

      await campaignAPI.update(campaignId, campaignData);
      navigate(`/ngo/campaigns/${campaignId}`);
    } catch (err) {
      setError(err.message || 'Failed to update campaign. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== 'NGO') {
    return (
      <NGOLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-4 tracking-tight">Access Denied</h2>
            <p className="text-gray-800 tracking-tight">Only NGOs can edit campaigns.</p>
          </div>
        </div>
      </NGOLayout>
    );
  }

  if (loading) {
    return (
      <NGOLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
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
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Edit Campaign</h1>
            <p className="text-slate-600 tracking-tight">Update your campaign information and verification settings</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-6 lg:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3 text-red-800 font-bold tracking-tight">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-widest">
                    <FileText className="w-4 h-4 text-primary" />
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50 text-black font-bold tracking-tight transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-widest">
                    <AlertCircle className="w-4 h-4 text-primary" />
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="6"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50 text-black font-bold tracking-tight transition-all"
                    required
                  ></textarea>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-widest">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Target Amount (USD) *
                  </label>
                  <input
                    type="number"
                    name="target_amount"
                    value={formData.target_amount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50 text-black font-bold tracking-tight transition-all"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-widest">
                    <Globe className="w-4 h-4 text-primary" />
                    Linked Disaster Case
                  </label>
                  <select
                    name="case_id"
                    value={formData.case_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50 text-black font-bold tracking-tight transition-all"
                  >
                    <option value="">Select a disaster case</option>
                    {disasters.map((disaster) => (
                      <option key={disaster.case_id} value={disaster.case_id}>
                        {disaster.title} - {disaster.location}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-widest">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Verification Threshold *
                  </label>
                  <input
                    type="number"
                    name="verification_threshold"
                    value={formData.verification_threshold}
                    onChange={handleChange}
                    min="5"
                    max="50"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50 text-black font-bold tracking-tight transition-all"
                    required
                  />
                  <p className="text-xs text-slate-500 font-medium">Votes required for verification (min 5, max 50)</p>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t-2 border-slate-50">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-4 bg-gradient-to-r from-primary to-[#001a38] text-white rounded-xl hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-black text-lg tracking-tighter"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/ngo/campaigns/${campaignId}`)}
                  className="px-8 py-4 bg-white text-slate-900 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold tracking-tight"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </NGOLayout>
  );
};

export default EditCampaign;
