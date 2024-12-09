import express from 'express';
import { protect } from '../middleware/auth.js';
import * as orderController from '../controllers/orderController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(orderController.getOrders)
  .post(orderController.createOrder);

router.route('/:id')
  .get(orderController.getOrderById)
  .put(orderController.updateOrder)
  .delete(orderController.deleteOrder);

router.put('/:id/status', orderController.updateOrderStatus);

export default router;