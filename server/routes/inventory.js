import express from 'express';
import { protect } from '../middleware/auth.js';
import * as inventoryController from '../controllers/inventoryController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(inventoryController.getProducts)
  .post(inventoryController.addProduct);

router.route('/:id')
  .get(inventoryController.getProductById)
  .put(inventoryController.updateProduct)
  .delete(inventoryController.deleteProduct);

router.get('/low-stock', inventoryController.getLowStockProducts);
router.post('/adjust/:id', inventoryController.adjustStock);

export default router;