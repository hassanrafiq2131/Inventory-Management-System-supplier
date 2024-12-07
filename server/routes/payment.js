import express from 'express';
import { createPaymentSession } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js'; // Middleware for protected routes

const router = express.Router();

// Create a new payment session
router.post('/create-session', protect, createPaymentSession);

export default router;
