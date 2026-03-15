import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { disasterAPI, uploadAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import DonorLayout from '../../components/DonorLayout';
import { AlertTriangle, MapPin, Upload, Video, X, Loader2, Image as ImageIcon } from 'lucide-react';

const ReportDisaster = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
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
  }, []);

  // Cleanup: Revoke object URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      uploadedFiles.forEach(fileObj => {
        if (fileObj.preview) {
          URL.revokeObjectURL(fileObj.preview);
        }
      });
    };
  }, [uploadedFiles]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      setError('Please select valid image files');
      return;
    }

    // Check file sizes (5MB limit)
    const oversizedFiles = imageFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('Some files exceed 5MB limit. Please select smaller files.');
      return;
    }

    // Check total files (max 10)
    if (uploadedFiles.length + imageFiles.length > 10) {
      setError('Maximum 10 images allowed. Please remove some images first.');
      return;
    }

    // Create preview URLs
    const newFiles = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setError('');
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    setUploadedFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      // Revoke object URL to free memory
      URL.revokeObjectURL(prev[index].preview);
      return newFiles;
    });
  };

  const handleAddImageUrl = () => {
    if (imageInput.trim()) {
      // Basic URL validation
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

  const uploadImagesToServer = async () => {
    if (uploadedFiles.length === 0) return [];

    setUploadingImages(true);
    try {
      const formData = new FormData();
      uploadedFiles.forEach((fileObj) => {
        formData.append('images', fileObj.file);
      });

      const response = await uploadAPI.uploadDisasterImages(formData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to upload images');
      }

      // For now, we'll create the disaster first, then upload images
      // Return empty array as images will be uploaded after disaster creation
      return [];
    } catch (err) {
      throw new Error(err.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Frontend validation
    if (!formData.title.trim() || formData.title.trim().length < 5) {
      setError('Title must be at least 5 characters long');
      setLoading(false);
      return;
    }

    if (!formData.description.trim() || formData.description.trim().length < 20) {
      setError('Description must be at least 20 characters long');
      setLoading(false);
      return;
    }

    if (!formData.location.trim() || formData.location.trim().length < 3) {
      setError('Location must be at least 3 characters long');
      setLoading(false);
      return;
    }

    if (formData.latitude && (isNaN(parseFloat(formData.latitude)) || parseFloat(formData.latitude) < -90 || parseFloat(formData.latitude) > 90)) {
      setError('Latitude must be a number between -90 and 90');
      setLoading(false);
      return;
    }

    if (formData.longitude && (isNaN(parseFloat(formData.longitude)) || parseFloat(formData.longitude) < -180 || parseFloat(formData.longitude) > 180)) {
      setError('Longitude must be a number between -180 and 180');
      setLoading(false);
      return;
    }

    try {
      // Step 1: Create disaster first (without uploaded files)
      const disasterData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        severity: formData.severity,
        ...(formData.latitude && formData.longitude && {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        }),
        ...(formData.images.length > 0 && { images: formData.images }),
        ...(formData.video && { video: formData.video.trim() }),
      };

      const createResponse = await disasterAPI.create(disasterData);
      
      if (!createResponse.success) {
        throw new Error(createResponse.message || 'Failed to create disaster');
      }

      const caseId = createResponse.data?.disaster?.case_id;

      // Step 2: Upload image files if any
      if (uploadedFiles.length > 0 && caseId) {
        try {
          const formDataUpload = new FormData();
          uploadedFiles.forEach((fileObj) => {
            formDataUpload.append('images', fileObj.file);
          });
          formDataUpload.append('case_id', caseId);

          const uploadResponse = await uploadAPI.uploadDisasterImages(formDataUpload);
          
          if (!uploadResponse.success) {
            console.warn('Images upload failed:', uploadResponse.message);
            // Don't fail the whole operation if image upload fails
          }
        } catch (uploadErr) {
          console.warn('Error uploading images:', uploadErr);
          // Continue even if image upload fails
        }
      }

      navigate('/donor');
    } catch (err) {
      const errorMessage = err.message || 'Failed to report disaster. Please try again.';
      setError(errorMessage);
      console.error('Disaster creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <DonorLayout>
        <div className="p-6 lg:p-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-black mb-4 font-playfair tracking-tight">Please Log In</h2>
            <p className="text-gray-800 font-dmsans tracking-tight">You need to be logged in to report a disaster.</p>
          </div>
        </div>
      </DonorLayout>
    );
  }

  return (
    <DonorLayout>
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-black mb-2 font-playfair tracking-tight">Create Disaster Report</h1>
                <p className="text-gray-700 font-dmsans tracking-tight">
                  Report a disaster case that needs immediate attention and relief efforts.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-xl mb-6 font-dmsans tracking-tight">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-black mb-2 font-dmsans tracking-tight">
                Disaster Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-dmsans tracking-tight"
                placeholder="e.g., Flood in Mumbai"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-black mb-2 font-dmsans tracking-tight">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-dmsans tracking-tight"
                placeholder="Describe the disaster situation, affected areas, immediate needs, and any other relevant details..."
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-bold text-black mb-2 font-dmsans tracking-tight">
                Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-dmsans tracking-tight"
                  placeholder="e.g., Mumbai, Maharashtra, India"
                  required
                />
              </div>
            </div>

            {/* Coordinates */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2 font-dmsans tracking-tight">
                  Latitude (Optional)
                </label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  step="any"
                  className="w-full px-4 py-3 border-2 border-gray rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-dmsans tracking-tight"
                  placeholder="e.g., 19.0760"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-2 font-dmsans tracking-tight">
                  Longitude (Optional)
                </label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  step="any"
                  className="w-full px-4 py-3 border-2 border-gray rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-dmsans tracking-tight"
                  placeholder="e.g., 72.8777"
                />
              </div>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-bold text-black mb-2 font-dmsans tracking-tight">
                Severity *
              </label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-dmsans tracking-tight appearance-none bg-white"
                required
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            {/* Images - File Upload */}
            <div>
              <label className="block text-sm font-bold text-black mb-2 font-dmsans tracking-tight">
                Images (Optional)
              </label>
              <p className="text-xs text-gray-600 mb-3 font-dmsans tracking-tight">
                Upload up to 10 images (max 5MB each). Supported formats: JPEG, PNG, GIF, WEBP
              </p>
              
              {/* File Upload Section */}
              <div className="mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all font-dmsans tracking-tight"
                >
                  <Upload className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-600 font-semibold font-dmsans tracking-tight">
                    {uploadingImages ? 'Uploading...' : 'Click to Upload Images'}
                  </span>
                </label>
              </div>

              {/* Uploaded Files Preview */}
              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                  {uploadedFiles.map((fileObj, index) => (
                    <div key={index} className="relative group bg-gray-50 rounded-lg overflow-hidden border-2 border-gray">
                      <img
                        src={fileObj.preview}
                        alt={fileObj.name}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-2">
                        <p className="text-xs text-gray-700 truncate font-dmsans tracking-tight" title={fileObj.name}>
                          {fileObj.name}
                        </p>
                        <p className="text-xs text-gray-500 font-dmsans tracking-tight">
                          {(fileObj.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Image URLs Section */}
              <div className="mt-4">
                <p className="text-xs text-gray-600 mb-2 font-dmsans tracking-tight">
                  Or add image URLs:
                </p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="url"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImageUrl();
                      }
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-dmsans tracking-tight"
                    placeholder="Enter image URL and press Enter"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold font-dmsans tracking-tight"
                  >
                    Add URL
                  </button>
                </div>
                {formData.images.length > 0 && (
                  <div className="space-y-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-2 border-gray">
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                          <img 
                            src={image} 
                            alt={`Image ${index + 1}`} 
                            className="w-full h-full object-cover"
                            onError={(e) => { 
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }} 
                          />
                          <ImageIcon className="w-8 h-8 text-gray-400 hidden" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 truncate font-dmsans tracking-tight">{image}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImageUrl(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Video */}
            <div>
              <label className="block text-sm font-bold text-black mb-2 font-dmsans tracking-tight">
                Video URL (Optional)
              </label>
              <div className="relative">
                <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
                <input
                  type="url"
                  name="video"
                  value={formData.video}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-dmsans tracking-tight"
                  placeholder="https://example.com/video.mp4"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-900 font-dmsans tracking-tight">
                <strong>Note:</strong> Your disaster report will be reviewed by administrators before being published. 
                Please provide accurate and detailed information. Once approved, NGOs can create campaigns linked to this disaster.
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || uploadingImages}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold font-dmsans tracking-tight flex items-center justify-center gap-2"
              >
                {loading || uploadingImages ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {uploadingImages ? 'Uploading Images...' : 'Submitting...'}
                  </>
                ) : (
                  'Submit Disaster Report'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/donor')}
                className="px-6 py-3 bg-gray-200 text-black rounded-xl hover:bg-gray-300 transition-colors font-bold font-dmsans tracking-tight"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </DonorLayout>
  );
};

export default ReportDisaster;
