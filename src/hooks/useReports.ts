import { useState } from 'react';
import { reportApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { generateReport, downloadPDF } from '../utils/reportGenerator';

export const useReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReportData = async (type: string, dateRange?: { start: Date; end: Date }) => {
    try {
      setLoading(true);
      const data = await generateReport(type, dateRange || { 
        start: new Date(new Date().setMonth(new Date().getMonth() - 1)), 
        end: new Date() 
      });
      setError(null);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate report';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const downloadReportPDF = async (reportData: any, type: string) => {
    try {
      setLoading(true);
      await downloadPDF(reportData, type);
      toast.success('Report downloaded successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download report';
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    generateReport: generateReportData,
    downloadPDF: downloadReportPDF
  };
};