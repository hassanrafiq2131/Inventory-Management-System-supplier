import React, { useState } from "react";
import { X } from "lucide-react";
import { Order } from "../../hooks/useOrders";
import { invoiceApi, productApi, orderApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { useInventory } from "../../hooks/useInventory";
import { paymentApi } from "../../services/api";
import { useOrders } from "../../hooks/useOrders";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

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
  const [isPaying, setIsPaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { refreshProducts } = useInventory();
  const { updateOrderStatus } = useOrders();

  if (!isOpen || !order) {
    return null;
  }

  const handleStripePayment = async () => {
    const stripe = await stripePromise;

    if (!stripe) {
      toast.error("Stripe initialization failed.");
      return false;
    }

    try {
      setIsGenerating(true);

      const session = await paymentApi.createPaymentSession(
        order.items.map((item) => ({
          name: item.product?.name || "Unknown Product",
          price: item.price,
          quantity: item.quantity,
        }))
      );
      await updateOrderStatus(order._id, "approved");

      // console.log("session: ", session);

      const result = await stripe.redirectToCheckout({
        sessionId: session.sessionId,
      });

      if (result.error) {
        toast.error(result.error.message || "Payment failed.");
        return false;
      }
      console.log("payment hasnt failed so far");
      // await orderApi.update(order._id, { status: "approved" });
      return true;
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToInventory = async () => {
    for (const item of order.items) {
      const product = item.product;
      if (product) {
        try {
          await productApi.create({
            name: product.name,
            sku: product.sku,
            category: product.category,
            quantity: item.quantity,
            price: product.price,
            reorderPoint: product.reorderPoint,
            imageUrl: product.imageUrl,
          });
          refreshProducts();
        } catch (err) {
          console.error("Error adding product to inventory:", err);
          toast.error(`Failed to add ${product.name} to inventory.`);
        }
      }
    }
    toast.success("Products added to inventory successfully.");
  };

  const handlePaymentAndApproval = async () => {
    const paymentSuccess = await handleStripePayment();
    if (!paymentSuccess) return;

    try {
      // await orderApi.update(order._id, { status: "approved" });
      console.log("order marked as approved");
      toast.success("Order marked as approved.");
      await handleAddToInventory();
    } catch (error) {
      console.error("Error approving order:", error);
      toast.error("Failed to approve order. Please try again.");
    }
  };

  const handleGenerateInvoice = async () => {
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

        {/* Order Details */}
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
        </div>

        {/* Order Items Table */}
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
                const product = item.product || {};
                return (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-3">
                      <img
                        src={
                          product.imageUrl || "https://via.placeholder.com/150"
                        }
                        alt={product.name || "Product"}
                        className="w-12 h-12 object-cover rounded-full"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-800">{product.name}</td>
                    <td className="px-4 py-3 text-center text-gray-800">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-800">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-800">
                      ${(item.quantity * item.price).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Total Amount */}
        <div className="mt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Total Amount</h3>
            <p className="text-xl font-bold text-gray-900">
              ${order.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Payment and Generate Invoice Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          {/* Show Pay Now Button if order is not approved */}
          {!order.status || order.status !== "approved" ? (
            <button
              onClick={handlePaymentAndApproval}
              disabled={isPaying}
              className={`px-4 py-2 text-white rounded-md ${
                isPaying
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isPaying ? "Processing..." : "Pay Now"}
            </button>
          ) : null}

          {/* Show Generate Invoice Button if order is approved */}
          {order.status === "approved" ? (
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
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
