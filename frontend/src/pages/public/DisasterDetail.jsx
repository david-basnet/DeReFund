import { useEffect, useState, Fragment } from 'react';
import { useParams, Link } from 'react-router-dom';
import { disasterAPI, campaignAPI } from '../../utils/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { ArrowLeft, MapPin, Calendar, AlertTriangle, Users } from 'lucide-react';

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

const DisasterDetail = () => {
  const { disasterId } = useParams();
  const [disaster, setDisaster] = useState(null);
  const [relatedCampaigns, setRelatedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    const fetchDisasterData = async () => {
      try {
        setLoading(true);
        const disasterData = await disasterAPI.getById(disasterId);
        setDisaster(disasterData.data?.disaster || disasterData.data);

        // Fetch related campaigns
        const disaster = disasterData.data?.disaster || disasterData.data;
        if (disaster) {
          try {
            const campaignsData = await campaignAPI.getAll({ case_id: disasterId });
            setRelatedCampaigns(campaignsData.data || []);
          } catch (err) {
            console.error('Error fetching campaigns:', err);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (disasterId) {
      fetchDisasterData();
    }
  }, [disasterId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-light-gray">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-800 font-dmsans tracking-tight">Loading disaster information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !disaster) {
    return (
      <div className="min-h-screen bg-light-gray">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-4 font-playfair tracking-tight">Disaster Not Found</h2>
            <p className="text-gray-800 mb-4 font-dmsans tracking-tight">{error || 'The disaster case you are looking for does not exist.'}</p>
            <Link to="/disasters" className="text-purple hover:text-light-purple font-bold underline-animate font-dmsans tracking-tight">Browse Disasters</Link>
          </div>
        </div>
      </div>
    );
  }

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
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {getDisasterImageUrl(disaster) ? (
          <>
            <img
              src={getDisasterImageUrl(disaster)}
              alt={disaster.title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'block';
              }}
            />
            <div className="absolute inset-0 bg-black/60"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-600 to-red-600"></div>
        )}
        <div className="absolute inset-0 flex items-end">
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
            <Link
              to="/disasters"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 font-dmsans tracking-tight transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Disasters
            </Link>
            <div className="max-w-4xl">
              <div className="mb-4 flex gap-3">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold font-dmsans tracking-tight ${
                  severityColors[disaster.severity] || severityColors.MEDIUM
                }`}>
                  {disaster.severity} Severity
                </span>
                <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold text-white font-dmsans tracking-tight">
                  {disaster.status}
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight font-playfair tracking-tight">
                {disaster.title}
              </h1>
              <div className="flex items-center gap-4 text-white/90 font-dmsans tracking-tight">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span className="text-lg">{disaster.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span className="text-lg">
                    {new Date(disaster.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-3xl font-bold text-black mb-6 font-playfair tracking-tight">Disaster Overview</h2>
              <div className="prose max-w-none">
                <p className="text-gray-800 font-dmsans tracking-tight leading-relaxed mb-6 text-lg">{disaster.description}</p>
                
                {disaster.affected_areas && (
                  <div className="bg-light-gray rounded-2xl p-6 mb-6">
                    <h3 className="text-xl font-bold text-black mb-3 font-playfair tracking-tight">Affected Areas</h3>
                    <p className="text-gray-800 font-dmsans tracking-tight">{disaster.affected_areas}</p>
                  </div>
                )}

                {disaster.estimated_damage && (
                  <div className="bg-light-gray rounded-2xl p-6 mb-6">
                    <h3 className="text-xl font-bold text-black mb-3 font-playfair tracking-tight">Estimated Damage</h3>
                    <p className="text-gray-800 font-dmsans tracking-tight">{disaster.estimated_damage}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="bg-light-gray rounded-2xl p-6 sticky top-4">
                <h3 className="text-xl font-bold text-black mb-4 font-playfair tracking-tight">Disaster Info</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-800 font-dmsans tracking-tight mb-1">Severity</div>
                    <div className="text-lg font-bold text-black font-playfair tracking-tight">{disaster.severity}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-800 font-dmsans tracking-tight mb-1">Status</div>
                    <div className="text-lg font-bold text-black font-playfair tracking-tight">{disaster.status}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-800 font-dmsans tracking-tight mb-1">Location</div>
                    <div className="text-lg font-bold text-black font-playfair tracking-tight">{disaster.location}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-800 font-dmsans tracking-tight mb-1">Reported</div>
                    <div className="text-lg font-bold text-black font-playfair tracking-tight">
                      {new Date(disaster.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Campaigns */}
      {relatedCampaigns.length > 0 && (
        <section className="py-16 bg-light-gray">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="h-6 w-6 text-purple" />
              <h2 className="text-3xl font-bold text-black font-playfair tracking-tight">Related Campaigns</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedCampaigns.map((campaign) => {
                const progressPercentage = campaign.target_amount > 0
                  ? ((campaign.current_amount || 0) / campaign.target_amount) * 100
                  : 0;

                return (
                  <Link
                    key={campaign.campaign_id}
                    to={`/campaigns/${campaign.campaign_id}`}
                    className="bg-white border-2 border-gray rounded-2xl overflow-hidden hover-lift card-hover transition-all duration-300"
                  >
                    <div className="h-48 bg-gray overflow-hidden relative group">
                      {campaign.images && campaign.images[0] ? (
                        <img src={campaign.images[0]} alt={campaign.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray to-gray/50">
                          <p className="text-gray-800 font-dmsans tracking-tight">No Image</p>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-black mb-2 line-clamp-2 font-playfair tracking-tight">{campaign.title}</h3>
                      <p className="text-gray-800 mb-4 text-sm line-clamp-2 font-dmsans tracking-tight">{campaign.description}</p>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2 font-dmsans tracking-tight">
                          <span className="text-gray-800">Raised</span>
                          <span className="font-bold text-black">
                            ${(campaign.current_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="w-full bg-gray rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-purple to-light-purple h-3 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-center text-sm text-gray-800 font-dmsans font-semibold tracking-tight">
                        {Math.round(progressPercentage)}% funded
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
      <Footer />
    </Fragment>
  );
};

export default DisasterDetail;
