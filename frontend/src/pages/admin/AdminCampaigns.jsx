import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, volunteerVerificationAPI, campaignAPI } from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import ConfirmModal from '../../components/ConfirmModal';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Users, Clock, AlertCircle, ShieldCheck, FileText, DollarSign, Trash2, Loader2 } from 'lucide-react';
import { assets } from '../../assets/assets';

const AdminCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [releasingId, setReleasingId] = useState(null);
  const [verificationStatuses, setVerificationStatuses] = useState({});
  const [submittedMilestones, setSubmittedMilestones] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, campaignId: null, campaignTitle: '' });
  const [acting, setActing] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getCampaignsPendingApproval({ limit: 50 });
      const milestonesResponse = await adminAPI.getSubmittedMilestones({ limit: 50 }).catch(() => ({ data: { milestones: [] } }));
      const campaignsList = response.data?.campaigns || [];
      const milestoneList = milestonesResponse.data?.milestones || milestonesResponse.milestones || [];
      setCampaigns(campaignsList);
      setSubmittedMilestones(Array.isArray(milestoneList) ? milestoneList : []);

      // Fetch verification status in parallel batches for better performance
      if (campaignsList.length > 0) {
        const batchSize = 10;
        const statusMap = {};
        
        for (let i = 0; i < campaignsList.length; i += batchSize) {
          const batch = campaignsList.slice(i, i + batchSize);
          const statusPromises = batch.map(async (campaign) => {
            try {
              const status = await volunteerVerificationAPI.getCampaignVerificationStatus(campaign.campaign_id);
              return { campaignId: campaign.campaign_id, status: status.data };
            } catch {
              return { campaignId: campaign.campaign_id, status: null };
            }
          });
          
          const statuses = await Promise.all(statusPromises);
          statuses.forEach(({ campaignId, status }) => {
            statusMap[campaignId] = status;
          });
          
          // Update state incrementally for faster UI updates
          setVerificationStatuses(prev => ({ ...prev, ...statusMap }));
        }
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (campaignId, status) => {
    try {
      setApprovingId(campaignId);
      await adminAPI.approveCampaign(campaignId, { status });
      toast.success(`Campaign status updated to ${status}`);
      await fetchCampaigns();
    } catch (error) {
      console.error('Error approving campaign:', error);
      toast.error(error.message || 'Failed to approve campaign');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReleaseMilestone = async (milestoneId) => {
    try {
      setReleasingId(milestoneId);
      await adminAPI.releaseMilestone(milestoneId);
      toast.success('Milestone funds released');
      await fetchCampaigns();
    } catch (error) {
      console.error('Error releasing milestone:', error);
      toast.error(error.message || 'Failed to release milestone funds');
    } finally {
      setReleasingId(null);
    }
  };

  const handleDelete = (campaignId, campaignTitle) => {
    setConfirmDelete({ isOpen: true, campaignId, campaignTitle });
  };

  const confirmDeleteCampaign = async () => {
    const { campaignId } = confirmDelete;
    if (!campaignId) return;

    setActing(`delete-${campaignId}`);
    try {
      await campaignAPI.delete(campaignId);
      toast.success('Campaign deleted successfully');
      await fetchCampaigns();
    } catch (e) {
      console.error(e);
      toast.error(e.message || 'Failed to delete campaign');
    } finally {
      setActing(null);
      setConfirmDelete({ isOpen: false, campaignId: null, campaignTitle: '' });
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      LIVE: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      PENDING_ADMIN_APPROVAL: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
      PENDING_NGO_VERIFICATION: { bg: 'bg-sky-100', text: 'text-sky-800', icon: AlertCircle },
      VERIFIED_BY_VOLUNTEERS: { bg: 'bg-primary-fixed/70', text: 'text-[#0a3d6b]', icon: ShieldCheck },
      PENDING_VERIFICATION: { bg: 'bg-orange-100', text: 'text-orange-700', icon: AlertCircle },
    };
    const config = statusMap[status] || { bg: 'bg-slate-100', text: 'text-slate-700', icon: AlertCircle };
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text} tracking-tight`}>
        <Icon className="w-3.5 h-3.5" />
        {status?.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Campaign Approvals</h1>
          <p className="text-slate-600 tracking-tight">
            Publish campaigns that are ready: NGO-confirmed donor proposals and NGO-submitted campaigns (legacy
            volunteer-verified flows still appear here).
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Milestone Proofs Waiting for Release</h2>
          {submittedMilestones.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-slate-600 tracking-tight">
              No milestone proofs are waiting for approval.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {submittedMilestones.map((milestone) => (
                <div key={milestone.milestone_id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 tracking-tight">{milestone.title}</h3>
                      <p className="text-xs text-slate-500 font-semibold tracking-tight">
                        {milestone.campaign_title} • {milestone.ngo_name || 'NGO'}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                      SUBMITTED
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3 tracking-tight">{milestone.description}</p>
                  <div className="text-xs font-semibold text-slate-700 space-y-1 mb-4">
                    <p>
                      Release amount: ${Number(milestone.amount_to_release || 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p>Escrow ID: {milestone.escrow_milestone_id ?? 'Not linked'}</p>
                    {milestone.proof_tx_hash && (
                      <p>Proof tx: {milestone.proof_tx_hash.slice(0, 10)}...{milestone.proof_tx_hash.slice(-8)}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {milestone.proof_url && (
                      <a
                        href={milestone.proof_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 text-center bg-slate-100 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors text-sm font-bold tracking-tight"
                      >
                        View Proof
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleReleaseMilestone(milestone.milestone_id)}
                      disabled={releasingId === milestone.milestone_id}
                      className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 text-sm font-bold tracking-tight"
                    >
                      {releasingId === milestone.milestone_id ? 'Releasing...' : 'Approve & Release'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Campaigns Grid */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
            <p className="text-slate-600 tracking-tight">Loading campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <ShieldCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 tracking-tight">No campaigns pending approval.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => {
              const verificationStatus = verificationStatuses[campaign.campaign_id];
              // Use verification_count from campaign if available, otherwise from status
              const verificationCount = campaign.verification_count || verificationStatus?.verificationCount || 0;
              const requiredVerifications = verificationStatus?.required || campaign.verification_threshold || 20;

              return (
                <div
                  key={campaign.campaign_id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  <div className="h-40 overflow-hidden bg-slate-100">
                    <img
                      src={
                        (campaign.image_urls && campaign.image_urls[0]) ||
                        (campaign.disaster_images && campaign.disaster_images[0]) ||
                        assets.hero1
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight flex-1 pr-2">
                        {campaign.title}
                      </h3>
                      {getStatusBadge(campaign.status)}
                    </div>
                    
                    <p className="text-slate-600 mb-4 line-clamp-3 tracking-tight text-sm">
                      {campaign.description}
                    </p>

                    <p className="text-xs font-semibold text-slate-700 mb-4">
                      Pipeline:{' '}
                      {campaign.creation_source === 'DONOR'
                        ? 'Donor proposal → NGO confirmed → admin publish'
                        : 'NGO created → admin publish'}
                    </p>

                    {campaign.disaster_title && (
                      <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-xs text-slate-500 tracking-tight mb-1">Related Disaster:</div>
                        <div className="font-semibold text-slate-900 tracking-tight">{campaign.disaster_title}</div>
                      </div>
                    )}

                    <div className="mb-4 p-3 bg-primary-fixed/50 rounded-lg border border-outline-variant">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          <span className="text-sm font-bold text-[#0a3d6b] tracking-tight">
                            {verificationCount} / {requiredVerifications} Volunteers
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-primary-fixed/70 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((verificationCount / requiredVerifications) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mb-4 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="text-xs text-slate-500 tracking-tight">Target</div>
                          <div className="text-sm font-bold text-slate-900 tracking-tight">
                            ${campaign.target_amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`mb-4 p-3 rounded-lg border text-xs font-semibold ${
                      campaign.contract_address
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}>
                      {campaign.contract_address
                        ? `Escrow: ${campaign.contract_address.slice(0, 6)}...${campaign.contract_address.slice(-4)}`
                        : 'No escrow contract address set. Donations will not use smart-contract escrow.'}
                    </div>

                    <div className="flex gap-2 mt-4">
                      {campaign.status === 'PENDING_ADMIN_APPROVAL' && campaign.creation_source === 'DONOR' ? (
                        <>
                          <button
                            onClick={() => handleApprove(campaign.campaign_id, 'APPROVE_PROPOSAL')}
                            disabled={approvingId === campaign.campaign_id}
                            className="flex-1 flex items-center justify-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 text-sm font-bold tracking-tight"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {approvingId === campaign.campaign_id ? 'Processing...' : 'Approve Proposal'}
                          </button>
                          <button
                            onClick={() => handleApprove(campaign.campaign_id, 'REJECTED')}
                            disabled={approvingId === campaign.campaign_id}
                            className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm font-bold tracking-tight"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      ) : campaign.status === 'VERIFIED_BY_VOLUNTEERS' || (campaign.status === 'PENDING_ADMIN_APPROVAL' && campaign.creation_source === 'NGO') ? (
                        <>
                          <button
                            onClick={() => handleApprove(campaign.campaign_id, 'LIVE')}
                            disabled={approvingId === campaign.campaign_id}
                            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 text-sm font-bold tracking-tight"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {approvingId === campaign.campaign_id ? 'Publishing...' : 'Publish LIVE'}
                          </button>
                          <button
                            onClick={() => handleApprove(campaign.campaign_id, 'REJECTED')}
                            disabled={approvingId === campaign.campaign_id}
                            className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm font-bold tracking-tight"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      ) : null}
                      <Link
                        to={`/campaigns/${campaign.campaign_id}`}
                        className="flex items-center justify-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm font-bold tracking-tight"
                      >
                        <FileText className="w-4 h-4" />
                        View
                      </Link>
                      <button
                        type="button"
                        disabled={acting === `delete-${campaign.campaign_id}`}
                        onClick={() => handleDelete(campaign.campaign_id, campaign.title)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100 disabled:opacity-50"
                        title="Delete Campaign"
                      >
                        {acting === `delete-${campaign.campaign_id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, campaignId: null, campaignTitle: '' })}
        onConfirm={confirmDeleteCampaign}
        title="Delete Campaign"
        message={`Are you sure you want to delete the campaign "${confirmDelete.campaignTitle}"? This action cannot be undone. \n\nNote: If the campaign has an escrow contract, it will still exist on-chain but won't be visible in the app.`}
        isLoading={acting === `delete-${confirmDelete.campaignId}`}
        confirmText="Delete"
      />
    </AdminLayout>
  );
};

export default AdminCampaigns;
