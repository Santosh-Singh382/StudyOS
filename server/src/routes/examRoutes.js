import { Router } from 'express';
import {
  getAllExams,
  getUpcoming,
  getExam,
  createExamHandler,
  updateExamHandler,
  deleteExamHandler,
  completeExamHandler,
  cancelExamHandler,
  reopenExamHandler,
} from '../controllers/examController.js';
import protect from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.route('/').get(getAllExams).post(createExamHandler);
router.get('/upcoming', getUpcoming);
router.route('/:id').get(getExam).put(updateExamHandler).delete(deleteExamHandler);
router.patch('/:id/complete', completeExamHandler);
router.patch('/:id/cancel', cancelExamHandler);
router.patch('/:id/reopen', reopenExamHandler);

export default router;