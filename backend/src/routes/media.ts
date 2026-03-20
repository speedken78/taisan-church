import { Router } from 'express';
import {
  getMediaByCategory,
  getAllMedia,
  createMedia,
  updateMedia,
  deleteMedia,
} from '../controllers/mediaController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/category/:category', getMediaByCategory);

router.get('/admin/all', protect, getAllMedia);
router.post('/', protect, createMedia);
router.put('/:id', protect, updateMedia);
router.delete('/:id', protect, deleteMedia);

export default router;
