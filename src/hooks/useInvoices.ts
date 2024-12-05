import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { invoiceApi } from "../services/api";

export interface Invoice {
  _id: string;
  number: string;
  supplier: {
    _id: string;
    name: string;
  };
  date: string;
  amount: number;
  status: "pending" | "paid" | "overdue";
}

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceApi.getAll(); // Fetch invoices using invoiceApi
      setInvoices(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  const getSupplierRecommendations = async () => {
    try {
      const response = await invoiceApi.getRecommendations(); // Fetch recommendations using invoiceApi
      return response.data;
    } catch (err) {
      console.error("Failed to get supplier recommendations:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to get supplier recommendations"
      );
      throw err;
    }
  };

  useEffect(() => {
    fetchInvoices(); // Fetch invoices when the hook is first used
  }, []);

  return {
    invoices,
    loading,
    error,
    getSupplierRecommendations,
    refreshInvoices: fetchInvoices, // Provide a method to refresh the invoices
  };
};
