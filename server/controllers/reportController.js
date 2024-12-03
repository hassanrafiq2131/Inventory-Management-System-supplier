import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Invoice from '../models/Invoice.js';

export const getInventoryReport = async (req, res) => {
  try {
    const products = await Product.find({ owner: req.user.uid });
    const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
    const lowStockProducts = products.filter(p => p.quantity <= p.reorderPoint);

    res.status(200).json({
      totalProducts: products.length,
      lowStockProducts: lowStockProducts.length,
      totalValue,
      products,
      lowStockItems: lowStockProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSalesReport = async (req, res) => {
  try {
    const orders = await Order.find({ owner: req.user.uid, status: 'approved' }).populate('items.product');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStockMovementReport = async (req, res) => {
  try {
    const orders = await Order.find({ owner: req.user.uid }).populate('items.product');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadReport = async (req, res) => {
  const { type } = req.params;
  try {
    // Implement your logic to generate and download the report based on the type
    res.status(200).json({ message: `Report of type ${type} downloaded` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};