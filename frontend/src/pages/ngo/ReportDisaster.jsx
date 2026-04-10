import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { disasterAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';

const ReportDisaster = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    severity: 'MEDIUM',
    latitude: '',
    longitude: '',
    images: [],
  });

  useEffect(() => {
    window.scrollTo(0, 0);
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
      const disasterData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        severity: formData.severity,
        ...(formData.latitude && formData.longitude && {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        }),
        images: formData.images,
      };

      await disasterAPI.create(disasterData);
      navigate('/disasters');
    } catch (err) {
      setError(err.message || 'Failed to report disaster. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-4 font-playfair tracking-tight">Please Log In</h2>
            <p className="text-gray-800 font-dmsans tracking-tight">You need to be logged in to report a disaster.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pt-32 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8 text-black font-playfair tracking-tight">Report Disaster</h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-black mb-2 font-dmsans tracking-tight">
                Disaster Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple focus:border-transparent text-black"
                placeholder="e.g., Flood in Mumbai"
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
                placeholder="Describe the disaster situation..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2 font-dmsans tracking-tight">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple focus:border-transparent text-black"
                placeholder="e.g., Mumbai, Maharashtra, India"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2 font-dmsans tracking-tight">
                  Latitude (Optional)
                </label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  step="any"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple focus:border-transparent text-black"
                  placeholder="e.g., 19.0760"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2 font-dmsans tracking-tight">
                  Longitude (Optional)
                </label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  step="any"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple focus:border-transparent text-black"
                  placeholder="e.g., 72.8777"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2 font-dmsans tracking-tight">
                Severity *
              </label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple focus:border-transparent text-black"
                required
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2 font-dmsans tracking-tight">
                Image URLs (Optional, one per line)
              </label>
              <textarea
                name="images"
                value={formData.images.join('\n')}
                onChange={(e) => {
                  const images = e.target.value.split('\n').filter(url => url.trim());
                  setFormData(prev => ({ ...prev, images }));
                }}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple focus:border-transparent text-black"
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              />
            </div>

            <div className="bg-purple/10 border-2 border-purple/20 rounded-lg p-4">
              <p className="text-sm text-gray-800 font-dmsans tracking-tight">
                <strong className="text-black">Note:</strong> Your disaster report will be reviewed by administrators before being published. 
                Please provide accurate and detailed information.
              </p>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-purple to-light-purple text-white rounded-xl hover-lift shadow-lg transition-all duration-300 disabled:opacity-50 font-bold font-dmsans tracking-tight"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/disasters')}
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

export default ReportDisaster;
