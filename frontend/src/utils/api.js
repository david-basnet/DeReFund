const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
      const error = new Error(data.message || data.error || 'API request failed');
      // Attach validation errors if available
      if (data.errors && Array.isArray(data.errors)) {
        error.errors = data.errors;
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
  login: (credentials) => apiCall('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
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
  getById: (caseId) => apiCall(`/disasters/${caseId}`),
  create: (disasterData) => apiCall('/disasters', { method: 'POST', body: JSON.stringify(disasterData) }),
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
  update: (campaignId, updates) => apiCall(`/campaigns/${campaignId}`, { method: 'PATCH', body: JSON.stringify(updates) }),
};

// Donation API
export const donationAPI = {
  create: (donationData) => apiCall('/donations', { method: 'POST', body: JSON.stringify(donationData) }),
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
  updateStatus: (milestoneId, status) => apiCall(`/milestones/${milestoneId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
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
