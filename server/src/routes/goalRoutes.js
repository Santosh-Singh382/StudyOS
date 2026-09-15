import { Router } from 'express';
import {
  getAllGoals,
  getGoal,
  createGoalHandler,
  updateGoalHandler,
  deleteGoalHandler,
  completeGoalHandler,
  uncompleteGoalHandler,
  getAllMilestones,
  createMilestoneHandler,
  updateMilestoneHandler,
  deleteMilestoneHandler,
  completeMilestoneHandler,
  uncompleteMilestoneHandler,
} from '../controllers/goalController.js';
import protect from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.route('/').get(getAllGoals).post(createGoalHandler);
router.route('/:id').get(getGoal).put(updateGoalHandler).delete(deleteGoalHandler);
router.patch('/:id/complete', completeGoalHandler);
router.patch('/:id/uncomplete', uncompleteGoalHandler);

router.route('/:goalId/milestones').get(getAllMilestones).post(createMilestoneHandler);
router.route('/:goalId/milestones/:milestoneId').put(updateMilestoneHandler).delete(deleteMilestoneHandler);
router.patch('/:goalId/milestones/:milestoneId/complete', completeMilestoneHandler);
router.patch('/:goalId/milestones/:milestoneId/uncomplete', uncompleteMilestoneHandler);

export default router;