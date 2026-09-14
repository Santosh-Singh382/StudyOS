import { Router } from 'express';
import {
  getAllSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../controllers/subjectController.js';
import protect from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.route('/').get(getAllSubjects).post(createSubject);
router.route('/:id').get(getSubject).put(updateSubject).delete(deleteSubject);

export default router;