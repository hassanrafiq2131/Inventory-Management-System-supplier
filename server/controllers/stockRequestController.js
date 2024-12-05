import StockRequest from '../models/StockRequest.js';
import Product from '../models/Product.js';

export const getStockRequests = async (req, res) => {
  try {
    const stockRequests = await StockRequest.find({}).populate('product');
    res.status(200).json(stockRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createStockRequest = async (req, res) => {
  try {
    const { items, requestedBy } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: 'Items are required.' });
    }

    // Create multiple stock requests
    const stockRequests = items.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      requestedBy,
    }));

    const savedRequests = await StockRequest.insertMany(stockRequests);

    res.status(201).json(savedRequests);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const updateStockRequest = async (req, res) => {
  try {
    const { status, approvedBy } = req.body;

    const stockRequest = await StockRequest.findByIdAndUpdate(
      req.params.id,
      { status, approvedBy, updatedAt: Date.now() },
      { new: true }
    );

    if (status === 'approved') {
      const product = await Product.findById(stockRequest.product);
      product.quantity -= stockRequest.quantity;
      await product.save();
    }

    res.status(200).json(stockRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteStockRequest = async (req, res) => {
  try {
    await StockRequest.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Stock request deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
