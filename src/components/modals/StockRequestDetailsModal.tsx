import React from "react";
import { X } from "lucide-react";
import { StockRequest } from "../../hooks/useStockRequest";

interface StockRequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: StockRequest | null;
}

const StockRequestDetailsModal = ({
  isOpen,
  onClose,
  request,
}: StockRequestDetailsModalProps) => {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Stock Request Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p>
            <strong>Request ID:</strong> #{request._id}
          </p>
          <p>
            <strong>Status:</strong>{" "}
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
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {new Date(request.createdAt).toLocaleDateString()}
          </p>

          <h3 className="text-lg font-semibold">Requested Item</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Product</th>
                  <th className="px-4 py-2 text-left">Quantity</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-2">
                    {request.product?.name || "Unknown Product"}
                  </td>
                  <td className="px-4 py-2">{request.quantity}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockRequestDetailsModal;
