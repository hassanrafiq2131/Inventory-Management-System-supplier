import express from 'express';
import { protect } from '../middleware/auth.js';
import * as inventoryController from '../controllers/inventoryController.js';
import upload from '../middleware/upload.js';
import { uploadToImgur } from '../utils/imgur.js';
import Product from '../models/Product.js';

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

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload the file to Imgur
    const imageUrl = await uploadToImgur(req.file.buffer);

    // Return the uploaded image URL
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error.message);
    res.status(500).json({ message: error.message });
  }
});

export default router;