import React, { useState, useEffect } from "react";
import { X, Plus, Minus } from "lucide-react";
import { useInventory } from "../../hooks/useInventory";
import { toast } from "react-hot-toast";

interface StockRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (requestData: any) => void;
  request?: any;
}

const StockRequestModal = ({
  isOpen,
  onClose,
  onSubmit,
  request,
}: StockRequestModalProps) => {
  const { products } = useInventory();
  const [requestItems, setRequestItems] = useState([
    { productId: "", quantity: 1 },
  ]);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (request) {
        setRequestItems(request.items);
      } else {
        setRequestItems([{ productId: "", quantity: 1 }]);
        setSearchQuery("");
      }
    }
  }, [isOpen, request]);

  const handleAddItem = () => {
    setRequestItems([...requestItems, { productId: "", quantity: 1 }]);
    toast.success("Item slot added to the request!");
  };

  const handleRemoveItem = (index: number) => {
    setRequestItems(requestItems.filter((_, i) => i !== index));
    toast.success("Item removed from the request.");
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...requestItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setRequestItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure the payload matches the schema
    const payload = requestItems.map((item) => ({
      product: item.productId, // Match the schema's `product` field
      quantity: item.quantity,
    }));

    // Pass to onSubmit
    onSubmit({
      items: payload,
      requestedBy: "user-id-or-email", // Replace with the logged-in user
    });

    onClose();
  };

  const getAvailableProducts = () => {
    const selectedProductIds = requestItems.map((item) => item.productId);
    return products.filter(
      (product) => !selectedProductIds.includes(product._id)
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {request ? "Edit Stock Request" : "Create Stock Request"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {requestItems.map((item, index) => {
            const selectedProduct = products.find(
              (p) => p._id === item.productId
            );
            return (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Product
                  </label>
                  <div className="relative">
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
                          {getAvailableProducts()
                            .filter((product) =>
                              product.name
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase())
                            )
                            .map((product) => (
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
                                <span>{product.name}</span>
                              </li>
                            ))}
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
                        parseInt(e.target.value)
                      )
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                    min="1"
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
              {request ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockRequestModal;
