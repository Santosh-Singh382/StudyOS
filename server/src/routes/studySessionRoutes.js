import { Router } from 'express';
import {
  getAllStudySessions,
  getStudySession,
  getToday,
  getWeekly,
  createStudySessionHandler,
  pause,
  resume,
  complete,
  cancel,
} from '../controllers/studySessionController.js';
import protect from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.route('/').get(getAllStudySessions).post(createStudySessionHandler);
router.get('/today', getToday);
router.get('/weekly', getWeekly);
router.patch('/:id/pause', pause);
router.patch('/:id/resume', resume);
router.patch('/:id/complete', complete);
router.patch('/:id/cancel', cancel);
router.route('/:id').get(getStudySession);

export default router;