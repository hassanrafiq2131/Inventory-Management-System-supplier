import React, { useState } from "react";
import { motion } from "framer-motion";
import { Filter, Check, X } from "lucide-react";
import { useStockRequests } from "../hooks/useStockRequest";
import { stockRequestApi } from "../services/api";
import { toast } from "react-hot-toast";

const StockRequests = () => {
  const [filterStatus, setFilterStatus] = useState("all");
  const { stockRequests, loading, error, fetchStockRequests } = useStockRequests();

  const handleUpdateStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      await stockRequestApi.update(requestId, { status });
      toast.success(`Stock request ${status} successfully`);
      fetchStockRequests();
    } catch (error) {
      toast.error(`Failed to ${status} request`);
    }
  };

  const filteredRequests = stockRequests?.filter((request) =>
    filterStatus === "all" ? true : request.status === filterStatus
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
        <h1 className="text-2xl font-bold text-gray-900">Stock Requests</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b flex items-center space-x-4">
          <Filter className="text-gray-400 w-5 h-5" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Requests</option>
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
                  Request ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
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
              {filteredRequests.map((request) => (
                <motion.tr
                  key={request._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    #{request._id.slice(-6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {request.product?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {request.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : request.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {request.status === 'pending' && (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleUpdateStatus(request._id, 'approved')}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(request._id, 'rejected')}
                          className="text-red-600 hover:text-red-900"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default StockRequests;