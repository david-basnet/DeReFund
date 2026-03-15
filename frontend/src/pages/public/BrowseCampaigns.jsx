import { useEffect, useState, useLayoutEffect, Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { campaignAPI } from '../../utils/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CampaignStatusBadge from '../../components/CampaignStatusBadge';
import { Filter } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const BrowseCampaigns = () => {
  const location = useLocation();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'LIVE', page: 1, limit: 12 });
  
  // Aggressive cleanup on mount/unmount - runs synchronously
  useLayoutEffect(() => {
    // Clean up on mount - remove any leftover pin-spacers from HomePage
    const cleanup = () => {
      try {
        // Kill all existing ScrollTriggers
        const triggers = ScrollTrigger.getAll();
        triggers.forEach(trigger => {
          try {
            if (trigger.vars && trigger.vars.pin) {
              trigger.disable();
            }
            trigger.kill(true);
          } catch (e) {}
        });
        
        // Unwrap all pin-spacers synchronously
        const pinSpacers = Array.from(document.querySelectorAll('.pin-spacer'));
        pinSpacers.forEach(spacer => {
          try {
            const parent = spacer.parentNode;
            if (parent && spacer.firstElementChild) {
              // Unwrap: move children back to parent
              while (spacer.firstChild) {
                parent.insertBefore(spacer.firstChild, spacer);
              }
              parent.removeChild(spacer);
            } else if (parent) {
              parent.removeChild(spacer);
            }
          } catch (e) {
            try {
              if (spacer.parentNode) {
                spacer.parentNode.removeChild(spacer);
              }
            } catch (e2) {}
          }
        });
        
        ScrollTrigger.refresh();
      } catch (e) {
        // Ignore errors
      }
    };
    
    cleanup();
    
    return cleanup;
  }, [location.pathname]);

  useEffect(() => {
    // Reset scroll position when component mounts
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const response = await campaignAPI.getAll(filters);
        setCampaigns(response.data?.campaigns || response.data || []);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setCampaigns([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [filters]);

  useEffect(() => {
    // Clean up any existing ScrollTriggers first
    ScrollTrigger.getAll().forEach(trigger => {
      try {
        trigger.kill();
      } catch (e) {
        // Ignore errors
      }
    });
    
    // Remove any leftover pin-spacers
    const pinSpacers = document.querySelectorAll('.pin-spacer');
    pinSpacers.forEach(spacer => {
      try {
        if (spacer.parentNode) {
          spacer.parentNode.removeChild(spacer);
        }
      } catch (e) {
        // Ignore errors
      }
    });
    
    // GSAP animations for campaign cards
    const cards = document.querySelectorAll('.campaign-card');
    const animations = [];
    
    cards.forEach((card, index) => {
      const anim = gsap.from(card, {
        opacity: 0,
        y: 50,
        scale: 0.9,
        duration: 0.6,
        delay: index * 0.1,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
      animations.push(anim);
    });
    
    return () => {
      // Cleanup on unmount
      animations.forEach(anim => {
        try {
          if (anim.scrollTrigger) {
            anim.scrollTrigger.kill(true);
          }
          anim.kill();
        } catch (e) {
          // Ignore errors
        }
      });
      
      // Kill all ScrollTriggers
      const triggers = ScrollTrigger.getAll();
      triggers.forEach(trigger => {
        try {
          trigger.kill(true);
        } catch (e) {
          // Ignore errors
        }
      });
      
      // Remove pin-spacers synchronously
      try {
        const pinSpacers = Array.from(document.querySelectorAll('.pin-spacer'));
        pinSpacers.forEach(spacer => {
          try {
            const parent = spacer.parentNode;
            if (parent && spacer.firstElementChild) {
              // Unwrap: move children back to parent
              while (spacer.firstChild) {
                parent.insertBefore(spacer.firstChild, spacer);
              }
              parent.removeChild(spacer);
            } else if (parent) {
              parent.removeChild(spacer);
            }
          } catch (e) {
            try {
              if (spacer.parentNode) {
                spacer.parentNode.removeChild(spacer);
              }
            } catch (e2) {}
          }
        });
      } catch (e) {
        // Ignore errors
      }
    };
  }, [campaigns]);

  return (
    <Fragment>
    <div className="min-h-screen bg-light-gray pt-24">
      <Navbar />

      {/* Hero Section - Full Screen */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-r from-purple via-light-purple to-purple text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple/90 to-light-purple/90"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)'
        }}></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 font-playfair tracking-tight leading-tight">Browse Campaigns</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-dmsans tracking-tight">
            Discover verified disaster relief campaigns and see how your support can make a real difference.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b py-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-purple" />
              <span className="font-bold text-dark-green font-dmsans tracking-tight">Filter:</span>
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="px-4 py-2 border-2 border-gray rounded-xl focus:ring-2 focus:ring-purple focus:border-purple transition-all font-dmsans bg-light-gray tracking-tight"
            >
              <option value="">All Status</option>
              <option value="LIVE">Live (Donatable)</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
              <option value="PENDING_ADMIN_APPROVAL">Pending Admin Approval</option>
              <option value="COMPLETED">Completed</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>
      </section>

      {/* Campaigns Grid */}
      <section className="py-16 bg-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple mx-auto mb-4"></div>
              <p className="text-dark-gray font-dmsans tracking-tight">Loading campaigns...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <p className="text-dark-gray font-dmsans tracking-tight">No campaigns found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {campaigns.map((campaign) => {
                const progressPercentage = campaign.target_amount > 0
                  ? ((campaign.current_amount || 0) / campaign.target_amount) * 100
                  : 0;

                return (
                  <Link
                    key={campaign.campaign_id}
                    to={`/campaigns/${campaign.campaign_id}`}
                    className="campaign-card bg-white border-2 border-gray rounded-2xl overflow-hidden hover-lift card-hover transition-all duration-300"
                  >
                    <div className="h-64 bg-gray overflow-hidden relative group">
                      {campaign.images && campaign.images[0] ? (
                        <img src={campaign.images[0]} alt={campaign.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray to-gray/50">
                          <p className="text-dark-gray font-dmsans tracking-tight">No Image</p>
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <CampaignStatusBadge status={campaign.status} size="sm" />
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-dark-green mb-2 line-clamp-2 font-playfair tracking-tight">{campaign.title}</h3>
                      <p className="text-dark-gray mb-4 text-sm line-clamp-3 font-dmsans tracking-tight leading-relaxed">{campaign.description}</p>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2 font-dmsans tracking-tight">
                          <span className="text-dark-gray">Raised</span>
                          <span className="font-bold text-dark-green">
                            ${(campaign.current_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="w-full bg-gray rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-purple to-light-purple h-3 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-dark-gray mt-1 font-dmsans tracking-tight">
                          <span>Goal: ${campaign.target_amount.toLocaleString()}</span>
                          <span className="font-semibold">{Math.round(progressPercentage)}%</span>
                        </div>
                      </div>
                      {campaign.disaster_case && (
                        <p className="text-xs text-dark-gray font-dmsans tracking-tight">
                          Related to: {campaign.disaster_case.title}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
      <Footer />
    </Fragment>
  );
};

export default BrowseCampaigns;
