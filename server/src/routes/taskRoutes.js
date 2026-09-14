import { Router } from 'express';
import {
  getAllTasks,
  getTask,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
  complete,
  uncomplete,
} from '../controllers/taskController.js';
import protect from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.route('/').get(getAllTasks).post(createTaskHandler);
router.route('/:id').get(getTask).put(updateTaskHandler).delete(deleteTaskHandler);
router.patch('/:id/complete', complete);
router.patch('/:id/uncomplete', uncomplete);

export default router;