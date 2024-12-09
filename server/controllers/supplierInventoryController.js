import SupplierInventory from '../models/SupplierInventory.js';

// Get all supplier inventory items
export const getProducts = async (req, res) => {
  try {
    const products = await SupplierInventory.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new supplier inventory item
export const addProduct = async (req, res) => {
  try {
    const product = new SupplierInventory({
      ...req.body,
      owner: req.user.uid,
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get a supplier inventory item by ID
export const getProductById = async (req, res) => {
  try {
    const product = await SupplierInventory.findOne({
      _id: req.params.id,
      owner: req.user.uid,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a supplier inventory item
export const updateProduct = async (req, res) => {
  try {
    const product = await SupplierInventory.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.uid },
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a supplier inventory item
export const deleteProduct = async (req, res) => {
  try {
    const product = await SupplierInventory.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.uid,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get low stock supplier inventory items
export const getLowStockProducts = async (req, res) => {
  try {
    const products = await SupplierInventory.find({
      owner: req.user.uid,
      quantity: { $lt: req.query.threshold || 10 },
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Adjust stock for a supplier inventory item
export const adjustStock = async (req, res) => {
  try {
    const product = await SupplierInventory.findOne({
      _id: req.params.id,
      owner: req.user.uid,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.quantity += req.body.adjustment;
    await product.save();
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
