import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { publicAPI, milestoneAPI, donationAPI } from '../../utils/api';
import { assets } from '../../assets/assets';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import toast from 'react-hot-toast';
import { derefundEscrowAbi } from '../../contracts/DeReFundEscrow';
import { useAuth } from '../../context/AuthContext';

function formatUsd(n) {
  const x = Number(n) || 0;
  return x.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function shortHash(hash) {
  return hash ? `${hash.slice(0, 10)}...${hash.slice(-8)}` : '';
}

const CampaignDetail = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { user, openRegisterModal } = useAuth();
  const { isConnected } = useAccount();
  const { sendTransaction, data: hash, isPending: isSending } = useSendTransaction();
  const { writeContract, data: contractHash, isPending: isContractSending } = useWriteContract();
  const activeHash = contractHash || hash;
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: activeHash });

  const [campaign, setCampaign] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [donationAmount, setDonationAmount] = useState('0.01');
  const [isDonating, setIsDonating] = useState(false);
  const [ethPrice, setEthPrice] = useState(2500);

  useEffect(() => {
    const fetchPrice = async () => {
      const price = await publicAPI.getEthPrice();
      setEthPrice(price);
    };
    fetchPrice();
    // Refresh price every 60 seconds
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  const usdValue = (Number(donationAmount) * ethPrice).toFixed(2);

  useEffect(() => {
    if (isConfirmed && activeHash) {
      const recordDonation = async () => {
        try {
          await donationAPI.create({
            campaign_id: campaignId,
            amount: usdValue,
            tx_hash: activeHash,
            token_type: 'ETH',
          });
          toast.success('Donation successful! Thank you for your support.');
          setIsDonating(false);
          // Reload campaign to show updated amount
          const res = await publicAPI.getCampaign(campaignId);
          if (res.data?.campaign) setCampaign(res.data.campaign);
        } catch (err) {
          console.error('Failed to record donation:', err);
          toast.error('Donation confirmed on blockchain but failed to update on DeReFund. Please contact support.');
        }
      };
      recordDonation();
    }
  }, [isConfirmed, activeHash, campaignId, usdValue]);

  const handleDonate = async () => {
    const parsedDonationUsd = Number(usdValue) || 0;

    if (!user) {
      toast.error('Create a donor account before donating.');
      sessionStorage.setItem('authRedirectPath', `/campaigns/${campaignId}`);
      openRegisterModal();
      return;
    }

    if (String(user.role || '').toUpperCase() !== 'DONOR') {
      toast.error('Only donor accounts can donate to campaigns.');
      return;
    }

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if ((Number(campaign?.current_amount) || 0) >= (Number(campaign?.target_amount) || 0)) {
      toast.error('This campaign is already fully funded.');
      setIsDonating(false);
      return;
    }

    if (!Number.isFinite(parsedDonationUsd) || parsedDonationUsd <= 0) {
      toast.error('Enter a valid donation amount.');
      return;
    }

    const remainingUsd = Math.max((Number(campaign?.target_amount) || 0) - (Number(campaign?.current_amount) || 0), 0);
    if (parsedDonationUsd > remainingUsd) {
      toast.error(`This donation is above the remaining goal. Maximum allowed is $${remainingUsd.toFixed(2)}.`);
      return;
    }

    if (!campaign?.contract_address && !campaign?.ngo_wallet_address) {
      toast.error('NGO wallet address not found');
      return;
    }
    if (campaign?.contract_address && milestones.length === 0) {
      toast.error('This campaign needs a milestone plan before escrow donations open.');
      return;
    }

    try {
      const value = parseEther(donationAmount);
      if (campaign.contract_address) {
        writeContract({
          address: campaign.contract_address,
          abi: derefundEscrowAbi,
          functionName: 'donate',
          value,
        });
      } else {
        sendTransaction({
          to: campaign.ngo_wallet_address,
          value,
        });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send donation');
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await publicAPI.getCampaign(campaignId);
        const c = res.data?.campaign;
        if (!c || cancelled) {
          setError('Campaign not found or not yet published.');
          setLoading(false);
          return;
        }
        setCampaign(c);
        const images = [...(c.image_urls || []), ...(c.disaster_images || [])].filter(Boolean);
        if (images.length === 0 && c.disaster_video) {
          setActiveImageIndex('video');
        } else {
          setActiveImageIndex(0);
        }
        setError(''); // Clear error if campaign is found

        const [milestonesRes, relatedRes] = await Promise.all([
          milestoneAPI.getByCampaign(campaignId).catch(() => ({ data: { milestones: [] } })),
          publicAPI.getCampaigns({ page: 1, limit: 6 }).catch(() => ({ data: { campaigns: [] } })),
        ]);

        if (!cancelled) {
          const m =
            milestonesRes.data?.milestones ||
            milestonesRes.milestones ||
            milestonesRes.data ||
            [];
          setMilestones(Array.isArray(m) ? m : []);

          const rel =
            relatedRes.data?.campaigns ||
            relatedRes.data ||
            relatedRes.campaigns ||
            [];
          setRelated(
            (Array.isArray(rel) ? rel : []).filter((x) => x.campaign_id !== campaignId).slice(0, 3)
          );
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load campaign');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (campaignId) load();
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  const allImages = [
    ...(campaign?.image_urls || []),
    ...(campaign?.disaster_images || []),
  ].filter(Boolean);

  const hasVideo = !!campaign?.disaster_video;
  const videoUrl = campaign?.disaster_video;

  const currentHeroSrc = allImages.length > 0 && activeImageIndex !== 'video' 
    ? allImages[activeImageIndex] 
    : (allImages.length > 0 ? allImages[0] : null);

  const raised = Number(campaign?.current_amount) || 0;
  const target = Number(campaign?.target_amount) || 1;
  const pct = Math.min(100, Math.round((raised / target) * 100));
  const remainingUsd = Math.max(target - raised, 0);
  const campaignFullyFunded = remainingUsd <= 0;
  const isDonorUser = String(user?.role || '').toUpperCase() === 'DONOR';
  const walletRequiredBeforeDonate = Boolean(user) && isDonorUser && !isConnected;
  const waitingForMilestones = Boolean(campaign?.contract_address) && milestones.length === 0;
  const donationUsdValue = Number(usdValue) || 0;
  const donationExceedsRemaining = !campaignFullyFunded && donationUsdValue > remainingUsd;
  const donateButtonDisabled = walletRequiredBeforeDonate || waitingForMilestones || campaignFullyFunded;

  return (
    <div className="bg-surface font-body text-on-surface">
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {loading && (
            <div className="py-24 text-center text-on-surface-variant">
              <p className="text-lg font-medium">Loading campaign…</p>
            </div>
          )}

          {!loading && error && !campaign && (
            <div className="py-16 text-center">
              <p className="text-lg text-error mb-6">{error}</p>
              <button
                type="button"
                onClick={() => navigate('/campaigns')}
                className="rounded-lg bg-primary px-6 py-3 font-semibold text-on-primary"
              >
                Back to campaigns
              </button>
            </div>
          )}

          {!loading && campaign && (
            <>
              <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                <div className="lg:col-span-8 space-y-4">
                  <div className="rounded-xl overflow-hidden aspect-[16/9] shadow-lg bg-surface-container-high relative">
                    {activeImageIndex === 'video' && hasVideo ? (
                      <video
                        key={videoUrl}
                        src={videoUrl}
                        className="w-full h-full object-cover"
                        controls
                        autoPlay
                        muted
                      />
                    ) : allImages.length > 0 ? (
                      <img 
                        key={currentHeroSrc}
                        className="w-full h-full object-cover transition-all duration-500" 
                        src={currentHeroSrc} 
                        alt="" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface-container-high text-on-surface-variant">
                        <span className="material-symbols-outlined text-6xl opacity-20">image</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase shadow-sm">
                        Live
                      </span>
                      {campaign.verification_threshold && (
                        <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase shadow-sm flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">how_to_reg</span>
                          {campaign.verification_threshold} Votes Req.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Media Thumbnails */}
                  {(allImages.length > 1 || hasVideo) && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {hasVideo && (
                        <button
                          onClick={() => setActiveImageIndex('video')}
                          className={`relative flex-shrink-0 w-24 aspect-video rounded-lg overflow-hidden border-2 transition-all bg-black flex items-center justify-center ${
                            activeImageIndex === 'video' ? 'border-primary shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <span className="material-symbols-outlined text-white text-3xl">play_circle</span>
                          <span className="absolute bottom-1 right-1 bg-black/60 text-[8px] text-white px-1 rounded uppercase font-bold">Video</span>
                        </button>
                      )}
                      {allImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative flex-shrink-0 w-24 aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                            activeImageIndex === idx ? 'border-primary shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-4">
                  <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_20px_40px_rgba(25,28,29,0.06)] h-full flex flex-col justify-between border border-outline-variant/15">
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-3xl font-black text-on-surface tracking-tighter">
                          {formatUsd(raised)}
                        </span>
                        <span className="text-on-surface-variant text-sm font-medium mb-1">
                          of {formatUsd(target)} goal
                        </span>
                      </div>
                      <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden mb-6">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        Verified pipeline: donor- or NGO-submitted campaigns are reviewed (NGO confirmation for donor
                        proposals, volunteer checks, then admin publish) before they appear here. NGO milestones list the
                        planned work, proof, and release transaction below.
                      </p>
                    </div>

                    <div className="space-y-4 mt-6">
                      {!campaign?.contract_address && !campaign?.ngo_wallet_address ? (
                        <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-xl text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <span className="material-symbols-outlined text-amber-500 text-4xl mb-2">account_balance_wallet</span>
                          <h4 className="text-amber-900 font-bold text-lg mb-1">Wallet Not Configured</h4>
                          <p className="text-amber-800 text-sm mb-4">
                            This NGO hasn't connected their wallet yet. Donations are temporarily disabled for this campaign.
                          </p>
                          <button
                            disabled
                            className="w-full bg-amber-200 text-amber-700 py-3 rounded-lg font-bold cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined">block</span>
                            Donations Unavailable
                          </button>
                        </div>
                      ) : isDonating ? (
                        <div className="space-y-4 p-4 bg-surface-container-high rounded-lg border border-outline-variant/20 animate-in fade-in slide-in-from-top-4 duration-300">
                          <label className="block text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                            Enter Amount (ETH)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              min="0.001"
                              value={donationAmount}
                              onChange={(e) => setDonationAmount(e.target.value)}
                              className="w-full bg-surface-container-lowest border-2 border-black rounded-lg px-4 py-3 text-lg font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                              placeholder="0.01"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">ETH</span>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-black/5 rounded-lg border border-black/10">
                            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Estimated USD</span>
                            <span className="text-sm font-black text-on-surface">${usdValue}</span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleDonate}
                              disabled={!isConnected || isSending || isContractSending || isConfirming || donationExceedsRemaining || campaignFullyFunded}
                              className="flex-1 rounded-lg bg-slate-900 py-3 font-bold text-white shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 hover:bg-slate-800 disabled:cursor-not-allowed disabled:border disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                            >
                              {(isSending || isContractSending || isConfirming) ? (
                                <>
                                  <span className="animate-spin material-symbols-outlined">progress_activity</span>
                                  {(isSending || isContractSending) ? 'Sending...' : 'Confirming...'}
                                </>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined">send</span>
                                  {!isConnected
                                    ? 'Connect Wallet First'
                                    : campaignFullyFunded
                                      ? 'Goal Reached'
                                      : campaign?.contract_address
                                        ? 'Deposit to Escrow'
                                        : 'Send ETH'}
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsDonating(false)}
                              disabled={isSending || isContractSending || isConfirming}
                              className="px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-lg text-on-surface-variant font-bold hover:bg-surface-container-high transition-all"
                            >
                              <span className="material-symbols-outlined">close</span>
                            </button>
                          </div>

                          {donationExceedsRemaining && (
                            <p className="text-xs font-semibold text-red-600">
                              This amount is above the remaining goal. Maximum allowed is ${remainingUsd.toFixed(2)}.
                            </p>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (walletRequiredBeforeDonate) {
                              toast.error('Connect your wallet before donating.');
                              return;
                            }
                            if (!user) {
                              toast.error('Create a donor account before donating.');
                              sessionStorage.setItem('authRedirectPath', `/campaigns/${campaignId}`);
                              openRegisterModal();
                              return;
                            }
                            if (String(user.role || '').toUpperCase() !== 'DONOR') {
                              toast.error('Only donor accounts can donate to campaigns.');
                              return;
                            }
                            setIsDonating(true);
                          }}
                          disabled={donateButtonDisabled}
                          className="w-full rounded-md bg-slate-900 py-4 text-lg font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:bg-slate-800 disabled:cursor-not-allowed disabled:border disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                        >
                          <span className="material-symbols-outlined">favorite</span>
                          {campaignFullyFunded
                            ? 'Goal Reached'
                            : waitingForMilestones
                              ? 'Waiting for Milestone Plan'
                              : walletRequiredBeforeDonate
                                ? 'Connect Wallet First'
                                : 'Donate Now'}
                        </button>
                      )}
                      
                      {campaignFullyFunded ? (
                        <p className="text-[10px] text-center text-emerald-700 font-bold">
                          This campaign has reached 100% of its goal and is no longer accepting donations.
                        </p>
                      ) : !isConnected && !isDonating && (
                        <p className="text-[10px] text-center text-primary font-bold animate-pulse">
                          Connect your wallet to donate!
                        </p>
                      )}
                      
                      <p className="text-[10px] text-center text-outline leading-relaxed">
                        {campaign?.contract_address
                          ? 'Donations are locked in this campaign escrow contract:'
                          : "Donations go directly to the NGO's verified wallet address:"}
                        <span className="block font-mono text-primary mt-1">
                          {campaign?.contract_address || campaign?.ngo_wallet_address || 'Not set'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-12">
                  <section>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-on-surface mb-4 leading-tight">
                      {campaign.title}
                    </h1>
                    <div className="flex flex-wrap gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 flex-wrap mb-1">
                          <span className="font-bold text-on-surface text-lg">{campaign.ngo_name || 'Partner NGO'}</span>
                          <span
                            className="material-symbols-outlined text-secondary text-lg"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            verified
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-on-surface-variant font-medium uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            {campaign.disaster_location || 'Global'}
                          </span>
                          {campaign.disaster_title && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">emergency</span>
                              Linked: {campaign.disaster_title}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xl font-black tracking-tight mb-4 uppercase text-on-surface-variant">
                      About the campaign
                    </h3>
                    <div className="max-w-none text-on-surface leading-relaxed text-lg whitespace-pre-wrap">
                      {campaign.description}
                    </div>
                  </section>

                  <section className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10">
                    <h3 className="text-xl font-black tracking-tight mb-8 uppercase text-on-surface-variant">
                      Milestones
                    </h3>
                    {milestones.length === 0 ? (
                      <p className="text-on-surface-variant text-sm">
                        Milestones will appear here as the NGO adds them.
                      </p>
                    ) : (
                      <ul className="space-y-4">
                        {milestones.map((m) => (
                          <li
                            key={m.milestone_id}
                            className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/15"
                          >
                            <div className="flex justify-between gap-4 flex-wrap">
                              <h4 className="font-bold text-lg">{m.title}</h4>
                              <span className="text-xs font-bold uppercase text-secondary">{m.status}</span>
                            </div>
                            {m.amount_to_release != null && (
                              <p className="text-sm text-on-surface-variant mt-2">
                                Release: ${Number(m.amount_to_release || 0).toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </p>
                            )}
                            {m.description && (
                              <p className="text-sm text-on-surface mt-3 leading-relaxed">{m.description}</p>
                            )}
                            {m.proof_url && (
                              <a
                                href={m.proof_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 mt-4 text-sm font-bold text-primary hover:underline"
                              >
                                <span className="material-symbols-outlined text-base">fact_check</span>
                                View NGO proof
                              </a>
                            )}
                            <div className="mt-4 space-y-1 text-xs text-on-surface-variant font-mono break-all">
                              {m.proof_tx_hash && <p>Proof tx: {shortHash(m.proof_tx_hash)}</p>}
                              {m.release_tx_hash && <p>Release tx: {shortHash(m.release_tx_hash)}</p>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </div>

                <div className="lg:col-span-4 space-y-8">
                  <div className="bg-primary-container text-on-primary-container p-6 rounded-xl shadow-sm border border-primary/10">
                    <h4 className="text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">verified_user</span>
                      Trust & Verification
                    </h4>
                    <p className="text-sm leading-relaxed opacity-90">
                      This campaign has been verified by the community and approved by DeReFund administrators. 
                      Funds release from escrow only after the NGO posts proof and an administrator approves the milestone.
                    </p>
                  </div>

                  {campaign.disaster_description && (
                    <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
                      <h5 className="font-bold text-sm uppercase tracking-widest text-on-surface-variant mb-3">Context from Incident</h5>
                      <p className="text-on-surface text-sm leading-relaxed italic border-l-4 border-primary/20 pl-4">
                        "{campaign.disaster_description}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {related.length > 0 && (
                <section className="mt-20">
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <h2 className="text-3xl font-black tracking-tighter text-on-surface">More campaigns</h2>
                      <p className="text-on-surface-variant text-sm font-medium">
                        Other live relief efforts you can support.
                      </p>
                    </div>
                    <Link to="/campaigns" className="text-primary font-bold text-sm uppercase tracking-widest hover:underline">
                      See all
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {related.map((r) => {
                      const img = (r.image_urls && r.image_urls[0]) || assets.hero2;
                      const p = r.target_amount > 0 ? Math.min(100, ((r.current_amount || 0) / r.target_amount) * 100) : 0;
                      return (
                        <Link
                          key={r.campaign_id}
                          to={`/campaigns/${r.campaign_id}`}
                          className="group bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/15 hover:shadow-ambient transition-shadow"
                        >
                          <div className="relative h-40 overflow-hidden">
                            <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-on-surface line-clamp-2 mb-2">{r.title}</h3>
                            <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${p}%` }} />
                            </div>
                            <p className="text-xs text-outline mt-2">{formatUsd(r.current_amount || 0)} raised</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CampaignDetail;
