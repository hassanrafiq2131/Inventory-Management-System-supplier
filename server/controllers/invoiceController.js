import Invoice from '../models/Invoice.js';
import Order from '../models/Order.js';

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
      status: 'pending', // Ensure the status value is valid
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
