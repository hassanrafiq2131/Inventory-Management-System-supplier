import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Filter, Trash2 } from "lucide-react";
import { useStockRequests, StockRequest } from "../hooks/useStockRequest";
import StockRequestModal from "../components/modals/StockRequestModal";
import StockRequestDetailsModal from "../components/modals/StockRequestDetailsModal";
import { stockRequestApi } from "../services/api";
import { toast } from "react-hot-toast";

const StockRequests = () => {
  const [filterStatus, setFilterStatus] = useState("all");
  const { stockRequests, loading, error, fetchStockRequests } =
    useStockRequests();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<StockRequest | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleAddEdit = async (requestData: any) => {
    try {
      if (selectedRequest) {
        await stockRequestApi.update(selectedRequest._id, requestData);
        toast.success("Stock request updated successfully");
      } else {
        await stockRequestApi.create(requestData);
        toast.success("Stock request created successfully");
      }
      fetchStockRequests();
      setShowRequestModal(false);
      setSelectedRequest(null);
    } catch (error) {
      toast.error("Operation failed. Please try again.");
      console.error("Error:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this stock request?")) {
      try {
        await stockRequestApi.delete(id);
        toast.success("Stock request deleted successfully");
        refreshStockRequests();
      } catch (error) {
        toast.error("Delete failed. Please try again.");
        console.error("Error:", error);
      }
    }
  };

  const filteredRequests =
    stockRequests?.filter((request) =>
      filterStatus === "all" ? true : request.status === filterStatus
    ) || [];

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
        <button
          onClick={() => {
            setSelectedRequest(null);
            setShowRequestModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Create Request</span>
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
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  scope="col"
                >
                  Request ID
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  scope="col"
                >
                  Date
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  scope="col"
                >
                  Product
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  scope="col"
                >
                  Status
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  scope="col"
                >
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
                  <td
                    className="px-6 py-4 whitespace-nowrap text-blue-600 cursor-pointer hover:underline"
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowDetailsModal(true);
                    }}
                  >
                    #{request._id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {request.product?.name || "N/A"}
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
                      {request.status.charAt(0).toUpperCase() +
                        request.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDelete(request._id)}
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

      <StockRequestModal
        isOpen={showRequestModal}
        onClose={() => {
          setShowRequestModal(false);
          setSelectedRequest(null);
        }}
        onSubmit={handleAddEdit}
        request={selectedRequest}
      />

      <StockRequestDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        request={selectedRequest}
      />
    </motion.div>
  );
};

export default StockRequests;
