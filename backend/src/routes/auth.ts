import { Router } from 'express';
import { login, register, changePassword } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/register', protect, register);         // 需登入才能新增管理員
router.post('/change-password', protect, changePassword); // 需登入才能修改密碼

export default router;
