import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Calendar, BarChart2, PieChart } from "lucide-react";
import { reportApi } from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "react-hot-toast";

const Reports = () => {
  const [dateRange, setDateRange] = useState("week");
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const reportTypes = [
    { id: "inventory", title: "Inventory Status", icon: BarChart2 },
    { id: "sales", title: "Sales Analysis", icon: PieChart },
    { id: "movement", title: "Stock Movement", icon: Calendar },
  ];

  const generateReport = async (reportType) => {
    try {
      setLoading(true);
      let response;

      switch (reportType) {
        case "inventory":
          response = await reportApi.getInventory();
          const inventoryData = response.data.products.map((product) => ({
            name: product.name,
            value: product.quantity,
          }));
          setReportData({ ...reportData, inventory: inventoryData });
          break;

        case "sales":
          response = await reportApi.getSales();
          const salesByMonth = response.data.reduce((acc, order) => {
            const orderDate = new Date(order.createdAt);
            const month = `${orderDate.getFullYear()}-${(
              orderDate.getMonth() + 1
            )
              .toString()
              .padStart(2, "0")}`;

            acc[month] = (acc[month] || 0) + order.totalAmount;
            return acc;
          }, {});
          const salesChartData = Object.entries(salesByMonth).map(
            ([month, total]) => ({
              name: month,
              value: total,
            })
          );
          setReportData({ ...reportData, sales: salesChartData });
          break;

        case "movement":
          response = await reportApi.getMovement();
          const movementData = response.data.map((movement) => ({
            name: new Date(movement.createdAt).toLocaleDateString(),
            value: movement.quantity,
          }));
          setReportData({ ...reportData, movement: movementData });
          break;

        default:
          throw new Error("Invalid report type");
      }

      toast.success(
        `${
          reportTypes.find((r) => r.id === reportType).title
        } report generated successfully.`
      );
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      setLoading(true);

      // Make the API request to download the PDF
      const response = await reportApi.downloadReport(
        selectedReport || "inventory"
      );

      // Create a Blob from the response data
      const blob = new Blob([response.data], { type: "application/pdf" });

      // Generate a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedReport || "inventory"}-report.pdf`;

      // Simulate a click on the link to trigger download
      document.body.appendChild(link); // Append the link to the document
      link.click();
      document.body.removeChild(link); // Clean up after the download

      // Revoke the URL to free up memory
      window.URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully.");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
            onClick={downloadPDF}
            disabled={loading}
            className={`bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700 transition-colors ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Download className="w-5 h-5" />
            <span>{loading ? "Downloading..." : "Download PDF"}</span>
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
                <h3 className="text-lg font-semibold text-gray-900">
                  {report.title}
                </h3>
              </div>
              <button
                onClick={() => generateReport(report.id)}
                className={`text-blue-600 hover:text-blue-800 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading && selectedReport === report.id
                  ? "Generating..."
                  : "Generate"}
              </button>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData[report.id] || []}>
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
    </motion.div>
  );
};

export default Reports;
