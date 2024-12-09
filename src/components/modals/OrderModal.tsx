import React, { useState, useEffect, useRef, useMemo } from "react";
import { X, Plus, Minus } from "lucide-react";
import { useSupplierInventory } from "../../hooks/useSuppllierInventory"; // Corrected hook import
import { toast } from "react-hot-toast";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: any) => void;
  order?: any;
}

const OrderModal = ({ isOpen, onClose, onSubmit, order }: OrderModalProps) => {
  const { items: supplierItems } = useSupplierInventory(); // Fetch supplier inventory
  const [orderItems, setOrderItems] = useState([
    { productId: "", name: "", SKU: "", category: "", quantity: 1, price: 0 },
  ]);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (order) {
        setOrderItems(order.items);
      } else {
        setOrderItems([
          {
            productId: "",
            name: "",
            SKU: "",
            category: "",
            quantity: 1,
            price: 0,
          },
        ]);
        setSearchQuery("");
      }
    }
  }, [isOpen, order]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setOpenDropdownIndex(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleAddItem = () => {
    setOrderItems([
      ...orderItems,
      { productId: "", name: "", SKU: "", category: "", quantity: 1, price: 0 },
    ]);
    toast.success("Item slot added to the order!");
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
    toast.success("Item removed from the order.");
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === "productId") {
      const product = supplierItems.find((p) => p._id === value);
      if (product) {
        newItems[index].name = product.name || "";
        newItems[index].SKU = product.sku || "";
        newItems[index].category = product.category || "";
        newItems[index].price = product.price;
        newItems[index].quantity = 1;
        toast.success(`Product "${product.name}" added to the order!`);
      }
    }
    setOrderItems(newItems);
  };

  const calculateTotal = () => {
    return orderItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
  };

  const filteredSupplierItems = useMemo(() => {
    const selectedProductIds = orderItems.map((item) => item.productId);
    return supplierItems?.filter(
      (product) =>
        !selectedProductIds.includes(product._id) &&
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [orderItems, supplierItems, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasInvalidFields = orderItems.some((item, index) => {
      if (!item.name || !item.SKU || !item.category || item.price <= 0) {
        toast.error(
          `Item ${
            index + 1
          } is invalid. Please ensure all mandatory fields are filled, and price is greater than zero.`
        );
        return true;
      }
      return false;
    });

    if (hasInvalidFields) {
      return;
    }

    onSubmit({ items: orderItems, total: calculateTotal() });
    onClose();
    toast.success("Order submitted successfully!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {order ? "Edit Order" : "Create New Order"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {orderItems.map((item, index) => {
            const selectedProduct = supplierItems?.find(
              (p) => p._id === item.productId
            );
            return (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Supplier Product
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <input
                      type="text"
                      value={
                        selectedProduct ? selectedProduct.name : searchQuery
                      }
                      onClick={() =>
                        setOpenDropdownIndex(
                          openDropdownIndex === index ? null : index
                        )
                      }
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 cursor-pointer"
                      placeholder="Select a product"
                    />
                    {openDropdownIndex === index && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        <ul>
                          {filteredSupplierItems.length > 0 ? (
                            filteredSupplierItems.map((product) => (
                              <li
                                key={product._id}
                                className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100"
                                onClick={() => {
                                  handleItemChange(
                                    index,
                                    "productId",
                                    product._id
                                  );
                                  setOpenDropdownIndex(null);
                                  setSearchQuery("");
                                }}
                              >
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-6 h-6 mr-2"
                                />
                                <span>
                                  {product.name} - ${product.price}
                                </span>
                              </li>
                            ))
                          ) : (
                            <li className="px-3 py-2 text-gray-500">
                              No products found.
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "quantity",
                        Math.max(parseInt(e.target.value) || 1, 1)
                      )
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>

                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700">
                    Price
                  </label>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "price",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="mt-6 p-2 text-red-600 hover:text-red-800"
                >
                  <Minus className="w-5 h-5" />
                </button>
              </div>
            );
          })}

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-5 h-5" />
              <span>Add Item</span>
            </button>

            <div className="text-lg font-semibold">
              Total: ${calculateTotal().toFixed(2)}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {order ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;
