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

export const invoiceApi = {
  getAll: () => api.get('/invoices'), // Get all invoices
  createFromOrder: (orderId: string) => api.post('/invoices', { orderId }), // Create an invoice from an approved order
  getById: (id: string) => api.get(`/invoices/${id}`), // Get a specific invoice by ID
  update: (id: string, data: any) => api.put(`/invoices/${id}`, data), // Update an invoice
  delete: (id: string) => api.delete(`/invoices/${id}`), // Delete an invoice
  updateStatus: (id: string, status: string) => api.put(`/invoices/${id}/status`, { status }), // Update invoice status
  getRecommendations: () => api.get('/invoices/recommendations'), // Get supplier recommendations
  download: (id: string) =>
    api.get(`/invoices/${id}/download`, { responseType: 'blob' }), 
};

export const stockRequestApi = {
  getAll: () => api.get('/stock-requests'),
  create: (data: { product: string; quantity: number }) => api.post('/stock-requests', data),
  update: (id: string, data: { status: 'approved' | 'rejected'; approvedBy?: string }) =>
    api.put(`/stock-requests/${id}`, data),
  delete: (id: string) => api.delete(`/stock-requests/${id}`),
};


export default api;