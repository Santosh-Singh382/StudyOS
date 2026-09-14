import {
  listTopics,
  getTopicById,
  createTopicForUser,
  updateTopicForUser,
  deleteTopicForUser,
} from '../services/topicService.js';
import {
  validateTopicCreateInput,
  validateTopicUpdateInput,
} from '../validators/topicValidators.js';
import { ApiError } from '../utils/ApiError.js';

export async function getTopics(req, res, next) {
  try {
    const { subject, status, priority, sort } = req.query;
    const topics = await listTopics(req.user._id, { subject, status, priority, sort });

    res.status(200).json({
      success: true,
      message: 'Topics retrieved successfully.',
      topics,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTopic(req, res, next) {
  try {
    const topic = await getTopicById(req.user._id, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Topic retrieved successfully.',
      topic,
    });
  } catch (error) {
    next(error);
  }
}

export async function createTopic(req, res, next) {
  try {
    const { errors, values } = validateTopicCreateInput(req.body);

    if (Object.keys(errors).length > 0) {
      throw new ApiError(400, 'Please fix the validation errors below.', errors);
    }

    const topic = await createTopicForUser(req.user._id, values);

    res.status(201).json({
      success: true,
      message: 'Topic created successfully.',
      topic,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTopic(req, res, next) {
  try {
    const { errors, values } = validateTopicUpdateInput(req.body);

    if (Object.keys(errors).length > 0) {
      throw new ApiError(400, 'Please fix the validation errors below.', errors);
    }

    const topic = await updateTopicForUser(req.user._id, req.params.id, values);

    res.status(200).json({
      success: true,
      message: 'Topic updated successfully.',
      topic,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTopic(req, res, next) {
  try {
    const result = await deleteTopicForUser(req.user._id, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Topic deleted successfully.',
      ...result,
    });
  } catch (error) {
    next(error);
  }
}