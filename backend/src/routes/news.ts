import { Router } from 'express';
import {
  getPublishedNews,
  getNewsById,
  getAllNews,
  createNews,
  updateNews,
  deleteNews,
} from '../controllers/newsController';
import { protect } from '../middleware/auth';

const router = Router();

// 公開
router.get('/', getPublishedNews);
router.get('/:id', getNewsById);

// CMS（需驗證）
router.get('/admin/all', protect, getAllNews);
router.post('/', protect, createNews);
router.put('/:id', protect, updateNews);
router.delete('/:id', protect, deleteNews);

export default router;
