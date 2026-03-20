import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  getOpenForms,
  getFormById,
  submitForm,
  getAllForms,
  createForm,
  updateForm,
  deleteForm,
  getFormSubmissions,
  exportSubmissionsCsv,
} from '../controllers/formController';
import { protect } from '../middleware/auth';

const router = Router();

// 每個 IP 每分鐘最多送出 5 次報名
const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: '送出次數過多，請稍後再試' },
});

// CMS（需驗證） — 必須在 /:id 之前，避免被動態路由攔截
router.get('/admin/all', protect, getAllForms);
// 公開
router.get('/', getOpenForms);
router.get('/:id', getFormById);
router.post('/:id/submit', submitLimiter, submitForm);

router.post('/', protect, createForm);
router.put('/:id', protect, updateForm);
router.delete('/:id', protect, deleteForm);
router.get('/:id/submissions', protect, getFormSubmissions);
router.get('/:id/submissions/export', protect, exportSubmissionsCsv);

export default router;
