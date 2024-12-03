import { useState, useEffect } from 'react';
import { productApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
  reorderPoint: number;
  createdAt: string;
  updatedAt: string;
}

export const useInventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Only fetch if user is authenticated
      if (auth.currentUser) {
        const response = await productApi.getAll();
        setProducts(response.data);
        setError(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getLowStockProducts = async () => {
    try {
      const response = await productApi.getLowStock();
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch low stock products';
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      fetchProducts();
    }
  }, [auth.currentUser]); // Re-fetch when auth state changes

  return {
    products,
    loading,
    error,
    refreshProducts: fetchProducts,
    getLowStockProducts
  };
};