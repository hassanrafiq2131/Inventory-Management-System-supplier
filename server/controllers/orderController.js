import mongoose from 'mongoose';
import Order from '../models/Order.js';

// Get all orders
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ owner: req.user.uid }).populate('items.product');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { items } = req.body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }

    for (const item of items) {
      if (!item.productId) {
        return res.status(400).json({ message: 'Product is required in each item' });
      }
    }

    // Map productId to product
    const mappedItems = items.map(item => ({
      product: item.productId,
      quantity: item.quantity,
      price: item.price
    }));

    // Calculate total amount
    const totalAmount = mappedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    const orderNumber = await generateOrderNumber(req.user.uid);

    const order = new Order({
      ...req.body,
      items: mappedItems,
      owner: req.user.uid, // Use string for owner
      orderNumber,
      totalAmount // Include totalAmount
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get an order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      owner: req.user.uid
    }).populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an order
export const updateOrder = async (req, res) => {
  try {
    const { items } = req.body;

    // Validate items
    if (items) {
      for (const item of items) {
        if (!item.productId) {
          return res.status(400).json({ message: 'Product is required in each item' });
        }
      }
    }

    // Map productId to product
    const mappedItems = items.map(item => ({
      product: item.productId,
      quantity: item.quantity,
      price: item.price
    }));

    // Calculate total amount
    const totalAmount = mappedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.uid },
      { ...req.body, items: mappedItems, totalAmount },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an order
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.uid
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      owner: req.user.uid
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = req.body.status;
    await order.save();
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

async function generateOrderNumber(userId) {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const count = await Order.countDocuments({ owner: userId });
  return `ORD-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
}