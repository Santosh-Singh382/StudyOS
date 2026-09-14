import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  completeTask,
  uncompleteTask,
} from '../services/taskService.js';
import {
  validateTaskCreateInput,
  validateTaskUpdateInput,
} from '../validators/taskValidators.js';
import { ApiError } from '../utils/ApiError.js';

export async function getAllTasks(req, res, next) {
  try {
    const tasks = await getTasks(req.user._id, req.query);

    res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully.',
      tasks,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTask(req, res, next) {
  try {
    const task = await getTaskById(req.user._id, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task retrieved successfully.',
      task,
    });
  } catch (error) {
    next(error);
  }
}

export async function createTaskHandler(req, res, next) {
  try {
    const { errors, values } = validateTaskCreateInput(req.body);

    if (Object.keys(errors).length > 0) {
      throw new ApiError(400, 'Please fix the validation errors below.', errors);
    }

    const task = await createTask(req.user._id, values);

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTaskHandler(req, res, next) {
  try {
    const { errors, values } = validateTaskUpdateInput(req.body);

    if (Object.keys(errors).length > 0) {
      throw new ApiError(400, 'Please fix the validation errors below.', errors);
    }

    const task = await updateTask(req.user._id, req.params.id, values);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      task,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTaskHandler(req, res, next) {
  try {
    const result = await deleteTask(req.user._id, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function complete(req, res, next) {
  try {
    const task = await completeTask(req.user._id, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task completed.',
      task,
    });
  } catch (error) {
    next(error);
  }
}

export async function uncomplete(req, res, next) {
  try {
    const task = await uncompleteTask(req.user._id, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task reopened.',
      task,
    });
  } catch (error) {
    next(error);
  }
}