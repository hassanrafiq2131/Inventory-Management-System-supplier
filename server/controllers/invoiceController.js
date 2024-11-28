import Invoice from '../models/Invoice.js';

// Get all invoices
export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('supplier');
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new invoice
export const createInvoice = async (req, res) => {
  const invoice = new Invoice(req.body);
  try {
    const savedInvoice = await invoice.save();
    res.status(201).json(savedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get an invoice by ID
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('supplier');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an invoice
export const updateInvoice = async (req, res) => {
  try {
    const updatedInvoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedInvoice) return res.status(404).json({ message: 'Invoice not found' });
    res.status(200).json(updatedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an invoice
export const deleteInvoice = async (req, res) => {
  try {
    const deletedInvoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!deletedInvoice) return res.status(404).json({ message: 'Invoice not found' });
    res.status(200).json({ message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get supplier recommendations
export const getSupplierRecommendations = async (req, res) => {
  // Implement your logic for supplier recommendations
  res.status(200).json({ message: 'Supplier recommendations' });
};

// Update invoice status
export const updateInvoiceStatus = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    invoice.status = req.body.status;
    await invoice.save();
    res.status(200).json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};