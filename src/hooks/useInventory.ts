import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
  reorderPoint: number;
}

export const useInventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/inventory', {
        headers: {
          Authorization: `Bearer ${auth?.currentUser?.accessToken}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: Omit<Product, '_id'>) => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth?.currentUser?.accessToken}`
        },
        body: JSON.stringify(productData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setProducts([...products, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product');
      throw err;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth?.currentUser?.accessToken}`
        },
        body: JSON.stringify(productData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setProducts(products.map(p => p._id === id ? { ...p, ...data } : p));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${auth?.currentUser?.accessToken}`
        }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      throw err;
    }
  };

  useEffect(() => {
    if (auth?.currentUser) {
      fetchProducts();
    }
  }, [auth?.currentUser]);

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts: fetchProducts
  };
};