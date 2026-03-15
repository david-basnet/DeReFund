import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { campaignAPI, disasterAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';

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
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [campaignResponse, disastersResponse] = await Promise.all([
          campaignAPI.getById(campaignId),
          disasterAPI.getAll({ status: 'APPROVED' }),
        ]);

        const campaign = campaignResponse.data;
        setFormData({
          title: campaign.title || '',
          description: campaign.description || '',
          target_amount: campaign.target_amount || '',
          case_id: campaign.case_id || '',
        });
        setDisasters(disastersResponse.data || []);
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
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-4 font-playfair tracking-tight">Access Denied</h2>
            <p className="text-gray-800 font-dmsans tracking-tight">Only NGOs can edit campaigns.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-800 font-dmsans tracking-tight">Loading campaign...</p>
          </div>
        </div>
      </Layout>
    );
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pt-32 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8 text-black font-playfair tracking-tight">Edit Campaign</h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-black mb-2 font-dmsans tracking-tight">
                Campaign Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple focus:border-transparent text-black"
                placeholder="Enter campaign title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2 font-dmsans tracking-tight">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple focus:border-transparent text-black"
                placeholder="Describe your campaign"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2 font-dmsans tracking-tight">
                Target Amount ($) *
              </label>
              <input
                type="number"
                name="target_amount"
                value={formData.target_amount}
                onChange={handleChange}
                min="1"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple focus:border-transparent text-black"
                placeholder="Enter target amount"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2 font-dmsans tracking-tight">
                Link to Disaster Case (Optional)
              </label>
              <select
                name="case_id"
                value={formData.case_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple focus:border-transparent text-black"
              >
                <option value="">Select a disaster case</option>
                {disasters.map((disaster) => (
                  <option key={disaster.case_id} value={disaster.case_id}>
                    {disaster.title} - {disaster.location}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-purple to-light-purple text-white rounded-xl hover-lift shadow-lg transition-all duration-300 disabled:opacity-50 font-bold font-dmsans tracking-tight"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/ngo/campaigns/${campaignId}`)}
                className="px-6 py-3 bg-gray text-black rounded-xl hover:bg-gray/80 transition-colors font-bold font-dmsans tracking-tight"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditCampaign;
