import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Calendar, BarChart2, PieChart } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Reports = () => {
  const [dateRange, setDateRange] = useState('week');
  const { generateReport, downloadPDF, loading } = useReports();

  const reportTypes = [
    { id: 'inventory', title: 'Inventory Status', icon: BarChart2 },
    { id: 'sales', title: 'Sales Analysis', icon: PieChart },
    { id: 'movement', title: 'Stock Movement', icon: Calendar }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <button
            onClick={() => downloadPDF()}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportTypes.map((report) => (
          <motion.div
            key={report.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <report.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
              </div>
              <button
                onClick={() => generateReport(report.id)}
                className="text-blue-600 hover:text-blue-800"
              >
                Generate
              </button>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#3B82F6" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Report Details Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Analysis</h2>
        {/* Report details would go here */}
      </div>
    </motion.div>
  );
};

export default Reports;