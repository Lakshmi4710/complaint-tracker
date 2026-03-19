import axios from 'axios';

// ✅ Use environment variable (fallback for safety)
const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://complaint-tracker-backend-w7tr.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  createAdmin: (userData) => api.post('/auth/create-admin', userData),
};

// Complaint API
export const complaintAPI = {
  createComplaint: (complaintData) => api.post('/complaints', complaintData),
  getAllComplaints: (params) => api.get('/complaints', { params }),
  getComplaint: (id) => api.get(`/complaints/${id}`),
  updateComplaint: (id, updates) => api.put(`/complaints/${id}`, updates),
  deleteComplaint: (id) => api.delete(`/complaints/${id}`),
  getStats: () => api.get('/complaints/stats'),
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  changePassword: (data) => api.put('/profile/change-password', data),
};

export default api;