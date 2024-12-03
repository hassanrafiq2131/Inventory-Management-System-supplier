import express from 'express';
import { protect, adminMiddleware } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/pending-approvals', protect, adminMiddleware, authController.getPendingApprovals);
router.put('/approve/:id', protect, adminMiddleware, authController.approveUser);
router.put('/reject/:id', protect, adminMiddleware, authController.rejectUser);
router.get('/me', protect, authController.getCurrentUser);
router.post('/sync', protect, authController.syncUser);

export default router;