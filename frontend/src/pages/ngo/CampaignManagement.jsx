import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { campaignAPI, donationAPI, milestoneAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import NGOLayout from '../../components/NGOLayout';
import ConfirmModal from '../../components/ConfirmModal';
import { toast } from 'react-hot-toast';
import { DollarSign, FileText, Loader2, Plus, Trash2 } from 'lucide-react';
import { useAccount, useWriteContract } from 'wagmi';
import { derefundEscrowAbi } from '../../contracts/DeReFundEscrow';

const CampaignManagement = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [creatingMilestone, setCreatingMilestone] = useState(false);
  const [milestoneError, setMilestoneError] = useState('');
  const [milestoneSuccess, setMilestoneSuccess] = useState('');
  const [proofInputs, setProofInputs] = useState({});
  const [submittingProofId, setSubmittingProofId] = useState(null);
  const [deletingMilestoneId, setDeletingMilestoneId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, milestone: null });
  const [confirmDeleteCampaign, setConfirmDeleteCampaign] = useState({ isOpen: false });
  const [deletingCampaign, setDeletingCampaign] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    amount_to_release: '',
  });

  // All hooks must be called before any conditional returns
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        setLoading(true);
        const [campaignData, donationsData, milestonesData] = await Promise.all([
          campaignAPI.getById(campaignId),
          donationAPI.getByCampaign(campaignId),
          milestoneAPI.getByCampaign(campaignId),
        ]);

        const campaignPayload =
          campaignData.data?.campaign ||
          campaignData.data?.data?.campaign ||
          campaignData.data ||
          campaignData.campaign ||
          null;
        setCampaign(campaignPayload);

        const donationsPayload =
          donationsData.data?.donations ||
          donationsData.data?.data?.donations ||
          donationsData.data ||
          donationsData.donations ||
          [];
        setDonations(Array.isArray(donationsPayload) ? donationsPayload : []);

        const milestonesPayload =
          milestonesData.data?.milestones ||
          milestonesData.data?.data?.milestones ||
          milestonesData.data ||
          milestonesData.milestones ||
          [];
        setMilestones(Array.isArray(milestonesPayload) ? milestonesPayload : []);
      } catch (error) {
        console.error('Error fetching campaign data:', error);
        setCampaign(null);
        setDonations([]);
        setMilestones([]);
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      fetchCampaignData();
    }
  }, [campaignId]);

  const refreshMilestones = async () => {
    const milestonesData = await milestoneAPI.getByCampaign(campaignId);
    const milestonesPayload =
      milestonesData.data?.milestones ||
      milestonesData.data?.data?.milestones ||
      milestonesData.data ||
      milestonesData.milestones ||
      [];
    setMilestones(Array.isArray(milestonesPayload) ? milestonesPayload : []);
  };

  const handleMilestoneInput = (field, value) => {
    setMilestoneForm((prev) => ({ ...prev, [field]: value }));
    setMilestoneError('');
    setMilestoneSuccess('');
  };

  const handleDeleteCampaign = () => {
    setConfirmDeleteCampaign({ isOpen: true });
  };

  const confirmDeleteCampaignAction = async () => {
    try {
      setDeletingCampaign(true);
      await campaignAPI.delete(campaignId);
      toast.success('Campaign deleted successfully');
      navigate('/ngo/campaigns');
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error(error.message || 'Failed to delete campaign');
    } finally {
      setDeletingCampaign(false);
      setConfirmDeleteCampaign({ isOpen: false });
    }
  };

  const handleCreateMilestone = async (event) => {
    event.preventDefault();
    setMilestoneError('');
    setMilestoneSuccess('');

    const title = milestoneForm.title.trim();
    const description = milestoneForm.description.trim();
    const amount = Number(milestoneForm.amount_to_release);

    if (title.length < 5) {
      setMilestoneError('Title must be at least 5 characters.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setMilestoneError('Amount used must be greater than 0.');
      return;
    }

    try {
      setCreatingMilestone(true);
      await milestoneAPI.create({
        campaign_id: campaignId,
        title,
        description,
        amount_to_release: amount,
        order_index: milestones.length,
      });
      setMilestoneForm({ title: '', description: '', amount_to_release: '' });
      setMilestoneSuccess('Milestone plan added to escrow. Donors can now see this release task.');
      await refreshMilestones();
    } catch (error) {
      setMilestoneError(error.message || 'Failed to post milestone update.');
    } finally {
      setCreatingMilestone(false);
    }
  };

  const handleProofInput = (milestoneId, value) => {
    setProofInputs((prev) => ({ ...prev, [milestoneId]: value }));
    setMilestoneError('');
    setMilestoneSuccess('');
  };

  const handleSubmitProof = async (milestone) => {
    const proofUrl = (proofInputs[milestone.milestone_id] || milestone.proof_url || '').trim();

    if (!campaign.contract_address) {
      setMilestoneError('This campaign does not have an escrow contract yet.');
      return;
    }
    if (!isConnected) {
      setMilestoneError('Connect the NGO wallet first, then submit proof.');
      return;
    }
    if (!proofUrl) {
      setMilestoneError('Add a proof link before submitting.');
      return;
    }
    if (milestone.escrow_milestone_id == null) {
      setMilestoneError('This milestone is not linked to the escrow contract.');
      return;
    }

    try {
      setSubmittingProofId(milestone.milestone_id);
      const txHash = await writeContractAsync({
        address: campaign.contract_address,
        abi: derefundEscrowAbi,
        functionName: 'submitProof',
        args: [BigInt(milestone.escrow_milestone_id), proofUrl],
      });

      await milestoneAPI.submitProof(milestone.milestone_id, {
        proof_url: proofUrl,
        proof_tx_hash: txHash,
      });

      setMilestoneSuccess('Proof submitted. Admin can now review and release this milestone payment.');
      setProofInputs((prev) => ({ ...prev, [milestone.milestone_id]: '' }));
      await refreshMilestones();
    } catch (error) {
      setMilestoneError(error.shortMessage || error.message || 'Failed to submit milestone proof.');
    } finally {
      setSubmittingProofId(null);
    }
  };

  const handleDeleteMilestone = async (milestone) => {
    setConfirmDelete({ isOpen: true, milestone });
  };

  const confirmDeleteMilestone = async () => {
    const { milestone } = confirmDelete;
    if (!milestone) return;

    try {
      setDeletingMilestoneId(milestone.milestone_id);
      setMilestoneError('');
      setMilestoneSuccess('');
      await milestoneAPI.delete(milestone.milestone_id);
      setMilestoneSuccess('Milestone deleted successfully from the app.');
      toast.success('Milestone deleted');
      await refreshMilestones();
    } catch (error) {
      setMilestoneError(error.message || 'Failed to delete milestone.');
      toast.error('Failed to delete milestone');
    } finally {
      setDeletingMilestoneId(null);
      setConfirmDelete({ isOpen: false, milestone: null });
    }
  };

  // Now conditional returns can happen after all hooks
  if (!user || user.role !== 'NGO') {
    return (
      <NGOLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-4 tracking-tight">Access Denied</h2>
            <p className="text-gray-800 tracking-tight">This page is only available for NGOs.</p>
          </div>
        </div>
      </NGOLayout>
    );
  }

  if (loading) {
    return (
      <NGOLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-800 tracking-tight">Loading campaign data...</p>
          </div>
        </div>
      </NGOLayout>
    );
  }

  if (!campaign) {
    return (
      <NGOLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-4 tracking-tight">Campaign Not Found</h2>
            <Link to="/ngo/campaigns" className="text-primary hover:opacity-80 transition-opacity tracking-tight font-bold">Back to Campaigns</Link>
          </div>
        </div>
      </NGOLayout>
    );
  }

  const progressPercentage = campaign.target_amount > 0
    ? ((campaign.current_amount || 0) / campaign.target_amount) * 100
    : 0;
  const hasEscrow = Boolean(campaign.contract_address);
  const milestoneAmount = Number(milestoneForm.amount_to_release);
  const canCreateMilestone =
    hasEscrow &&
    milestoneForm.title.trim().length >= 5 &&
    milestoneForm.description.trim().length >= 10 &&
    Number.isFinite(milestoneAmount) &&
    milestoneAmount > 0 &&
    !creatingMilestone;

  const getProofUrl = (milestone) =>
    (proofInputs[milestone.milestone_id] ?? milestone.proof_url ?? '').trim();

  const canSubmitProof = (milestone) =>
    hasEscrow &&
    isConnected &&
    getProofUrl(milestone).length >= 5 &&
    milestone.status !== 'SUBMITTED' &&
    milestone.status !== 'APPROVED' &&
    submittingProofId !== milestone.milestone_id;

  const getProofButtonHint = (milestone) => {
    if (milestone.status === 'SUBMITTED') return 'Proof is already waiting for admin review.';
    if (milestone.status === 'APPROVED') return 'This milestone has already been released.';
    if (!isConnected) return 'Connect the NGO wallet before submitting proof.';
    if (getProofUrl(milestone).length < 5) return 'Add a proof link to enable submission.';
    return '';
  };

  return (
    <NGOLayout>
      <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2 tracking-tight">{campaign.title}</h1>
                <p className="text-gray-800 tracking-tight">{campaign.description}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/ngo/campaigns/${campaignId}/edit`}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-[#001a38] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-bold tracking-tight"
                >
                  Edit Campaign
                </Link>
                {(campaign.status !== 'LIVE' || parseFloat(campaign.current_amount || 0) === 0) && (
                  <button
                    onClick={handleDeleteCampaign}
                    disabled={deletingCampaign}
                    className="px-6 py-3 bg-red-50 text-red-600 border-2 border-red-100 rounded-xl hover:bg-red-100 hover:border-red-200 transition-all duration-300 font-bold tracking-tight flex items-center gap-2"
                  >
                    {deletingCampaign ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-6 mb-6">
            <div className="grid md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white border-2 border-primary/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-primary mb-1 tracking-tight">
                  ${(campaign.current_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-gray-800 font-bold tracking-tight">Raised</div>
              </div>
              <div className="bg-white border-2 border-green-500/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600 mb-1 tracking-tight">{donations.length}</div>
                <div className="text-sm text-gray-800 font-bold tracking-tight">Donations</div>
              </div>
              <div className="bg-white border-2 border-blue-500/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-600 mb-1 tracking-tight">{milestones.length}</div>
                <div className="text-sm text-gray-800 font-bold tracking-tight">Milestones</div>
              </div>
              <div className="bg-white border-2 border-orange-500/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-orange-600 mb-1 tracking-tight">{Math.round(progressPercentage)}%</div>
                <div className="text-sm text-gray-800 font-bold tracking-tight">Progress</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 mb-6 overflow-hidden">
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-bold transition tracking-tight ${
                  activeTab === 'overview'
                    ? 'text-primary border-b-4 border-primary bg-primary-fixed/30'
                    : 'text-gray-800 hover:text-primary hover:bg-slate-50'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('donations')}
                className={`px-6 py-4 font-bold transition tracking-tight ${
                  activeTab === 'donations'
                    ? 'text-primary border-b-4 border-primary bg-primary-fixed/30'
                    : 'text-gray-800 hover:text-primary hover:bg-slate-50'
                }`}
              >
                Donations ({donations.length})
              </button>
              <button
                onClick={() => setActiveTab('milestones')}
                className={`px-6 py-4 font-bold transition tracking-tight ${
                  activeTab === 'milestones'
                    ? 'text-primary border-b-4 border-primary bg-primary-fixed/30'
                    : 'text-gray-800 hover:text-primary hover:bg-slate-50'
                }`}
              >
                Milestones ({milestones.length})
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-black mb-4 tracking-tight">Campaign Progress</h2>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-2 tracking-tight">
                      <span className="text-gray-800 font-bold">Target: ${campaign.target_amount.toLocaleString()}</span>
                      <span className="font-bold text-primary">
                        ${(campaign.current_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-primary to-[#001a38] h-4 rounded-full transition-all"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-black mb-4 tracking-tight">Campaign Details</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold tracking-tight ${
                        campaign.status === 'LIVE' ? 'bg-green-100 text-green-700' :
                        campaign.status === 'COMPLETED' ? 'bg-primary-fixed/50 text-primary' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Created</p>
                      <p className="text-black font-bold tracking-tight">
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'donations' && (
              <div>
                <h2 className="text-xl font-bold text-black mb-4 tracking-tight">Donations Received</h2>
                {donations.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold tracking-tight">No donations received yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Donor</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {donations.map((d) => (
                          <tr key={d.donation_id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-bold text-slate-900 tracking-tight">
                              {d.donor_name || 'Anonymous'}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-primary tracking-tight">
                              ${parseFloat(d.amount).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 tracking-tight">
                              {new Date(d.donated_at || d.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm font-mono text-slate-400 tracking-tight">
                              {d.transaction_hash || d.tx_hash ? `${(d.transaction_hash || d.tx_hash).slice(0, 6)}...${(d.transaction_hash || d.tx_hash).slice(-4)}` : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'milestones' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-black tracking-tight">Campaign Milestones</h2>
                  <span className={`px-4 py-2 rounded-lg font-bold text-sm ${
                    hasEscrow ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {hasEscrow ? 'Escrow ready' : 'Escrow not deployed'}
                  </span>
                </div>
                {hasEscrow ? (
                  <form onSubmit={handleCreateMilestone} className="mb-6 p-5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="mt-1 rounded-lg bg-primary text-white p-2">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 tracking-tight">Add release milestone plan</h3>
                        <p className="text-sm text-slate-600 tracking-tight">
                          Define what work must be proven before this part of the escrow can be released.
                        </p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Milestone task
                        </label>
                        <input
                          value={milestoneForm.title}
                          onChange={(e) => handleMilestoneInput('title', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="Food supplies delivered"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Release amount (USD)
                        </label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={milestoneForm.amount_to_release}
                          onChange={(e) => handleMilestoneInput('amount_to_release', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="20"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Planned work
                      </label>
                      <textarea
                        value={milestoneForm.description}
                        onChange={(e) => handleMilestoneInput('description', e.target.value)}
                        rows={4}
                        className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Describe what the NGO will complete before requesting this release."
                      />
                    </div>
                    {milestoneError && (
                      <p className="mb-3 text-sm font-bold text-red-600 tracking-tight">{milestoneError}</p>
                    )}
                    {milestoneSuccess && (
                      <p className="mb-3 text-sm font-bold text-green-700 tracking-tight">{milestoneSuccess}</p>
                    )}
                    {!canCreateMilestone && !creatingMilestone && (
                      <p className="mb-3 text-sm font-semibold text-slate-600 tracking-tight">
                        Fill the task, release amount, and planned work to add this milestone.
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={!canCreateMilestone}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:border disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                    >
                      {creatingMilestone ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      {creatingMilestone ? 'Adding Milestone...' : 'Add Milestone Plan'}
                    </button>
                  </form>
                ) : (
                  <div className="mb-6 p-5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-700 font-medium tracking-tight">
                      Milestones can be added after admin publishes the campaign and the escrow contract is deployed.
                    </p>
                  </div>
                )}
                {milestones.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold tracking-tight">No milestones added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {milestones.map((m) => (
                      <div key={m.milestone_id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-primary/30 transition-all">
                        <div className="flex justify-between items-start gap-3 mb-2">
                          <h4 className="font-bold text-slate-900 tracking-tight">{m.title}</h4>
                          <div className="flex flex-wrap justify-end gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              m.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                              m.status === 'SUBMITTED' ? 'bg-amber-100 text-amber-700' :
                              'bg-primary-fixed/50 text-primary'
                            }`}>
                              {m.status}
                            </span>
                            {m.status !== 'APPROVED' && (
                              <button
                                type="button"
                                onClick={() => handleDeleteMilestone(m)}
                                disabled={deletingMilestoneId === m.milestone_id}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                title="Delete milestone"
                              >
                                {deletingMilestoneId === m.milestone_id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 tracking-tight">{m.description}</p>
                        <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-slate-600">
                          <span>Release: ${Number(m.amount_to_release || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          {m.escrow_milestone_id != null && <span>Escrow ID: {m.escrow_milestone_id}</span>}
                          {m.release_tx_hash && <span>Released: {m.release_tx_hash.slice(0, 8)}...{m.release_tx_hash.slice(-6)}</span>}
                        </div>
                        {m.proof_url && (
                          <a
                            href={m.proof_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-block text-sm font-bold text-primary hover:underline"
                          >
                            View submitted proof
                          </a>
                        )}
                        {m.status !== 'APPROVED' && (
                          <div className="mt-4">
                            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                              <input
                                value={proofInputs[m.milestone_id] ?? ''}
                                onChange={(e) => handleProofInput(m.milestone_id, e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Proof link: receipt, report, photo folder, IPFS URL"
                              />
                              <button
                                type="button"
                                onClick={() => handleSubmitProof(m)}
                                disabled={!canSubmitProof(m)}
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:border disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                              >
                                {submittingProofId === m.milestone_id && <Loader2 className="w-4 h-4 animate-spin" />}
                                {submittingProofId === m.milestone_id
                                  ? 'Submitting Proof...'
                                  : m.status === 'SUBMITTED'
                                  ? 'Waiting Admin'
                                  : 'Submit Proof'}
                              </button>
                            </div>
                            {getProofButtonHint(m) && (
                              <p className="mt-2 text-xs font-semibold text-slate-500">
                                {getProofButtonHint(m)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, milestone: null })}
        onConfirm={confirmDeleteMilestone}
        title="Delete Milestone"
        message={`Delete milestone "${confirmDelete.milestone?.title}" from this campaign? \n\nIf it was already added to the smart contract, the on-chain record cannot be erased, but the app will stop using this milestone.`}
        isLoading={deletingMilestoneId !== null}
        confirmText="Delete"
      />

      <ConfirmModal
        isOpen={confirmDeleteCampaign.isOpen}
        onClose={() => setConfirmDeleteCampaign({ isOpen: false })}
        onConfirm={confirmDeleteCampaignAction}
        title="Delete Campaign"
        message={`Are you sure you want to delete the campaign "${campaign.title}"? This action cannot be undone. \n\nNote: If the campaign has an escrow contract, it will still exist on-chain but won't be visible in the app.`}
        isLoading={deletingCampaign}
        confirmText="Delete"
      />
    </NGOLayout>
  );
};

export default CampaignManagement;
