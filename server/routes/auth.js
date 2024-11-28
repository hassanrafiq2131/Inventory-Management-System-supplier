import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/pending-approvals', protect, admin, authController.getPendingApprovals);
router.put('/approve/:id', protect, admin, authController.approveUser);
router.put('/reject/:id', protect, admin, authController.rejectUser);

export default router;