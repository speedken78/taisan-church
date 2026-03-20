import { Router } from 'express';
import {
  createOffering,
  notifyOffering,
  returnOffering,
  getOfferingRecords,
} from '../controllers/offeringController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/create', createOffering);
router.post('/notify', notifyOffering);   // 藍新非同步通知
router.post('/return', returnOffering);   // 藍新同步回傳

router.get('/admin/records', protect, getOfferingRecords);

export default router;
