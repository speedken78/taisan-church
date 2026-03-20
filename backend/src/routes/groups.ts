import { Router } from 'express';
import {
  getActiveGroups,
  getAllGroups,
  createGroup,
  updateGroup,
  deleteGroup,
} from '../controllers/groupController';
import { protect } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', getActiveGroups);

router.get('/admin/all', protect, getAllGroups);
router.post('/', protect, upload.single('image'), createGroup);
router.put('/:id', protect, updateGroup);
router.delete('/:id', protect, deleteGroup);

export default router;
