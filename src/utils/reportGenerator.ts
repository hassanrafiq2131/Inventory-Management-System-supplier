import { jsPDF } from 'jspdf';
import { reportApi } from '../services/api';

export const generateReport = async (type: string, dateRange: { start: Date; end: Date }) => {
  try {
    let data;
    switch (type) {
      case 'inventory':
        data = await reportApi.getInventory();
        break;
      case 'sales':
        data = await reportApi.getSales();
        break;
      case 'movement':
        data = await reportApi.getMovement();
        break;
      default:
        throw new Error('Invalid report type');
    }

    return data;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

export const downloadPDF = async (reportData: any, reportType: string) => {
  try {
    const response = await reportApi.downloadReport(reportType);
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportType}-report.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};