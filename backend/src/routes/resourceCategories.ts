import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/resourceCategoryController';
import { protect } from '../middleware/auth';

const router = Router();

// 公開
router.get('/', getCategories);

// CMS（需驗證）
router.post('/', protect, createCategory);
router.put('/:id', protect, updateCategory);
router.delete('/:id', protect, deleteCategory);

export default router;
