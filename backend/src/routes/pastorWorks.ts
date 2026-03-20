import { Router } from 'express';
import {
  getActiveWorks,
  getAllWorks,
  createWork,
  updateWork,
  deleteWork,
} from '../controllers/pastorWorkController';
import { protect } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', getActiveWorks);

router.get('/admin/all', protect, getAllWorks);
router.post('/', protect, upload.single('coverImage'), createWork);
router.put('/:id', protect, updateWork);
router.delete('/:id', protect, deleteWork);

export default router;
