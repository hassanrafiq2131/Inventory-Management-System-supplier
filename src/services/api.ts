import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { app } from '../config/firebase';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add request interceptor to include Firebase token
api.interceptors.request.use(async (config) => {
  try {
    const auth = getAuth(app);
    const user = auth.currentUser;
    
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error getting Firebase token:', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or logout if needed
      const auth = getAuth(app);
      if (auth.currentUser) {
        try {
          const newToken = await auth.currentUser.getIdToken(true);
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return api.request(error.config);
        } catch (refreshError) {
          // If token refresh fails, sign out the user
          await auth.signOut();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const productApi = {
  getAll: () => api.get('/inventory'),
  create: (data: any) => api.post('/inventory', data),
  update: (id: string, data: any) => api.put(`/inventory/${id}`, data),
  delete: (id: string) => api.delete(`/inventory/${id}`),
  getLowStock: () => api.get('/inventory/low-stock'),
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/inventory/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const orderApi = {
  getAll: () => api.get('/orders'),
  create: (data: any) => api.post('/orders', data),
  update: (id: string, data: any) => api.put(`/orders/${id}`, data),
  delete: (id: string) => api.delete(`/orders/${id}`),
  updateStatus: (id: string, status: string) => api.put(`/orders/${id}/status`, { status })
};

export const reportApi = {
  getInventory: () => api.get('/reports/inventory'),
  getSales: () => api.get('/reports/sales'),
  getMovement: () => api.get('/reports/movement'),
  downloadReport: (type: string) => api.get(`/reports/download/${type}`, { responseType: 'blob' })
};

export const authApi = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
  sync: () => api.get('/auth/sync')
};

export default api;