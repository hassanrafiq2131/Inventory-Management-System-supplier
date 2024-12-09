import { useState, useEffect } from 'react';
import { suppliersInventoryApi } from '../services/api'; // Import the SupplierInventory API
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export interface SupplierInventory {
  _id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
  reorderPoint: number;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
}

export const useSupplierInventory = () => {
  const [items, setItems] = useState<SupplierInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();

  const fetchItems = async () => {
    try {
      setLoading(true);
      // Only fetch if user is authenticated
      if (auth.currentUser) {
        const response = await suppliersInventoryApi.getAll();
        setItems(response.data);
        setError(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch supplier inventory items';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (data: Omit<SupplierInventory, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await suppliersInventoryApi.create(data);
      setItems((prevItems) => [...prevItems, response.data]);
      toast.success('Item created successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create item';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateItem = async (id: string, data: Partial<SupplierInventory>) => {
    try {
      const response = await suppliersInventoryApi.update(id, data);
      setItems((prevItems) =>
        prevItems.map((item) => (item._id === id ? response.data : item))
      );
      toast.success('Item updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item';
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await suppliersInventoryApi.delete(id);
      setItems((prevItems) => prevItems.filter((item) => item._id !== id));
      toast.success('Item deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete item';
      toast.error(errorMessage);
      throw err;
    }
  };

  const getLowStockItems = async () => {
    try {
      const response = await suppliersInventoryApi.getLowStock();
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch low stock items';
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      fetchItems();
    }
  }, [auth.currentUser]); // Re-fetch when auth state changes

  return {
    items,
    loading,
    error,
    refreshItems: fetchItems,
    createItem,
    updateItem,
    deleteItem,
    getLowStockItems,
  };
};
