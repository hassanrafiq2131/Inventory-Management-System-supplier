import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Filter, FileText, Trash2 } from "lucide-react";
import { useOrders, Order } from "../hooks/useOrders";
import OrderModal from "../components/modals/OrderModal";
import OrderDetailsModal from "../components/modals/OrderDetailsModal"; // Import the new modal
import { orderApi } from "../services/api";
import { toast } from "react-hot-toast";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const Orders = () => {
  const [filterStatus, setFilterStatus] = useState("all");
  const { orders, loading, error, refreshOrders } = useOrders();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false); // New state for details modal

  const handleAddEdit = async (orderData: any) => {
    try {
      if (selectedOrder) {
        await orderApi.update(selectedOrder._id, orderData);
        toast.success("Order updated successfully");
      } else {
        await orderApi.create(orderData);
        toast.success("Order created successfully");
      }
      refreshOrders();
      setShowOrderModal(false);
      setSelectedOrder(null);
    } catch (error) {
      toast.error("Operation failed. Please try again.");
      console.error("Error:", error);
    }
  };

  const handleDelete = async (orderId: string) => {
    confirmAlert({
      title: "Confirm Deletion",
      message: "Are you sure you want to delete this order?", // Correct key is `message`, not `description`
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              await orderApi.delete(orderId);
              toast.success("Order deleted successfully");
              refreshOrders();
            } catch (error) {
              toast.error("Failed to delete order");
            }
          },
        },
        {
          label: "No",
          onClick: () => {
            toast.success("Deletion canceled");
          },
        },
      ],
    });
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await orderApi.updateStatus(id, status);
      toast.success("Order status updated successfully");
      refreshOrders();
    } catch (error) {
      toast.error("Status update failed. Please try again.");
      console.error("Error:", error);
    }
  };

  const filteredOrders = orders?.filter((order) =>
    filterStatus === "all" ? true : order.status === filterStatus
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <button
          onClick={() => {
            setSelectedOrder(null);
            setShowOrderModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Create Order</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b flex items-center space-x-4">
          <Filter className="text-gray-400 w-5 h-5" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders?.map((order) => (
                <motion.tr
                  key={order._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td
                    className="px-6 py-4 whitespace-nowrap text-blue-600 cursor-pointer hover:underline"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetailsModal(true);
                    }}
                  >
                    #{order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.items.length} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${order.totalAmount?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                      className={`px-2 text-xs rounded-full ${
                        order.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : order.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDelete(order._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <OrderModal
        isOpen={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          setSelectedOrder(null);
        }}
        onSubmit={handleAddEdit}
        order={selectedOrder}
      />

      <OrderDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        order={selectedOrder}
      />
    </motion.div>
  );
};

export default Orders;
