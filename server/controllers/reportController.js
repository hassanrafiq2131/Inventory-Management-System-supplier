import Product from '../models/Product.js';
import Order from '../models/Order.js';

// Get inventory report
export const getInventoryReport = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get sales report
export const getSalesReport = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'approved' }).populate('items.product');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get stock movement report
export const getStockMovementReport = async (req, res) => {
  try {
    const orders = await Order.find().populate('items.product');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Download report
export const downloadReport = async (req, res) => {
  const { type } = req.params;
  try {
    // Implement your logic to generate and download the report based on the type
    res.status(200).json({ message: `Report of type ${type} downloaded` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  getInventoryReport,
  getSalesReport,
  getStockMovementReport,
  downloadReport
};