import { Router } from 'express';
import { getDay, getWeek, getOverview } from '../controllers/plannerController.js';
import protect from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/day', getDay);
router.get('/week', getWeek);
router.get('/overview', getOverview);

export default router;