import { Router } from 'express';
import {
  getPublishedResources,
  downloadResource,
  getAllResources,
  createResource,
  updateResource,
  deleteResource,
} from '../controllers/resourceController';
import { protect } from '../middleware/auth';
import { uploadDocument } from '../middleware/upload';

const router = Router();

// 公開
router.get('/', getPublishedResources);
router.get('/:id/download', downloadResource);

// CMS（需驗證）
router.get('/admin/all', protect, getAllResources);
router.post('/', protect, uploadDocument.single('file'), createResource);
router.put('/:id', protect, updateResource);
router.delete('/:id', protect, deleteResource);

export default router;
