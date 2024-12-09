import { useState, useEffect } from 'react';
import { stockRequestApi } from '../services/api';
import { toast } from 'react-hot-toast';

export interface StockRequest {
  _id: string;
  product: {
    _id: string;
    name: string;
    sku: string;
    quantity: number;
    price: number;
  };
  quantity: number;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export const useStockRequests = () => {
  const [stockRequests, setStockRequests] = useState<StockRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all stock requests
  const fetchStockRequests = async () => {
    try {
      setLoading(true);
      const response = await stockRequestApi.getAll();
      setStockRequests(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stock requests');
      toast.error('Failed to fetch stock requests');
    } finally {
      setLoading(false);
    }
  };

  // Create a new stock request
  const createStockRequest = async (data: { product: string; quantity: number }) => {
    try {
      const response = await stockRequestApi.create(data);
      setStockRequests((prev) => [response.data, ...prev]);
      toast.success('Stock request created successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create stock request');
    }
  };

  // Approve or reject a stock request
  const updateStockRequest = async (id: string, data: { status: 'approved' | 'rejected'; approvedBy?: string }) => {
    try {
      const response = await stockRequestApi.update(id, data);
      setStockRequests((prev) =>
        prev.map((req) => (req._id === id ? { ...req, ...response.data } : req))
      );
      const action = data.status === 'approved' ? 'approved' : 'rejected';
      toast.success(`Stock request ${action} successfully`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update stock request');
    }
  };

  // Delete a stock request
  const deleteStockRequest = async (id: string) => {
    try {
      await stockRequestApi.delete(id);
      setStockRequests((prev) => prev.filter((req) => req._id !== id));
      toast.success('Stock request deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete stock request');
    }
  };

  useEffect(() => {
    fetchStockRequests();
  }, []);

  return {
    stockRequests,
    loading,
    error,
    fetchStockRequests,
    createStockRequest,
    updateStockRequest,
    deleteStockRequest,
  };
};
