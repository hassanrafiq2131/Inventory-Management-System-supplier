import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { jsPDF } from 'jspdf';

type ReportType = 'inventory' | 'sales' | 'movement';

export const useReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();

  const generateReport = async (type: ReportType) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reports/${type}`, {
        headers: {
          Authorization: `Bearer ${auth?.currentUser?.accessToken}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reports/download/all', {
        headers: {
          Authorization: `Bearer ${auth?.currentUser?.accessToken}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      const doc = new jsPDF();
      
      // Add report content to PDF
      doc.setFontSize(16);
      doc.text('Inventory Management Report', 20, 20);
      
      // Add more content as needed
      
      doc.save('inventory-report.pdf');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download report');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    generateReport,
    downloadPDF
  };
};