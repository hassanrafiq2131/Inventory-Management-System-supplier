import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { jsPDF } from 'jspdf';

export const generateInventoryReport = async () => {
  const products = await Product.find().lean();
  const lowStockProducts = products.filter(p => p.quantity <= p.reorderPoint);
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);

  return {
    totalProducts: products.length,
    lowStockProducts: lowStockProducts.length,
    totalValue,
    products,
    lowStockItems: lowStockProducts
  };
};

export const generateSalesReport = async (startDate, endDate) => {
  const orders = await Order.find({
    createdAt: { $gte: startDate, $lte: endDate },
    status: 'approved'
  }).populate('items.product').lean();

  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
  const productSales = {};

  orders.forEach(order => {
    order.items.forEach(item => {
      const productId = item.product._id.toString();
      if (!productSales[productId]) {
        productSales[productId] = {
          name: item.product.name,
          quantity: 0,
          revenue: 0
        };
      }
      productSales[productId].quantity += item.quantity;
      productSales[productId].revenue += item.quantity * item.price;
    });
  });

  return {
    totalSales,
    orderCount: orders.length,
    productSales: Object.values(productSales),
    orders
  };
};

export const generateStockMovementReport = async (startDate, endDate) => {
  const orders = await Order.find({
    createdAt: { $gte: startDate, $lte: endDate }
  }).populate('items.product').lean();

  const movements = {};

  orders.forEach(order => {
    order.items.forEach(item => {
      const productId = item.product._id.toString();
      if (!movements[productId]) {
        movements[productId] = {
          name: item.product.name,
          inflow: 0,
          outflow: 0
        };
      }

      if (order.type === 'purchase') {
        movements[productId].inflow += item.quantity;
      } else {
        movements[productId].outflow += item.quantity;
      }
    });
  });

  return {
    movements: Object.values(movements),
    orders
  };
};

export const generatePDFReport = async (reportData, reportType) => {
  const doc = new jsPDF();
  let yPos = 20;

  // Add header
  doc.setFontSize(20);
  doc.text(`${reportType.toUpperCase()} REPORT`, 20, yPos);
  yPos += 20;

  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPos);
  yPos += 20;

  // Add report content based on type
  if (reportType === 'inventory') {
    doc.text(`Total Products: ${reportData.totalProducts}`, 20, yPos);
    yPos += 10;
    doc.text(`Low Stock Items: ${reportData.lowStockProducts}`, 20, yPos);
    yPos += 10;
    doc.text(`Total Inventory Value: $${reportData.totalValue.toFixed(2)}`, 20, yPos);
  } else if (reportType === 'sales') {
    doc.text(`Total Sales: $${reportData.totalSales.toFixed(2)}`, 20, yPos);
    yPos += 10;
    doc.text(`Number of Orders: ${reportData.orderCount}`, 20, yPos);
  }

  return doc;
};