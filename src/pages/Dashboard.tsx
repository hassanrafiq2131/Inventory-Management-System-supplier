import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import { suppliersInventoryApi, stockRequestApi, invoiceApi } from "../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState([
    {
      title: "Total Products",
      value: "-",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Pending Requests",
      value: "-",
      icon: TrendingUp,
      color: "bg-green-500",
    },
    {
      title: "Low Stock Items",
      value: "-",
      icon: AlertTriangle,
      color: "bg-yellow-500",
    },
    {
      title: "Pending Invoices",
      value: "-",
      icon: DollarSign,
      color: "bg-purple-500",
    },
  ]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [inventoryRes, lowStockRes, stockRequestsRes, invoicesRes] = await Promise.all([
          suppliersInventoryApi.getAll(),
          suppliersInventoryApi.getLowStock(),
          stockRequestApi.getAll(),
          invoiceApi.getAll(),
        ]);

        const totalProducts = inventoryRes.data.length;
        const lowStockItems = lowStockRes.data.length;
        const pendingRequests = stockRequestsRes.data.filter((req) => req.status === "pending").length;
        const pendingInvoices = invoicesRes.data.filter((inv) => inv.status === "pending").length;

        // Calculate products with the highest stock requests
        const stockRequestsByProduct = stockRequestsRes.data.reduce((acc, request) => {
          if (request.product) { // Check if product exists
            const productId = request.product._id;
            if (!acc[productId]) {
              acc[productId] = {
                product: request.product,
                totalQuantity: 0,
              };
            }
            acc[productId].totalQuantity += request.quantity;
          }
          return acc;
        }, {});

        const topRequestedProducts = Object.values(stockRequestsByProduct)
          .sort((a, b) => b.totalQuantity - a.totalQuantity)
          .slice(0, 5); // Top 5 products with the highest requests

        // Recent stock requests
        const recentRequests = stockRequestsRes.data.slice(0, 5); // Latest 5 requests

        setStats([
          {
            title: "Total Products",
            value: totalProducts,
            icon: Package,
            color: "bg-blue-500",
          },
          {
            title: "Pending Requests",
            value: pendingRequests,
            icon: TrendingUp,
            color: "bg-green-500",
          },
          {
            title: "Low Stock Items",
            value: lowStockItems,
            icon: AlertTriangle,
            color: "bg-yellow-500",
          },
          {
            title: "Pending Invoices",
            value: pendingInvoices,
            icon: DollarSign,
            color: "bg-purple-500",
          },
        ]);

        setTopProducts(topRequestedProducts);
        setRecentRequests(recentRequests);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <h1 className="text-2xl font-bold text-gray-900">Supplier Dashboard</h1>

      {/* Stats Overview */}
      <div className="flex flex-wrap justify-between gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col items-center bg-white p-6 rounded-lg shadow-sm w-[calc(25%-1rem)]"
          >
            <div className={`p-3 rounded-full ${stat.color}`}>
              <stat.icon className="w-8 h-8 text-white" />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Top Requested Products */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top sold Products</h2>
        <ul className="space-y-3">
          {topProducts.map(({ product, totalQuantity }) => (
            <li
              key={product._id}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm"
            >
              <div>
                <p className="text-sm font-medium text-gray-700">{product.name}</p>
                <p className="text-xs text-gray-500">{product.category}</p>
              </div>
              <div className="text-blue-600 font-semibold">
                Requests: {totalQuantity}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Recent Stock Requests */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Stock Requests</h2>
        <ul className="space-y-3">
          {recentRequests.map((request) => (
            <li
              key={request._id}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm"
            >
              <div>
                <p className="text-sm font-medium text-gray-700">{request.productName}</p>
                <p className="text-xs text-gray-500">Status: {request.status}</p>
              </div>
              <div className="text-blue-600 font-semibold">Quantity: {request.quantity}</div>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default Dashboard;
