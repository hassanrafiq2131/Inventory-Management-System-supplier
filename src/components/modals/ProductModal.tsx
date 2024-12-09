import React, { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { productApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: any) => void;
  product?: any;
}

const ProductModal = ({
  isOpen,
  onClose,
  onSubmit,
  product,
}: ProductModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    quantity: 0,
    price: 0,
    reorderPoint: 0,
    imageUrl: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        name: "",
        sku: "",
        category: "",
        quantity: 0,
        price: 0,
        reorderPoint: 0,
        imageUrl: "",
      });
    }
  }, [product]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        name === "quantity" || name === "price" || name === "reorderPoint"
          ? Number(value)
          : value,
    }));
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setImageFile(file);
      await handleImageUpload(file); // Call the upload function directly
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      toast.error("Please select an image to upload");
      return;
    }
    try {
      setUploading(true);
      const response = await productApi.upload(imageFile);
      setFormData((prev) => ({ ...prev, imageUrl: response.data.imageUrl }));
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-lg shadow-lg space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Upload Section */}
        <div className="space-y-1 text-center border border-dashed border-gray-300 rounded-lg p-4">
          <Upload className="mx-auto h-8 w-8 text-gray-400" />
          <div className="flex text-sm text-gray-600 justify-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer text-blue-600 hover:underline"
            >
              Drag & drop images here, or click to select
            </label>
          </div>
          <p className="text-xs text-gray-500">PNG up to 5MB</p>
        </div>

        {uploading && (
          <div className="mt-2">
            <div className="animate-pulse flex space-x-2 items-center justify-center">
              <div className="h-2 w-2 bg-indigo-500 rounded-full"></div>
              <div className="text-sm text-indigo-600">Uploading...</div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {formData.imageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative rounded-lg overflow-hidden w-32 h-32 mx-auto"
            >
              <img
                src={formData.imageUrl}
                alt="Uploaded Product"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, imageUrl: "" }))
                }
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              SKU
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1"
              required
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reorder Point
            </label>
            <input
              type="number"
              name="reorderPoint"
              value={formData.reorderPoint}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1"
              required
              min="0"
            />
          </div>

          <div className="col-span-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {product ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
