import { Router } from 'express';
import {
  getTopics,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
} from '../controllers/topicController.js';
import protect from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.route('/').get(getTopics).post(createTopic);
router.route('/:id').get(getTopic).put(updateTopic).delete(deleteTopic);

export default router;