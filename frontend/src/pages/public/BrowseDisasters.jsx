import { useEffect, useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { disasterAPI } from '../../utils/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { AlertTriangle, Filter, MapPin } from 'lucide-react';

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
  // Note: This assumes files are stored and accessible via the upload endpoint
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${API_BASE_URL}/api/upload/disaster/image/${disaster.case_id}/${index}`;
};

const BrowseDisasters = () => {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'APPROVED', page: 1, limit: 12 });

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    const fetchDisasters = async () => {
      try {
        setLoading(true);
        const response = await disasterAPI.getAll(filters);
        // Ensure we always get an array
        const disastersArray = Array.isArray(response.data?.disasters) 
          ? response.data.disasters 
          : Array.isArray(response.data) 
            ? response.data 
            : [];
        setDisasters(disastersArray);
      } catch (error) {
        console.error('Error fetching disasters:', error);
        setDisasters([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchDisasters();
  }, [filters]);

  const severityColors = {
    LOW: 'bg-green-100 text-black',
    MEDIUM: 'bg-yellow/20 text-yellow',
    HIGH: 'bg-orange-100 text-orange-600',
    CRITICAL: 'bg-red-100 text-red-600',
  };

  return (
    <Fragment>
    <div className="min-h-screen bg-light-gray pt-24">
      <Navbar />

      {/* Hero Section - Full Screen */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 via-orange-600/90 to-red-600/90"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)'
        }}></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
              <AlertTriangle className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 font-playfair tracking-tight leading-tight">Disaster Cases</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-dmsans tracking-tight">
            View verified disaster cases and see how relief efforts are making a difference.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b py-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-red-600" />
              <span className="font-bold text-black font-dmsans tracking-tight">Filter:</span>
            </div>
            <select
              value={filters.severity || ''}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value || undefined })}
              className="px-4 py-2 border-2 border-gray rounded-xl focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all font-dmsans bg-light-gray tracking-tight"
            >
              <option value="">All Severities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border-2 border-gray rounded-xl focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all font-dmsans bg-light-gray tracking-tight"
            >
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>
      </section>

      {/* Disasters Grid */}
      <section className="py-16 bg-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-800 font-dmsans tracking-tight">Loading disasters...</p>
            </div>
          ) : disasters.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <p className="text-gray-800 font-dmsans tracking-tight">No disasters found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {disasters.map((disaster) => (
                <Link
                  key={disaster.case_id}
                  to={`/disasters/${disaster.case_id}`}
                  className="bg-white border-2 border-gray rounded-2xl overflow-hidden hover-lift card-hover transition-all duration-300"
                >
                  <div className="h-64 bg-gray overflow-hidden relative group">
                    {getDisasterImageUrl(disaster) ? (
                      <img 
                        src={getDisasterImageUrl(disaster)} 
                        alt={disaster.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center ${getDisasterImageUrl(disaster) ? 'hidden' : ''}`}>
                      <AlertTriangle className="h-16 w-16 text-white/50" />
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold font-dmsans tracking-tight ${
                        severityColors[disaster.severity] || severityColors.MEDIUM
                      }`}>
                        {disaster.severity}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-2">
                      <span className="inline-block px-3 py-1 bg-gray text-gray-800 rounded-full text-xs font-bold font-dmsans tracking-tight">
                        {disaster.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-black mb-2 line-clamp-2 font-playfair tracking-tight">{disaster.title}</h3>
                    <p className="text-gray-800 mb-4 text-sm line-clamp-3 font-dmsans tracking-tight leading-relaxed">{disaster.description}</p>
                    <div className="flex items-center text-sm text-gray-800 font-dmsans tracking-tight">
                      <MapPin className="w-4 h-4 mr-2 text-purple" />
                      {disaster.location}
                    </div>
                    <div className="mt-4 text-xs text-gray-800 font-dmsans tracking-tight">
                      Reported: {new Date(disaster.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
      <Footer />
    </Fragment>
  );
};

export default BrowseDisasters;
