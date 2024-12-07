import express from 'express';
import { protect } from '../middleware/auth.js';
import * as invoiceController from '../controllers/invoiceController.js';

const router = express.Router();

// Apply authentication middleware
router.use(protect);

// Routes for managing invoices
router
  .route('/')
  .get(invoiceController.getInvoices) // Get all invoices for the authenticated user
  .post(invoiceController.createInvoiceFromOrder); // Create a new invoice from an approved order

router
  .route('/:id')
  .get(invoiceController.getInvoiceById) // Get a specific invoice by ID
  .put(invoiceController.updateInvoice) // Update an invoice
  .delete(invoiceController.deleteInvoice); // Delete an invoice

// Route for updating the status of an invoice
router.put('/:id/status', invoiceController.updateInvoiceStatus);

// Route for supplier recommendations
// router.get('/recommendations', invoiceController.getSupplierRecommendations);

router.get('/:id/download', invoiceController.downloadInvoice);

export default router;
