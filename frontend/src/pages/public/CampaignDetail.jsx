import { useEffect, useState, Fragment } from 'react';
import { useParams, Link } from 'react-router-dom';
import { campaignAPI, donationAPI, milestoneAPI, volunteerVerificationAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CampaignStatusBadge from '../../components/CampaignStatusBadge';
import { ArrowLeft, DollarSign, Users, Target, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CampaignDetail = () => {
  const { campaignId } = useParams();
  const { user, openRegisterModal } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    const fetchCampaignData = async () => {
      try {
        setLoading(true);
        // Validate campaignId before making API calls
        if (!campaignId || campaignId === 'undefined') {
          throw new Error('Invalid campaign ID');
        }

        const [campaignData, donationsData, milestonesData] = await Promise.all([
          campaignAPI.getById(campaignId),
          donationAPI.getByCampaign(campaignId).catch(() => ({ data: [] })),
          milestoneAPI.getByCampaign(campaignId).catch(() => ({ data: [] })),
        ]);

        // Handle different response structures
        const campaign = campaignData.data?.campaign || campaignData.data || campaignData;
        if (!campaign) {
          throw new Error('Campaign not found');
        }
        setCampaign(campaign);
        
        // Handle donations data structure
        const donations = Array.isArray(donationsData.data?.donations) 
          ? donationsData.data.donations 
          : Array.isArray(donationsData.data) 
            ? donationsData.data 
            : [];
        setDonations(donations);
        
        // Handle milestones data structure
        const milestones = Array.isArray(milestonesData.data?.milestones) 
          ? milestonesData.data.milestones 
          : Array.isArray(milestonesData.data) 
            ? milestonesData.data 
            : [];
        setMilestones(milestones);

        // Fetch verification status
        try {
          const verificationData = await volunteerVerificationAPI.getCampaignVerificationStatus(campaignId);
          setVerificationStatus(verificationData.data);
        } catch (err) {
          console.error('Error fetching verification status:', err);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      fetchCampaignData();
    }
  }, [campaignId]);

  useEffect(() => {
    // GSAP animations
    gsap.from('.campaign-hero', {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: 'power3.out',
    });

    gsap.from('.campaign-section', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.2,
      scrollTrigger: {
        trigger: '.campaign-section',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  }, [campaign]);

  const handleVerify = async () => {
    try {
      setVerifying(true);
      await volunteerVerificationAPI.verifyCampaign(campaignId);
      // Refresh verification status
      const verificationData = await volunteerVerificationAPI.getCampaignVerificationStatus(campaignId);
      setVerificationStatus(verificationData.data);
    } catch (err) {
      alert(err.message || 'Failed to verify campaign');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-gray">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple mx-auto mb-4"></div>
            <p className="text-dark-gray font-dmsans tracking-tight">Loading campaign details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-light-gray">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-dark-green mb-4 font-playfair tracking-tight">Campaign Not Found</h2>
            <p className="text-dark-gray mb-4 font-dmsans tracking-tight">{error || 'The campaign you are looking for does not exist.'}</p>
            <Link to="/campaigns" className="text-purple hover:text-light-purple font-bold underline-animate font-dmsans tracking-tight">Browse Campaigns</Link>
          </div>
        </div>
      </div>
    );
  }

  const raisedAmount = donations.reduce((sum, donation) => sum + parseFloat(donation.amount || 0), 0);
  const progressPercentage = campaign.target_amount > 0 ? (raisedAmount / campaign.target_amount) * 100 : 0;

  return (
    <Fragment>
      <div className="min-h-screen bg-light-gray pt-24">
        <Navbar />
      
      {/* Hero Section - Full Screen */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {campaign.images && campaign.images[0] ? (
          <>
            <img
              src={campaign.images[0]}
              alt={campaign.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-purple via-light-purple to-purple"></div>
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <Link
            to="/campaigns"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 font-dmsans tracking-tight transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Campaigns
          </Link>
          <div className="max-w-4xl campaign-hero">
            <div className="mb-4">
              <CampaignStatusBadge status={campaign.status} size="md" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white font-playfair tracking-tight">{campaign.title}</h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 font-dmsans tracking-tight leading-relaxed">{campaign.description}</p>
            
            {/* Verification Status */}
            {verificationStatus && (campaign.status === 'PENDING_VERIFICATION' || campaign.status === 'PENDING_ADMIN_APPROVAL') && (
              <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-white">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="font-bold font-dmsans tracking-tight">
                      {verificationStatus.verificationCount || 0} / 20 Volunteers Verified
                    </span>
                  </div>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 mb-3">
                  <div
                    className="bg-gradient-to-r from-blue to-light-blue h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(((verificationStatus.verificationCount || 0) / 20) * 100, 100)}%` }}
                  ></div>
                </div>
                {user?.role === 'DONOR' && verificationStatus.canVerify && (
                  <button
                    onClick={handleVerify}
                    disabled={verifying}
                    className="w-full bg-blue text-white px-4 py-2 rounded-lg hover:bg-light-blue transition-colors disabled:opacity-50 font-bold font-dmsans tracking-tight"
                  >
                    {verifying ? 'Verifying...' : 'Verify This Campaign'}
                  </button>
                )}
                {verificationStatus.hasVerified && (
                  <p className="text-white/90 text-sm font-dmsans tracking-tight text-center">
                    ✓ You have verified this campaign
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Progress Section */}
      <section className="bg-white py-12 border-b campaign-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-4xl font-bold text-dark-green font-playfair tracking-tight">
                ${raisedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-dark-gray font-dmsans tracking-tight">of ${campaign.target_amount.toLocaleString()} goal</span>
            </div>
            <div className="w-full bg-gray rounded-full h-4 mb-4">
              <div
                className="bg-gradient-to-r from-purple to-light-purple h-4 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-dark-gray font-dmsans tracking-tight">
              <span>{Math.round(progressPercentage)}% funded</span>
              <span>{donations.length} donations</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-light-gray campaign-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center card-hover">
              <DollarSign className="h-8 w-8 text-purple mx-auto mb-3" />
              <div className="text-3xl font-bold text-dark-green mb-2 font-playfair tracking-tight">
                ${raisedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-dark-gray font-dmsans tracking-tight">Total Raised</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center card-hover">
              <Users className="h-8 w-8 text-purple mx-auto mb-3" />
              <div className="text-3xl font-bold text-dark-green mb-2 font-playfair tracking-tight">{donations.length}</div>
              <div className="text-dark-gray font-dmsans tracking-tight">Donors</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center card-hover">
              <Target className="h-8 w-8 text-purple mx-auto mb-3" />
              <div className="text-3xl font-bold text-dark-green mb-2 font-playfair tracking-tight">{milestones.length}</div>
              <div className="text-dark-gray font-dmsans tracking-tight">Milestones</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white campaign-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-3xl font-bold text-dark-green mb-6 font-playfair tracking-tight">Campaign Details</h2>
              <div className="prose max-w-none">
                <p className="text-dark-gray font-dmsans tracking-tight leading-relaxed mb-4">{campaign.description}</p>
                {campaign.ngo && (
                  <div className="bg-light-gray rounded-2xl p-6 mb-6">
                    <h3 className="text-xl font-bold text-dark-green mb-2 font-playfair tracking-tight">Organized By</h3>
                    <p className="text-dark-gray font-dmsans tracking-tight">{campaign.ngo.organization_name || campaign.ngo.name}</p>
                  </div>
                )}
              </div>

              {/* Milestones */}
              {milestones.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-3xl font-bold text-dark-green mb-6 font-playfair tracking-tight">Milestones</h2>
                  <div className="space-y-4">
                    {milestones.map((milestone, index) => (
                      <div key={milestone.milestone_id} className="bg-light-gray rounded-2xl p-6 card-hover">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple to-light-purple rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold font-dmsans">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-dark-green mb-2 font-playfair tracking-tight">{milestone.title}</h3>
                            <p className="text-dark-gray font-dmsans tracking-tight leading-relaxed">{milestone.description}</p>
                            <div className="mt-3 flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold font-dmsans tracking-tight ${
                                milestone.status === 'APPROVED' ? 'bg-green-100 text-dark-green' :
                                milestone.status === 'SUBMITTED' ? 'bg-yellow/20 text-yellow' :
                                'bg-gray text-dark-gray'
                              }`}>
                                {milestone.status}
                              </span>
                              {milestone.amount_to_release && (
                                <span className="text-sm text-dark-gray font-dmsans tracking-tight">
                                  ${milestone.amount_to_release.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              <div className="bg-light-gray rounded-2xl p-6 sticky top-24">
                <h3 className="text-xl font-bold text-dark-green mb-4 font-playfair tracking-tight">Quick Stats</h3>
                <div className="space-y-4 mb-6">
                  <div>
                    <div className="text-sm text-dark-gray font-dmsans tracking-tight mb-1">Progress</div>
                    <div className="text-2xl font-bold text-dark-green font-playfair tracking-tight">{Math.round(progressPercentage)}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-dark-gray font-dmsans tracking-tight mb-1">Remaining</div>
                    <div className="text-2xl font-bold text-dark-green font-playfair tracking-tight">
                      ${(campaign.target_amount - raisedAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  {campaign.deadline && (
                    <div>
                      <div className="text-sm text-dark-gray font-dmsans tracking-tight mb-1">Deadline</div>
                      <div className="text-lg font-bold text-dark-green font-playfair tracking-tight">
                        {new Date(campaign.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
                
                {campaign.status !== 'LIVE' && (
                  <div className="bg-yellow/10 border border-yellow/20 rounded-lg p-4 mt-4">
                    <p className="text-sm text-dark-gray font-dmsans tracking-tight">
                      This campaign is not yet accepting donations. It must be verified by volunteers and approved by admin.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Donations */}
      <section className="py-16 bg-light-gray campaign-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-dark-green font-playfair tracking-tight">
              {donations.length > 0 ? 'Recent Donations' : 'Donations'}
            </h2>
            {donations.length > 0 && (
              <div className="text-dark-gray font-dmsans tracking-tight">
                Total: <span className="font-bold text-dark-green">{donations.length}</span> donations
              </div>
            )}
          </div>
          {donations.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple to-light-purple">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white font-dmsans tracking-tight">Donor</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white font-dmsans tracking-tight">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white font-dmsans tracking-tight">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white font-dmsans tracking-tight">Transaction</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white font-dmsans tracking-tight">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray">
                    {donations.slice(0, 10).map((donation) => (
                      <tr key={donation.donation_id} className="hover:bg-light-gray transition-colors">
                        <td className="px-6 py-4 font-dmsans text-black tracking-tight">
                          {donation.donor?.name || 'Anonymous'}
                        </td>
                        <td className="px-6 py-4 font-bold text-dark-green font-dmsans text-lg tracking-tight">
                          ${parseFloat(donation.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-dark-gray font-dmsans tracking-tight">
                          {new Date(donation.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {donation.tx_hash ? (
                            <a
                              href={`https://polygonscan.com/tx/${donation.tx_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple hover:text-light-purple underline-animate font-dmsans text-sm tracking-tight"
                            >
                              View on PolygonScan
                            </a>
                          ) : (
                            <span className="text-gray font-dmsans text-sm tracking-tight">Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-dmsans tracking-tight ${
                            donation.tx_hash ? 'bg-green-100 text-dark-green' : 'bg-yellow/20 text-yellow'
                          }`}>
                            {donation.tx_hash && <CheckCircle2 className="h-3 w-3" />}
                            {donation.tx_hash ? 'Confirmed' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Heart className="h-16 w-16 text-gray mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-dark-green mb-2 font-playfair tracking-tight">
                No Donations Yet
              </h3>
              <p className="text-dark-gray mb-6 font-dmsans tracking-tight">
                Be the first to support this campaign!
              </p>
            </div>
          )}
        </div>
      </section>
      </div>
      <Footer />
    </Fragment>
  );
};

export default CampaignDetail;
