const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const apiEndpoints = {
  // Admin endpoints
  admin: {
    users: `${API_BASE_URL}/api/admin/users`,
    userById: (id) => `${API_BASE_URL}/api/admin/users/${id}`,
    userStatus: (id) => `${API_BASE_URL}/api/admin/users/${id}/status`,
    stats: `${API_BASE_URL}/api/admin/stats`,
  },
  // Auth endpoints
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
    verify: `${API_BASE_URL}/api/auth/verify`,
  },
  // Health check
  health: `${API_BASE_URL}/api/health`,
};

export default API_BASE_URL;