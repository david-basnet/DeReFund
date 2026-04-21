import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { volunteerVerificationAPI } from '../../utils/api';
import Layout from '../../components/Layout';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Loader2, Users } from 'lucide-react';
import { assets } from '../../assets/assets';

const VolunteerVoting = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [submittedVotes, setSubmittedVotes] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await volunteerVerificationAPI.getPendingCampaigns({ limit: 100 });
      setCampaigns(response.data?.campaigns || []);
    } catch (error) {
      console.error('Error fetching volunteer campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (campaignId) => {
    try {
      setSubmittingId(campaignId);
      await volunteerVerificationAPI.verifyCampaign(campaignId);
      setSubmittedVotes((prev) => [...new Set([...prev, campaignId])]);
      toast.success('Vote submitted successfully');
      await fetchCampaigns();
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast.error(error.message || 'Unable to submit vote at this time.');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleUnvote = async (campaignId) => {
    try {
      setSubmittingId(campaignId);
      await volunteerVerificationAPI.unverifyCampaign(campaignId);
      setSubmittedVotes((prev) => prev.filter((id) => id !== campaignId));
      toast.success('Vote removed successfully');
      await fetchCampaigns();
    } catch (error) {
      console.error('Error removing vote:', error);
      toast.error(error.message || 'Unable to remove vote at this time.');
    } finally {
      setSubmittingId(null);
    }
  };

  const hasSubmittedVote = (campaign) =>
    Boolean(campaign.has_verified) || submittedVotes.includes(campaign.campaign_id);

  const formatVoteTime = (value) => {
    if (!value) return 'Recently';
    return new Date(value).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center justify-center rounded-3xl bg-primary-fixed/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                  Volunteer Voting
                </div>
                <h1 className="mt-4 text-4xl font-bold text-black tracking-tight">
                  Help verify campaigns with your vote
                </h1>
                <p className="mt-3 max-w-2xl text-gray-700 text-lg tracking-tight">
                  Review campaign details and cast a volunteer vote. Each campaign needs a specific number of votes to move forward.
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Link
                  to="/"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50"
                >
                  Back to Home
                </Link>
                <Link
                  to="/donor/voting"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-slate-900 text-white px-5 text-sm font-bold shadow-sm transition hover:bg-slate-800"
                >
                  Dashboard Voting
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
                <p className="text-sm font-medium text-slate-700">Loading campaigns available for voting...</p>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="col-span-full rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                <ShieldCheck className="mx-auto mb-4 h-14 w-14 text-primary" />
                <h2 className="text-xl font-semibold text-black tracking-tight">No campaigns available</h2>
                <p className="mt-2 text-sm text-slate-600">
                  There are currently no campaigns awaiting volunteer verification. Please check again later.
                </p>
              </div>
            ) : (
              campaigns.map((campaign) => {
                const verificationCount = campaign.verification_count || 0;
                const threshold = campaign.verification_threshold || 20;
                const progress = Math.min((verificationCount / threshold) * 100, 100);
                const alreadyVoted = hasSubmittedVote(campaign);
                const isVerified = verificationCount >= threshold;
                const busy = submittingId === campaign.campaign_id;
                const voters = campaign.volunteer_voters || [];

                return (
                  <div
                    key={campaign.campaign_id}
                    className="rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg overflow-hidden"
                  >
                    <div className="h-48 overflow-hidden bg-slate-100">
                      <img
                        src={
                          (campaign.image_urls && campaign.image_urls[0]) ||
                          (campaign.disaster_images && campaign.disaster_images[0]) ||
                          assets.hero1
                        }
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-black tracking-tight">
                            {campaign.title}
                          </h3>
                          <p className="mt-2 text-sm text-slate-600 line-clamp-3">
                            {campaign.description}
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                          {isVerified ? 'Verified' : alreadyVoted ? 'Voted' : 'Pending'}
                        </span>
                      </div>

                      <div className="mb-5 rounded-2xl bg-slate-100 p-4">
                        <div className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
                          <span>{verificationCount} of {threshold} votes</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-300">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-primary to-[#001a38] transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                            <Users className="h-4 w-4 text-primary" />
                            <span>Volunteers who voted</span>
                          </div>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                            {voters.length}
                          </span>
                        </div>

                        {voters.length === 0 ? (
                          <p className="text-sm text-slate-500">No volunteer votes yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {voters.slice(0, 5).map((voter) => (
                              <div
                                key={voter.verification_id}
                                className="flex items-start gap-3 rounded-lg bg-slate-50 p-3"
                              >
                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                  {(voter.volunteer_name || 'V').charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-bold text-slate-900">
                                    {voter.volunteer_name || 'Volunteer'}
                                  </p>
                                  <p className="truncate text-xs text-slate-600">
                                    {voter.volunteer_email || 'No email'}
                                  </p>
                                  <p className="mt-1 text-xs font-medium text-slate-500">
                                    Voted {formatVoteTime(voter.verified_at)}
                                  </p>
                                </div>
                              </div>
                            ))}
                            {voters.length > 5 && (
                              <p className="text-xs font-semibold text-slate-500">
                                +{voters.length - 5} more volunteer votes
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-3">
                        <button
                          type="button"
                          onClick={() => alreadyVoted ? handleUnvote(campaign.campaign_id) : handleVote(campaign.campaign_id)}
                          disabled={busy || isVerified}
                          className={`inline-flex h-12 items-center justify-center rounded-lg px-5 text-sm font-bold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-70 ${
                            alreadyVoted || isVerified
                              ? 'border border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-slate-900 text-white hover:bg-slate-800'
                          }`}
                        >
                          {busy
                            ? alreadyVoted
                              ? 'Removing Vote...'
                              : 'Submitting Vote...'
                            : alreadyVoted
                            ? 'Voted - Click to Unvote'
                            : isVerified
                            ? 'Already Verified'
                            : 'Vote to Verify'}
                        </button>
                        <Link
                          to={`/campaigns/${campaign.campaign_id}`}
                          className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-900 transition hover:bg-slate-50"
                        >
                          View Campaign Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VolunteerVoting;
