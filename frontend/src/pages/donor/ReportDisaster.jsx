import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { disasterAPI, uploadAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import DonorLayout from '../../components/DonorLayout';
import { 
  AlertTriangle, 
  MapPin, 
  Upload, 
  Video,
  ShieldCheck,
  X, 
  Loader2, 
  Plus, 
  List, 
  Edit2, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ReportDisaster = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // View states: 'list', 'create', 'edit'
  const [view, setView] = useState('list');
  const [loading, setLoading] = useState(false);
  const [disasters, setDisasters] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    severity: 'MEDIUM',
    latitude: '',
    longitude: '',
    images: [],
    video: '',
  });
  
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [imageInput, setImageInput] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (view === 'list') {
      fetchMyDisasters();
    }
  }, [view]);

  const fetchMyDisasters = async () => {
    try {
      setLoading(true);
      const response = await disasterAPI.getAll({ submitted_by: user.user_id });
      setDisasters(response.data?.disasters || []);
    } catch (err) {
      console.error('Error fetching disasters:', err);
      toast.error('Failed to load your disaster cases');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      severity: 'MEDIUM',
      latitude: '',
      longitude: '',
      images: [],
      video: '',
    });
    setUploadedFiles([]);
    setError('');
    setView('create');
  };

  const handleEdit = (disaster) => {
    if (disaster.campaign_id) {
      toast.error('Cannot edit disaster already linked to a campaign');
      return;
    }
    setFormData({
      title: disaster.title,
      description: disaster.description,
      location: disaster.location,
      severity: disaster.severity,
      latitude: disaster.latitude || '',
      longitude: disaster.longitude || '',
      images: disaster.images || [],
      video: disaster.video || '',
    });
    setEditingId(disaster.case_id);
    setUploadedFiles([]);
    setError('');
    setView('edit');
  };

  const handleRequestApproval = async (caseId) => {
    try {
      setLoading(true);
      await disasterAPI.requestApproval(caseId);
      toast.success('Disaster case submitted for admin approval');
      fetchMyDisasters();
    } catch (err) {
      console.error('Error requesting approval:', err);
      toast.error(err.message || 'Failed to submit for approval');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (caseId, campaignId) => {
    if (campaignId) {
      toast.error('Cannot delete disaster already linked to a campaign');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this disaster case?')) return;

    try {
      setLoading(true);
      await disasterAPI.delete(caseId);
      toast.success('Disaster case deleted successfully');
      fetchMyDisasters();
    } catch (err) {
      console.error('Error deleting disaster:', err);
      toast.error(err.message || 'Failed to delete disaster case');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      setError('Please select valid image files');
      return;
    }

    const oversizedFiles = imageFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('Some files exceed 5MB limit. Please select smaller files.');
      return;
    }

    if (uploadedFiles.length + imageFiles.length > 10) {
      setError('Maximum 10 images allowed.');
      return;
    }

    const newFiles = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (index) => {
    setUploadedFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index].preview);
      return newFiles;
    });
  };

  const handleAddImageUrl = () => {
    if (imageInput.trim()) {
      try {
        new URL(imageInput.trim());
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, imageInput.trim()]
        }));
        setImageInput('');
        setError('');
      } catch {
        setError('Please enter a valid image URL');
      }
    }
  };

  const handleRemoveImageUrl = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (formData.title.length < 5) {
      setError('Title must be at least 5 characters');
      setLoading(false);
      return;
    }

    try {
      const disasterData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        severity: formData.severity,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        images: formData.images,
        video: formData.video.trim() || null,
      };

      let response;
      if (view === 'edit') {
        response = await disasterAPI.update(editingId, disasterData);
      } else {
        response = await disasterAPI.create(disasterData);
      }
      
      if (response.success) {
        const caseId = response.data?.disaster?.case_id || editingId;
        
        if (uploadedFiles.length > 0 && caseId) {
          const formDataUpload = new FormData();
          uploadedFiles.forEach((fileObj) => {
            formDataUpload.append('images', fileObj.file);
          });
          formDataUpload.append('case_id', caseId);
          await uploadAPI.uploadDisasterImages(formDataUpload);
        }

        toast.success(view === 'edit' ? 'Disaster case updated!' : 'Disaster case reported!');
        setView('list');
      }
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
          <CheckCircle2 className="w-3 h-3" /> Approved
        </span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3" /> Rejected
        </span>;
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <Clock className="w-3 h-3" /> Pending Approval
        </span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
          <Edit2 className="w-3 h-3" /> Draft
        </span>;
    }
  };

  if (!user) {
    return (
      <DonorLayout>
        <div className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-gray-600">Please log in to manage disaster cases.</p>
        </div>
      </DonorLayout>
    );
  }

  return (
    <DonorLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-8 h-8 text-primary" />
              Disaster Management
            </h1>
            <p className="text-slate-500 mt-1">
              {view === 'list' ? 'View and manage your reported disaster cases' : 
               view === 'edit' ? 'Update your disaster report details' : 
               'Report a new disaster case for relief efforts'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {view === 'list' ? (
              <button 
                onClick={handleCreateNew}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black border border-black rounded-xl font-semibold shadow-sm hover:bg-slate-50 transition-all"
              >
                <Plus className="w-4 h-4" /> Report New Disaster
              </button>
            ) : (
              <button 
                onClick={() => setView('list')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all"
              >
                <List className="w-4 h-4" /> Back to List
              </button>
            )}
          </div>
        </div>

        {view === 'list' ? (
          /* List View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-slate-500">Loading disaster cases...</p>
              </div>
            ) : disasters.length === 0 ? (
              <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-6">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No disasters reported yet</h3>
                <p className="text-slate-500 mt-2 max-w-xs">
                  Start by reporting a disaster situation in your area to initiate relief efforts.
                </p>
                <button 
                  onClick={handleCreateNew}
                  className="mt-6 text-primary font-bold hover:underline flex items-center gap-1"
                >
                  Report your first disaster <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              disasters.map((disaster) => (
                <div key={disaster.case_id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group hover:shadow-md transition-all">
                  <div className="aspect-video bg-slate-100 relative overflow-hidden">
                    {disaster.images?.[0] ? (
                      <img src={disaster.images[0]} alt={disaster.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Upload className="w-8 h-8 opacity-20" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      {getStatusBadge(disaster.status)}
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-slate-900 leading-tight line-clamp-2">
                        {disaster.title}
                      </h3>
                      <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        disaster.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        disaster.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {disaster.severity}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-4">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{disaster.location}</span>
                    </div>

                    <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-1">
                      {disaster.description}
                    </p>

                    {(!disaster.status || disaster.status === 'DRAFT' || disaster.status === 'draft') && (
                      <button
                        onClick={() => handleRequestApproval(disaster.case_id)}
                        className="w-full mb-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        Send for Admin Approval
                      </button>
                    )}

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEdit(disaster)}
                          disabled={disaster.campaign_id}
                          className={`p-2 rounded-lg transition-colors ${
                            disaster.campaign_id 
                            ? 'text-slate-300 cursor-not-allowed' 
                            : 'text-blue-600 hover:bg-blue-50'
                          }`}
                          title={disaster.campaign_id ? 'Linked to campaign - cannot edit' : 'Edit report'}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(disaster.case_id, disaster.campaign_id)}
                          disabled={disaster.campaign_id}
                          className={`p-2 rounded-lg transition-colors ${
                            disaster.campaign_id 
                            ? 'text-slate-300 cursor-not-allowed' 
                            : 'text-red-600 hover:bg-red-50'
                          }`}
                          title={disaster.campaign_id ? 'Linked to campaign - cannot delete' : 'Delete report'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {disaster.campaign_id && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                          CAMPAIGN ACTIVE
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Create/Edit Form */
          <div className="max-w-4xl mx-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Disaster Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="e.g., Severe Flooding in Downtown Area"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                    placeholder="Provide detailed information about the situation, affected people, and urgent requirements..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Location *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="City, State, Country"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Severity Level *</label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Latitude</label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    step="any"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="e.g., 19.0760"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Longitude</label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    step="any"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="e.g., 72.8777"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Video Link (YouTube/Vimeo)</label>
                  <div className="relative">
                    <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      name="video"
                      value={formData.video}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>

                <div className="md:col-span-2 border-t border-slate-100 pt-6">
                  <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                    Visual Evidence & Documentation
                  </label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                    {/* Existing URL Images */}
                    {formData.images.map((url, idx) => (
                      <div key={`url-${idx}`} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => handleRemoveImageUrl(idx)}
                          className="absolute top-1 right-1 bg-white/90 text-red-600 p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    {/* Newly Uploaded Images */}
                    {uploadedFiles.map((file, idx) => (
                      <div key={`file-${idx}`} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 group">
                        <img src={file.preview} alt="" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-white/90 text-red-600 p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-primary hover:bg-slate-50 transition-all flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-primary"
                    >
                      <Plus className="w-6 h-6" />
                      <span className="text-[10px] font-bold">Upload</span>
                    </button>
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    multiple
                    accept="image/*"
                  />

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Paste image URL here..."
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all"
                    >
                      Add URL
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-8 flex items-center justify-end gap-4 border-t border-slate-100 mb-12">
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className="px-6 py-3 bg-white text-black border border-black rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-white text-black border border-black rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    view === 'edit' ? 'Update Report' : 'Submit Report'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DonorLayout>
  );
};

export default ReportDisaster;
