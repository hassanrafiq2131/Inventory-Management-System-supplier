import express from 'express';
import { protect } from '../middleware/auth.js';
import * as invoiceController from '../controllers/invoiceController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(invoiceController.getInvoices)
  .post(invoiceController.createInvoice);

router.route('/:id')
  .get(invoiceController.getInvoiceById)
  .put(invoiceController.updateInvoice)
  .delete(invoiceController.deleteInvoice);

router.get('/recommendations', invoiceController.getSupplierRecommendations);
router.put('/:id/status', invoiceController.updateInvoiceStatus);

export default router;