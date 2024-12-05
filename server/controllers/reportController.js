import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Invoice from '../models/Invoice.js';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

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
    let data = [];
    let title = '';

    // Fetch data based on type
    if (type === 'inventory') {
      const products = await Product.find({ owner: req.user.uid });
      data = products.map((product) => ({
        Name: product.name,
        SKU: product.sku,
        Quantity: product.quantity,
        Price: `$${product.price.toFixed(2)}`,
        TotalValue: `$${(product.quantity * product.price).toFixed(2)}`,
      }));
      title = 'Inventory Report';
    } else if (type === 'sales') {
      const orders = await Order.find({ owner: req.user.uid, status: 'approved' }).populate('items.product');
      data = orders.map((order) => ({
        OrderNumber: order.orderNumber,
        Date: new Date(order.createdAt).toLocaleDateString(),
        TotalAmount: `$${order.totalAmount.toFixed(2)}`,
        Items: order.items.map((item) => item.product.name).join(', '),
      }));
      title = 'Sales Report';
    } else {
      return res.status(400).json({ message: 'Invalid report type.' });
    }

    // Generate PDF in memory
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-report.pdf`);

    doc.pipe(res);

    // Title Section
    doc.font('Helvetica-Bold')
      .fontSize(20)
      .text(title, { align: 'center' })
      .moveDown(2);

    // Check if data is available
    if (data.length > 0) {
      // Table Header
      const tableHeader = Object.keys(data[0]);
      const columnWidths = [150, 100, 80, 80, 100]; // Customize based on the number of columns
      const startX = doc.x;
      const startY = doc.y;

      doc.font('Helvetica-Bold').fontSize(12);

      tableHeader.forEach((header, index) => {
        doc.text(header, startX + columnWidths.slice(0, index).reduce((sum, w) => sum + w, 0), startY, {
          width: columnWidths[index],
          align: 'left',
        });
      });

      doc.moveDown(0.5);

      // Table Rows
      doc.font('Helvetica').fontSize(10);
      data.forEach((row) => {
        const rowY = doc.y + 15;
        Object.values(row).forEach((value, index) => {
          doc.text(value, startX + columnWidths.slice(0, index).reduce((sum, w) => sum + w, 0), rowY, {
            width: columnWidths[index],
            align: 'left',
          });
        });
        doc.moveDown(1); // Add space between rows
      });
    } else {
      // No data message
      doc.fontSize(14)
        .text('No data available for this report.', { align: 'center' })
        .moveDown();
    }

    // Footer Section
    doc.moveDown(2)
      .font('Helvetica')
      .fontSize(10)
      .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });

    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: error.message });
  }
};