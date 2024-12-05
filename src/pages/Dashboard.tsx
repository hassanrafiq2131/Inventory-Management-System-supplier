import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Package, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import { productApi, orderApi } from "../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState([
    {
      title: "Total Products",
      value: "-",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Monthly Sales",
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
    { title: "Revenue", value: "-", icon: DollarSign, color: "bg-purple-500" },
  ]);
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch total products and low stock items
        const [inventoryRes, lowStockRes] = await Promise.all([
          productApi.getAll(),
          productApi.getLowStock(),
        ]);

        const totalProducts = inventoryRes.data.length;
        const lowStockItems = lowStockRes.data.length;

        // Fetch all orders and aggregate data for the chart
        const ordersRes = await orderApi.getAll();
        const orders = ordersRes.data;

        const monthlySales = orders.length;
        const revenue = orders.reduce(
          (sum, order) =>
            sum +
            order.items.reduce(
              (orderSum, item) => orderSum + item.quantity * item.price,
              0
            ),
          0
        );

        // Aggregate sales data by month
        const salesChartData = orders.reduce((acc, order) => {
          const orderDate = new Date(order.createdAt);
          const month = orderDate.toLocaleString("default", { month: "short" });

          const orderTotal = order.items.reduce(
            (sum, item) => sum + item.quantity * item.price,
            0
          );

          const existingMonth = acc.find((data) => data.name === month);
          if (existingMonth) {
            existingMonth.value += orderTotal;
          } else {
            acc.push({ name: month, value: orderTotal });
          }

          return acc;
        }, []);

        setStats([
          {
            title: "Total Products",
            value: totalProducts,
            icon: Package,
            color: "bg-blue-500",
          },
          {
            title: "Monthly Sales",
            value: monthlySales,
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
            title: "Revenue",
            value: `$${revenue.toFixed(2)}`,
            icon: DollarSign,
            color: "bg-purple-500",
          },
        ]);

        setSalesData(salesChartData);
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
      className="space-y-6"
    >
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Monthly Sales Overview
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
