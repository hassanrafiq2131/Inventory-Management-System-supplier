import { useState, useEffect } from 'react';
import { orderApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export interface OrderItem {
  product: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Only fetch if user is authenticated
      if (auth.currentUser) {
        const response = await orderApi.getAll();
        setOrders(response.data);
        setError(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      if (auth.currentUser) {
        await orderApi.updateStatus(orderId, status);
        await fetchOrders();
        toast.success('Order status updated successfully');
      } else {
        toast.error('User is not authenticated');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order status';
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      fetchOrders();
    }
  }, [auth.currentUser]); // Re-fetch when auth state changes

  return {
    orders,
    loading,
    error,
    refreshOrders: fetchOrders,
    updateOrderStatus,
  };
};
