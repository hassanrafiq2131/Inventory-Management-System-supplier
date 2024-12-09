import express from 'express';
import { protect } from '../middleware/auth.js';
import * as reportController from '../controllers/reportController.js';

const router = express.Router();

router.use(protect);

router.get('/inventory', reportController.getInventoryReport);
router.get('/sales', reportController.getSalesReport);
router.get('/movement', reportController.getStockMovementReport);
router.get('/download/:type', reportController.downloadReport);

export default router;