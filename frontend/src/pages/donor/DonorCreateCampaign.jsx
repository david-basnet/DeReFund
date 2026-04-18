import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { campaignAPI, disasterAPI, publicAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import DonorLayout from '../../components/DonorLayout';
import {
  AlertCircle,
  FileText,
  DollarSign,
  Image as ImageIcon,
  Globe,
  Loader2,
  CheckCircle2,
  Building2,
} from 'lucide-react';

const parseUrlLines = (text) => {
  return String(text || '')
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
};

const DonorCreateCampaign = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [disasters, setDisasters] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [imageInput, setImageInput] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_amount: '',
    case_id: '',
    ngo_id: '',
    verification_threshold: 20,
  });

  const handleAddImageUrl = () => {
    if (imageInput.trim()) {
      try {
        new URL(imageInput.trim());
        setImageUrls(prev => [...prev, imageInput.trim()]);
        setImageInput('');
        setError('');
      } catch {
        setError('Please enter a valid image URL');
      }
    }
  };

  const handleRemoveImageUrl = (index) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const caseIdFromUrl = searchParams.get('case_id');
    if (caseIdFromUrl) {
      setFormData((prev) => ({ ...prev, case_id: caseIdFromUrl }));
    }

    const load = async () => {
      try {
        const [dRes, nRes] = await Promise.all([
          disasterAPI.getAll({ status: 'APPROVED' }),
          publicAPI.getVerifiedNgos(),
        ]);
        const disastersData =
          dRes.data?.disasters || dRes.data?.data?.disasters || dRes.disasters || dRes.data || [];
        setDisasters(Array.isArray(disastersData) ? disastersData : []);
        const ngosData = nRes.data?.ngos || nRes.ngos || [];
        setNgos(Array.isArray(ngosData) ? ngosData : []);
      } catch (err) {
        console.error(err);
        setDisasters([]);
        setNgos([]);
      }
    };
    load();
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!formData.title || formData.title.trim().length < 5) {
        setError('Title must be at least 5 characters');
        setLoading(false);
        return;
      }
      if (!formData.description || formData.description.trim().length < 20) {
        setError('Description must be at least 20 characters');
        setLoading(false);
        return;
      }
      if (!formData.target_amount || parseFloat(formData.target_amount) <= 0) {
        setError('Target amount must be greater than 0');
        setLoading(false);
        return;
      }
      if (!formData.ngo_id) {
        setError('Please select a verified NGO');
        setLoading(false);
        return;
      }
      if (!formData.case_id) {
        setError('Please select an approved disaster case');
        setLoading(false);
        return;
      }

      const campaignData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        target_amount: parseFloat(formData.target_amount),
        case_id: formData.case_id,
        ngo_id: formData.ngo_id,
        verification_threshold: parseInt(formData.verification_threshold),
        image_urls: imageUrls,
      };

      const res = await campaignAPI.createDonorProposal(campaignData);
      if (res.success) {
        navigate('/donor/campaigns');
      } else {
        setError(res.message || 'Failed to submit proposal');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const selectedDisaster = disasters.find((d) => d.case_id === formData.case_id);

  if (!user || user.role !== 'DONOR') {
    return (
      <DonorLayout>
        <div className="p-8 text-center text-on-surface">Sign in as a donor to propose a campaign.</div>
      </DonorLayout>
    );
  }

  return (
    <DonorLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-on-surface mb-2 tracking-tight">Propose a campaign</h1>
          <p className="text-on-surface-variant tracking-tight max-w-2xl">
            Choose a verified NGO to deliver the work. They confirm your proposal, then an administrator publishes it.
          </p>
        </div>

        {error && (
          <div className="bg-error-container border border-error/30 text-on-error-container px-6 py-4 rounded-xl mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="font-semibold tracking-tight">{error}</p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/20 p-8 space-y-8"
        >
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-on-surface tracking-tight">
              <Building2 className="w-4 h-4 text-primary" />
              Partner NGO (verified) *
            </label>
            <select
              name="ngo_id"
              value={formData.ngo_id}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-outline-variant rounded-xl focus:ring-2 focus:ring-primary bg-surface-container-lowest text-on-surface font-medium"
              required
            >
              <option value="">Select NGO</option>
              {ngos.map((n) => (
                <option key={n.user_id} value={n.user_id}>
                  {n.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-on-surface-variant">This organization must review and confirm before admin publish.</p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-on-surface tracking-tight">
              <FileText className="w-4 h-4 text-primary" />
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-outline-variant rounded-xl focus:ring-2 focus:ring-primary bg-surface-container-lowest text-on-surface"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-on-surface tracking-tight">
              <FileText className="w-4 h-4 text-primary" />
              Description *
            </label>
            <textarea
              rows={6}
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-outline-variant rounded-xl focus:ring-2 focus:ring-primary bg-surface-container-lowest text-on-surface resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-on-surface tracking-tight">
                <DollarSign className="w-4 h-4 text-primary" />
                Target (USD) *
              </label>
              <input
                type="number"
                name="target_amount"
                value={formData.target_amount}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-outline-variant rounded-xl focus:ring-2 focus:ring-primary bg-surface-container-lowest text-on-surface"
                min="1"
                step="0.01"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-on-surface tracking-tight">
                <Globe className="w-4 h-4 text-primary" />
                Disaster case *
              </label>
              <select
                name="case_id"
                value={formData.case_id}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-outline-variant rounded-xl focus:ring-2 focus:ring-primary bg-surface-container-lowest text-on-surface"
                required
              >
                <option value="">Select disaster</option>
                {disasters.map((d) => (
                  <option key={d.case_id} value={d.case_id}>
                    {d.title} — {d.location}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-on-surface tracking-tight">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Verification Threshold *
              </label>
              <input
                type="number"
                name="verification_threshold"
                value={formData.verification_threshold}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-outline-variant rounded-xl focus:ring-2 focus:ring-primary bg-surface-container-lowest text-on-surface"
                min="5"
                max="50"
                required
              />
              <p className="text-xs text-on-surface-variant">Required volunteer votes (min 5, max 50)</p>
            </div>
          </div>

          {selectedDisaster && (
            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5 mb-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm font-semibold text-primary uppercase tracking-[0.24em]">Selected disaster</p>
                  <h3 className="text-xl font-bold text-on-surface mt-2 tracking-tight">{selectedDisaster.title}</h3>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  selectedDisaster.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-700'
                    : selectedDisaster.status === 'REJECTED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {selectedDisaster.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs text-on-surface-variant uppercase tracking-[0.24em] mb-2">Location</p>
                  <p className="text-sm font-semibold text-on-surface">{selectedDisaster.location}</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs text-on-surface-variant uppercase tracking-[0.24em] mb-2">Severity</p>
                  <p className="text-sm font-semibold text-on-surface">{selectedDisaster.severity || 'MEDIUM'}</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs text-on-surface-variant uppercase tracking-[0.24em] mb-2">Reported</p>
                  <p className="text-sm font-semibold text-on-surface">{new Date(selectedDisaster.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              {selectedDisaster.description && (
                <p className="mt-4 text-sm text-on-surface-variant leading-relaxed line-clamp-3">
                  {selectedDisaster.description}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-on-surface-variant tracking-tight">
              <ImageIcon className="w-4 h-4 text-primary" />
              Image URLs (optional)
            </label>
            
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border-2 border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="Paste image URL here..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImageUrl())}
                />
              </div>
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
              >
                Add
              </button>
            </div>

            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-surface-container-high rounded-2xl border-2 border-dashed border-outline-variant">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden bg-white border border-outline-variant group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImageUrl(idx)}
                      className="absolute top-1 right-1 bg-white/90 text-red-600 p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <AlertCircle className="w-4 h-4 rotate-45" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-outline-variant/30">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-xl hover:opacity-95 shadow-md disabled:opacity-50 font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Submit proposal
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/donor')}
              className="flex-1 sm:flex-initial border-2 border-outline-variant bg-surface-container-high px-8 py-3 rounded-xl font-semibold text-on-surface hover:bg-surface-dim"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </DonorLayout>
  );
};

export default DonorCreateCampaign;
