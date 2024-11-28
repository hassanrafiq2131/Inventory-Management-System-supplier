import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface OrderItem {
  product: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: {
          Authorization: `Bearer ${auth?.currentUser?.accessToken}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: Omit<Order, '_id' | 'orderNumber' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth?.currentUser?.accessToken}`
        },
        body: JSON.stringify(orderData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setOrders([...orders, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      throw err;
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      const response = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth?.currentUser?.accessToken}`
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setOrders(orders.map(o => o._id === id ? { ...o, status: data.status } : o));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
      throw err;
    }
  };

  useEffect(() => {
    if (auth?.currentUser) {
      fetchOrders();
    }
  }, [auth?.currentUser]);

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus,
    refreshOrders: fetchOrders
  };
};