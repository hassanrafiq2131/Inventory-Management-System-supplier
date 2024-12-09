import { useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { toast } from 'react-hot-toast';

interface User {
  _id: string;
  email: string;
  role: 'admin' | 'manager';
  isApproved: boolean;
//   accessToken: string; // Add accessToken property
}

interface AuthState {
  user: User | null;
  token: string | null;
}

export const useAuth = () => {
  const [auth, setAuth] = useState<AuthState>(() => ({
    user: null,
    token: localStorage.getItem('token')
  }));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authApi.login({ email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setAuth({ user, token });
      setError(null);
      toast.success('Logged in successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to login';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      await authApi.register({ email, password });
      setError(null);
      toast.success('Registration successful. Please wait for admin approval.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuth({ user: null, token: null });
    toast.success('Logged out successfully');
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      await authApi.forgotPassword(email);
      setError(null);
      toast.success('Password reset email sent');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Verify token and load user data
    const verifyAuth = async () => {
      if (auth.token) {
        try {
          // Add endpoint to verify token and get user data
          // const response = await authApi.verifyToken();
          // setAuth({ user: response.data, token: auth.token });
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  return {
    user: auth.user,
    token: auth.token,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword
  };
};