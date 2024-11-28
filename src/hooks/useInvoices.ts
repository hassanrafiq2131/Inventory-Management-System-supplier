import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Invoice {
  _id: string;
  number: string;
  supplier: {
    _id: string;
    name: string;
  };
  date: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
}

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices', {
        headers: {
          Authorization: `Bearer ${auth?.currentUser?.accessToken}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setInvoices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const getSupplierRecommendations = async () => {
    try {
      const response = await fetch('/api/invoices/recommendations', {
        headers: {
          Authorization: `Bearer ${auth?.currentUser?.accessToken}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get recommendations');
      throw err;
    }
  };

  useEffect(() => {
    if (auth?.currentUser) {
      fetchInvoices();
    }
  }, [auth?.currentUser]);

  return {
    invoices,
    loading,
    error,
    getSupplierRecommendations,
    refreshInvoices: fetchInvoices
  };
};