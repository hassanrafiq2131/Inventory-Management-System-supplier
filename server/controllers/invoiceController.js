import Invoice from '../models/Invoice.js';
import Order from '../models/Order.js';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

// Get all invoices for a user
export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ owner: req.user.uid })
      .populate('items.product')
      .sort({ date: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createInvoiceFromOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.body.orderId,
      owner: req.user.uid,
      status: 'approved',
    }).populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Approved order not found' });
    }

    const amount = order.items.reduce(
      (total, item) => total + item.quantity * item.product.price,
      0
    );

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // Set due date to 30 days from now

    const invoiceData = {
      owner: req.user.uid,
      number: await generateInvoiceNumber(req.user.uid),
      orderId: order._id,
      items: order.items,
      amount,
      dueDate,
      date: new Date(), // Explicitly set the date
      status: 'approved', // Ensure the status value is valid
    };

    const invoice = new Invoice(invoiceData);
    const savedInvoice = await invoice.save();

    res.status(201).json(savedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



// Get a single invoice by ID
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      owner: req.user.uid,
    }).populate('items.product');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an invoice
export const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.uid },
      req.body,
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.status(200).json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an invoice
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.uid,
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.status(200).json({ message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update invoice status (e.g., mark as paid)
export const updateInvoiceStatus = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      owner: req.user.uid,
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    invoice.status = req.body.status;
    if (req.body.status === 'paid') {
      invoice.paymentDate = new Date();
    }

    await invoice.save();
    res.status(200).json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Generate unique invoice number
async function generateInvoiceNumber(userId) {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const count = await Invoice.countDocuments({ owner: userId });
  return `INV-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
}


export const downloadInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Ensure the `amount` field is valid
    const amount = invoice.amount || 0;

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${invoice.number}.pdf`);

    doc.pipe(res);

    // Add Invoice Details
    doc.fontSize(20).text(`Invoice #${invoice.number}`, { align: 'center' }).moveDown(2);
    doc.fontSize(12).text(`Date: ${new Date(invoice.date).toLocaleDateString()}`);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`);
    doc.text(`Status: ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}`);
    doc.text(`Amount: $${amount.toFixed(2)}`).moveDown();

    // Add Items Section
    doc.fontSize(16).text('Items:', { underline: true }).moveDown();
    invoice.items.forEach((item, index) => {
      doc
        .fontSize(12)
        .text(`${index + 1}. ${item.product} - Quantity: ${item.quantity}, Price: $${item.price.toFixed(2)}`);
    });

    // Notes Section
    if (invoice.notes) {
      doc.moveDown().fontSize(12).text(`Notes: ${invoice.notes}`);
    }

    // Footer
    doc.moveDown(2).fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });

    doc.end();
  } catch (error) {
    console.error('Error generating invoice PDF:', error);

    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to generate invoice PDF' });
    }
  }
};