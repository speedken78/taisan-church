import { Router } from 'express';
import {
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/bannerController';
import { protect } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', getActiveBanners);

router.get('/admin/all', protect, getAllBanners);
router.post('/', protect, upload.single('image'), createBanner);
router.put('/:id', protect, updateBanner);
router.delete('/:id', protect, deleteBanner);

export default router;
