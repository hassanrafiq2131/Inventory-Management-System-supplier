import React, { useState } from "react";
import { X } from "lucide-react";
import { Order } from "../../hooks/useOrders";
import { invoiceApi } from "../../services/api"; // Import the invoice API
import { toast } from "react-hot-toast"; // Toast for notifications

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const OrderDetailsModal = ({
  isOpen,
  onClose,
  order,
}: OrderDetailsModalProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen || !order) return null;

  const handleGenerateInvoice = async () => {
    if (order.status !== "approved") {
      toast.error("Invoice can only be generated for approved orders.");
      return;
    }

    try {
      setIsGenerating(true);
      const response = await invoiceApi.createFromOrder(order._id);
      toast.success("Invoice generated successfully!");
      console.log("Generated Invoice:", response.data);
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error("Failed to generate invoice. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Invoice Header */}
        <div className="mb-6">
          <div className="flex justify-between">
            <div>
              <h3 className="text-lg font-semibold">Order Number</h3>
              <p className="text-gray-700">#{order.orderNumber}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Order Date</h3>
              <p className="text-gray-700">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Customer Information</h3>
            <p className="text-gray-700">
              <strong>Requested By:</strong> {order.requestedBy}
            </p>
            {order.approvedBy && (
              <p className="text-gray-700">
                <strong>Approved By:</strong> {order.approvedBy}
              </p>
            )}
          </div>
        </div>

        {/* Invoice Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  Image
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  Product Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  SKU
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">
                  Quantity
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b">
                  Price
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => {
                const product = item.product; // Assuming item.product is a populated object
                const total = item.quantity * item.price;
                return (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-full"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-800">{product.name}</td>
                    <td className="px-4 py-3 text-gray-600">{product.sku}</td>
                    <td className="px-4 py-3 text-center text-gray-800">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-800">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-800">
                      ${total.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Invoice Footer */}
        <div className="mt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Total Amount</h3>
            <p className="text-xl font-bold text-gray-900">
              ${order.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Generate Invoice Button */}
        {order.status === "approved" && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleGenerateInvoice}
              disabled={isGenerating}
              className={`px-4 py-2 text-white rounded-md ${
                isGenerating
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isGenerating ? "Generating..." : "Generate Invoice"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsModal;
