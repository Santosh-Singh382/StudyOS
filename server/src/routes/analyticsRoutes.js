import { Router } from 'express';
import { getDashboardHandler } from '../controllers/dashboardController.js';
import protect from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/dashboard', getDashboardHandler);

export default router;