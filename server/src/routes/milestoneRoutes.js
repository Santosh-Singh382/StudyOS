import { Router } from 'express';
import { updateTopMilestoneHandler, deleteTopMilestoneHandler } from '../controllers/goalController.js';
import protect from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.route('/:id').put(updateTopMilestoneHandler).delete(deleteTopMilestoneHandler);

export default router;