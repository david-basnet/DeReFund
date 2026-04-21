const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const publicFetch = async (endpoint) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Invalid response from server');
  }
  if (!response.ok && !data.success) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

export const publicAPI = {
  impactStats: () => publicFetch('/campaigns/public/stats'),
  getCampaigns: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return publicFetch(`/campaigns/public${queryString ? `?${queryString}` : ''}`);
  },
  getCampaign: (campaignId) => publicFetch(`/campaigns/public/${campaignId}`),
  getVerifiedNgos: () => publicFetch('/campaigns/public/verified-ngos'),
  getEthPrice: async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const data = await response.json();
      return data.ethereum.usd;
    } catch (error) {
      console.error('Failed to fetch ETH price:', error);
      return 2500; // Fallback price
    }
  },
};

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    let data;
    try {
      data = await response.json();
    } catch {
      // If JSON parsing fails, but status is ok, it might be empty response
      if (response.ok) {
        return { success: true, message: 'Request successful', data: null };
      }
      throw new Error('Invalid response from server');
    }

    // Check if response is ok (status 200-299) OR if success is true in response body
    // This handles cases where backend returns 201 with success: true
    if (!response.ok && !data.success) {
      // Create error with detailed validation messages
      const errorMessage = data.message || data.error || 'API request failed';
      const error = new Error(errorMessage);
      // Attach validation errors if available
      if (data.errors && Array.isArray(data.errors)) {
        error.errors = data.errors;
        const messages = data.errors.map((err) => err.msg || err.message).filter(Boolean);
        if (messages.length) {
          error.message = `${error.message}: ${messages.join('; ')}`;
        }
      }
      // Attach full response data for debugging
      error.response = { data };
      throw error;
    }

    // Return data - it's a successful operation (either response.ok or data.success is true)
    return data;
  } catch (error) {
    console.error('API Error:', error);
    // If it's a JSON parse error, the response might still be successful
    if (error instanceof SyntaxError) {
      console.warn('JSON parse error, but request might have succeeded');
    }
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: (userData) => apiCall('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  verifyRegistration: (data) => apiCall('/auth/register/verify', { method: 'POST', body: JSON.stringify(data) }),
  login: (credentials) => apiCall('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  requestPasswordReset: (data) => apiCall('/auth/password/forgot', { method: 'POST', body: JSON.stringify(data) }),
  resetPassword: (data) => apiCall('/auth/password/reset', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => apiCall('/auth/me'),
  updateProfile: (updates) => apiCall('/auth/profile', { method: 'PATCH', body: JSON.stringify(updates) }),
  changePassword: (data) => apiCall('/auth/password', { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAccount: (password) => apiCall('/auth/account', { method: 'DELETE', body: JSON.stringify({ password }) }),
};

// Disaster API
export const disasterAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/disasters${queryString ? `?${queryString}` : ''}`);
  },
  getMyDisasters: (submittedBy, params = {}) => {
    const query = { ...params, submitted_by: submittedBy };
    const queryString = new URLSearchParams(query).toString();
    return apiCall(`/disasters${queryString ? `?${queryString}` : ''}`);
  },
  getById: (caseId) => apiCall(`/disasters/${caseId}`),
  create: (disasterData) => apiCall('/disasters', { method: 'POST', body: JSON.stringify(disasterData) }),
  update: (caseId, disasterData) => apiCall(`/disasters/${caseId}`, { method: 'PATCH', body: JSON.stringify(disasterData) }),
  delete: (caseId) => apiCall(`/disasters/${caseId}`, { method: 'DELETE' }),
  requestApproval: (caseId) => apiCall(`/disasters/${caseId}/request-approval`, { method: 'PATCH' }),
  updateStatus: (caseId, status) => apiCall(`/disasters/${caseId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

// Campaign API
export const campaignAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/campaigns${queryString ? `?${queryString}` : ''}`);
  },
  getById: (campaignId) => apiCall(`/campaigns/${campaignId}`),
  create: (campaignData) => apiCall('/campaigns', { method: 'POST', body: JSON.stringify(campaignData) }),
  createDonorProposal: (campaignData) =>
    apiCall('/campaigns/donor-proposal', { method: 'POST', body: JSON.stringify(campaignData) }),
  ngoConfirm: (campaignId, approved) =>
    apiCall(`/campaigns/${campaignId}/ngo-confirm`, {
      method: 'PATCH',
      body: JSON.stringify({ approved }),
    }),
  update: (campaignId, updates) => apiCall(`/campaigns/${campaignId}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  delete: (campaignId) => apiCall(`/campaigns/${campaignId}`, { method: 'DELETE' }),
};

// Donation API
export const donationAPI = {
  create: (donationData) => apiCall('/donations', { method: 'POST', body: JSON.stringify(donationData) }),
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return publicFetch(`/donations/all${queryString ? `?${queryString}` : ''}`);
  },
  getByCampaign: (campaignId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/donations/campaign/${campaignId}${queryString ? `?${queryString}` : ''}`);
  },
  getMyDonations: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/donations/my-donations${queryString ? `?${queryString}` : ''}`);
  },
  getById: (donationId) => apiCall(`/donations/${donationId}`),
};

// Milestone API
export const milestoneAPI = {
  getByCampaign: (campaignId) => apiCall(`/milestones/campaign/${campaignId}`),
  getById: (milestoneId) => apiCall(`/milestones/${milestoneId}`),
  create: (milestoneData) => apiCall('/milestones', { method: 'POST', body: JSON.stringify(milestoneData) }),
  submitProof: (milestoneId, data) => apiCall(`/milestones/${milestoneId}/proof`, { method: 'PATCH', body: JSON.stringify(data) }),
  updateStatus: (milestoneId, status) => apiCall(`/milestones/${milestoneId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  delete: (milestoneId) => apiCall(`/milestones/${milestoneId}`, { method: 'DELETE' }),
};

// Admin API
export const adminAPI = {
  getAllUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/admin/users${queryString ? `?${queryString}` : ''}`);
  },
  verifyUser: (userId, data) => apiCall(`/admin/verify-user/${userId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteUser: (userId) => apiCall(`/admin/users/${userId}`, { method: 'DELETE' }),
  getAdminLogs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/admin/logs${queryString ? `?${queryString}` : ''}`);
  },
  getCampaignsPendingApproval: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/admin/campaigns/pending${queryString ? `?${queryString}` : ''}`);
  },
  approveCampaign: (campaignId, data) => apiCall(`/admin/campaigns/${campaignId}/approve`, { method: 'PATCH', body: JSON.stringify(data) }),
  getSubmittedMilestones: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/admin/milestones/submitted${queryString ? `?${queryString}` : ''}`);
  },
  releaseMilestone: (milestoneId) => apiCall(`/admin/milestones/${milestoneId}/release`, { method: 'PATCH' }),
  getDashboardStats: () => apiCall('/admin/dashboard/stats'),
};

// Volunteer Verification API
export const volunteerVerificationAPI = {
  getPendingCampaigns: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/volunteer-verification/pending${queryString ? `?${queryString}` : ''}`);
  },
  getCampaignVerificationStatus: (campaignId) => apiCall(`/volunteer-verification/campaign/${campaignId}`),
  verifyCampaign: (campaignId) => apiCall(`/volunteer-verification/campaign/${campaignId}/verify`, { method: 'POST' }),
  unverifyCampaign: (campaignId) => apiCall(`/volunteer-verification/campaign/${campaignId}/verify`, { method: 'DELETE' }),
};

// Notification API
export const notificationAPI = {
  getAll: () => apiCall('/notifications'),
  markAsRead: (notificationId) => apiCall(`/notifications/${notificationId}/read`, { method: 'PATCH' }),
  delete: (notificationId) => apiCall(`/notifications/${notificationId}`, { method: 'DELETE' }),
};

// Upload API
export const uploadAPI = {
  uploadNGODocument: (formData) => {
    return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload/ngo/document`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    }).then(res => res.json());
  },
  getNGODocument: (userId) => {
    return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload/ngo/document/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  },
  uploadDisasterImages: (formData) => {
    return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload/disaster/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    }).then(res => res.json());
  },
};
