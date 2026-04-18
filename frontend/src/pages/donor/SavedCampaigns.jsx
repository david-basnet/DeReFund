import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { campaignAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import { Bookmark, Heart, X, ArrowRight, Image as ImageIcon, Loader2 } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const SavedCampaigns = () => {
  const { user } = useAuth();
  const [savedCampaigns, setSavedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const headerRef = useRef(null);
  const iconRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const gridRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const fetchSavedCampaigns = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await campaignAPI.getAll({ status: 'LIVE' });
        const savedIds = JSON.parse(localStorage.getItem('savedCampaigns') || '[]');
        const allCampaigns = response.data || [];
        const saved = allCampaigns.filter(c => savedIds.includes(c.campaign_id));
        setSavedCampaigns(saved);
      } catch (error) {
        console.error('Error fetching saved campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedCampaigns();
  }, [user]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(iconRef.current,
        {
          opacity: 0,
          scale: 0,
          rotation: 180,
        },
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.8,
          ease: 'back.out(1.7)',
          delay: 0.2,
        }
      );

      if (titleRef.current) {
        const text = titleRef.current.textContent;
        const words = text.split(' ');
        titleRef.current.innerHTML = words.map(word => 
          `<span class="saved-word" style="display: inline-block;">${word}</span>`
        ).join(' ');

        gsap.fromTo('.saved-word',
          {
            opacity: 0,
            y: 50,
            rotationX: -90,
          },
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.1,
            delay: 0.4,
          }
        );
      }

      gsap.fromTo(subtitleRef.current,
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          delay: 0.6,
        }
      );

      gsap.to(headerRef.current, {
        backgroundPosition: '100% 50%',
        duration: 3,
        ease: 'none',
        repeat: -1,
        yoyo: true,
      });
    }, headerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (loading || savedCampaigns.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(cardsRef.current,
        {
          opacity: 0,
          scale: 0.8,
          y: 60,
          rotationY: -15,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          rotationY: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: {
            amount: 0.6,
            from: 'start',
          },
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      cardsRef.current.forEach((card) => {
        if (!card) return;

        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = (y - centerY) / 10;
          const rotateY = (centerX - x) / 10;

          gsap.to(card, {
            rotationX: rotateX,
            rotationY: rotateY,
            transformPerspective: 1000,
            duration: 0.3,
            ease: 'power2.out',
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            rotationX: 0,
            rotationY: 0,
            duration: 0.5,
            ease: 'power2.out',
          });
        });
      });
    }, gridRef);

    return () => ctx.revert();
  }, [savedCampaigns, loading]);

  const removeFromSaved = (campaignId) => {
    const savedIds = JSON.parse(localStorage.getItem('savedCampaigns') || '[]');
    const updated = savedIds.filter(id => id !== campaignId);
    localStorage.setItem('savedCampaigns', JSON.stringify(updated));
    setSavedCampaigns(savedCampaigns.filter(c => c.campaign_id !== campaignId));
  };

  if (!user) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Log In</h2>
            <p className="text-gray-600">You need to be logged in to view saved campaigns.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-full bg-light-gray py-8 px-4 overflow-y-auto">
        <div className="max-w-7xl mx-auto h-full">
          {/* Header */}
          <section 
            ref={headerRef}
            className="relative bg-gradient-to-br from-dark-green via-dark-green/90 to-dark-green py-20 rounded-2xl mb-8 overflow-hidden"
            style={{
              backgroundSize: '200% 200%',
              backgroundPosition: '0% 50%',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-dark-green/90 to-dark-green/80"></div>
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)'
            }}></div>
            <div className="relative text-center z-10">
              <div ref={iconRef} className="flex justify-center mb-4 opacity-0">
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <Bookmark className="h-12 w-12 text-white" />
                </div>
              </div>
              <h1 
                ref={titleRef}
                className="text-6xl font-bold mb-4 text-white tracking-tight leading-tight"
              >
                Saved Campaigns
              </h1>
              <p 
                ref={subtitleRef}
                className="text-xl text-white/90 tracking-tight opacity-0"
              >
                Your favorite campaigns that you want to support
              </p>
            </div>
          </section>

          {/* Grid */}
          {loading ? (
            <div className="text-center py-16 animate-fade-in">
              <Loader2 className="inline-block animate-spin h-16 w-16 text-purple mb-4" />
              <p className="text-dark-gray tracking-tight">Loading saved campaigns...</p>
            </div>
          ) : savedCampaigns.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg animate-fade-in">
              <div className="flex justify-center mb-6">
                <Heart className="h-20 w-20 text-purple/30" />
              </div>
              <p className="text-dark-gray mb-6 text-lg tracking-tight">You haven't saved any campaigns yet.</p>
              <Link
                to="/campaigns"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple to-light-purple text-white px-8 py-4 rounded-xl font-bold hover-lift shadow-lg transition-all duration-300 tracking-tight"
              >
                View Live Campaigns
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          ) : (
            <div ref={gridRef} className="grid md:grid-cols-3 gap-6">
              {savedCampaigns.map((campaign, index) => {
                const progressPercentage = campaign.target_amount > 0
                  ? ((campaign.current_amount || 0) / campaign.target_amount) * 100
                  : 0;

                return (
                  <div 
                    key={campaign.campaign_id}
                    ref={el => cardsRef.current[index] = el}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover-lift card-hover opacity-0"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <Link to={`/campaigns/${campaign.campaign_id}`}>
                      <div className="bg-gray h-48 flex items-center justify-center overflow-hidden relative group">
                        {campaign.images && campaign.images[0] ? (
                          <img 
                            src={campaign.images[0]} 
                            alt={campaign.title} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray to-gray/50 flex items-center justify-center">
                            <ImageIcon className="h-12 w-12 text-dark-gray/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            removeFromSaved(campaign.campaign_id);
                          }}
                          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:text-red-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100 z-10"
                          title="Remove from saved"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </Link>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <Link to={`/campaigns/${campaign.campaign_id}`}>
                          <h3 className="text-xl font-bold mb-2 line-clamp-2 hover:text-purple transition-colors  text-dark-green tracking-tight leading-tight">{campaign.title}</h3>
                        </Link>
                      </div>
                      <p className="text-dark-gray mb-4 text-sm line-clamp-2 tracking-tight leading-relaxed">{campaign.description}</p>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2 tracking-tight">
                          <span className="text-dark-gray">Raised</span>
                          <span className="font-bold text-dark-green">
                            ${(campaign.current_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ${campaign.target_amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple to-light-purple h-3 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-dark-gray  font-semibold tracking-tight">{Math.round(progressPercentage)}% funded</span>
                        <Link
                          to={`/campaigns/${campaign.campaign_id}`}
                          className="inline-flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-purple to-light-purple text-white rounded-xl hover-lift shadow-md transition-all duration-300 text-sm font-bold tracking-tight"
                        >
                          Donate Now
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SavedCampaigns;
