import express from 'express';
import { protect } from '../middleware/auth.js';
import * as supplierInventoryController from '../controllers/supplierInventoryController.js';
import upload from '../middleware/upload.js';
import { uploadToImgur } from '../utils/imgur.js';

const router = express.Router();

router.use(protect);

router.get('/low-stock', supplierInventoryController.getLowStockProducts);
router.post('/adjust/:id', supplierInventoryController.adjustStock);

router
  .route('/')
  .get(supplierInventoryController.getProducts)
  .post(supplierInventoryController.addProduct);

router
  .route('/:id')
  .get(supplierInventoryController.getProductById)
  .put(supplierInventoryController.updateProduct)
  .delete(supplierInventoryController.deleteProduct);

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageUrl = await uploadToImgur(req.file.buffer);
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error.message);
    res.status(500).json({ message: error.message });
  }
});

export default router;
