const API_BASE = '/api';

/**
 * Get headers including Authorization JWT if available
 */
const getHeaders = (isFormData = false) => {
  const headers = {};
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

/**
 * Helper to handle fetch responses
 */
const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const api = {
  // Auth
  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(res);
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  getProfile: async () => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  changePassword: async (passwords) => {
    const res = await fetch(`${API_BASE}/auth/password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(passwords)
    });
    return handleResponse(res);
  },

  getNotifications: async () => {
    const res = await fetch(`${API_BASE}/auth/notifications`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  markNotificationRead: async (id = 'all') => {
    const res = await fetch(`${API_BASE}/auth/notifications/${id}`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Public
  getPublicDepartments: async () => {
    const res = await fetch(`${API_BASE}/public/departments`);
    return handleResponse(res);
  },

  // Complaints
  submitComplaint: async (formData) => {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    return handleResponse(res);
  },

  trackComplaint: async (referenceId, token = '') => {
    const url = token 
      ? `${API_BASE}/complaints/track/${encodeURIComponent(referenceId)}?token=${encodeURIComponent(token)}`
      : `${API_BASE}/complaints/track/${encodeURIComponent(referenceId)}`;
    const res = await fetch(url, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getComplaints: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/complaints?${query}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getComplaintById: async (id) => {
    const res = await fetch(`${API_BASE}/complaints/${id}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  updateComplaintStatus: async (id, payload) => {
    const res = await fetch(`${API_BASE}/complaints/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  assignComplaint: async (id, payload) => {
    const res = await fetch(`${API_BASE}/complaints/${id}/assign`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  addComplaintUpdate: async (id, payload) => {
    const res = await fetch(`${API_BASE}/complaints/${id}/updates`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  escalateComplaint: async (id, payload) => {
    const res = await fetch(`${API_BASE}/complaints/${id}/escalate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // Admin
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getDepartments: async () => {
    const res = await fetch(`${API_BASE}/admin/departments`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  createDepartment: async (deptData) => {
    const res = await fetch(`${API_BASE}/admin/departments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(deptData)
    });
    return handleResponse(res);
  },

  updateDepartment: async (id, deptData) => {
    const res = await fetch(`${API_BASE}/admin/departments/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(deptData)
    });
    return handleResponse(res);
  },

  getRoutingRules: async () => {
    const res = await fetch(`${API_BASE}/admin/routing-rules`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  updateRoutingRule: async (ruleData) => {
    const res = await fetch(`${API_BASE}/admin/routing-rules`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(ruleData)
    });
    return handleResponse(res);
  },

  getUsers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/users?${query}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getAuditLogs: async () => {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getReports: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/reports?${query}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};
