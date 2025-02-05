import express from 'express';
import { getProfile, getAllUsers } from '../controllers/userController';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

// Lấy thông tin user (yêu cầu xác thực)
router.get('/profile', authMiddleware, getProfile as any);

// Lấy danh sách tất cả user (không cần xác thực)
router.get('/all', getAllUsers as any);

export default router;
