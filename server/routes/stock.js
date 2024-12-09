import express from 'express';
import { protect } from '../middleware/auth.js';
import * as stockRequestController from '../controllers/stockRequestController.js';

const router = express.Router();

router.use(protect);

// Routes for Stock Requests
router.route('/')
  .get(stockRequestController.getStockRequests) // View history
  .post(stockRequestController.createStockRequest); // Create new request

router.route('/:id')
  .put(stockRequestController.updateStockRequest) // Approve/Reject
  .delete(stockRequestController.deleteStockRequest); // Delete request

export default router;
