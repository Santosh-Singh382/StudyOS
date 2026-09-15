import {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  completeGoal,
  uncompleteGoal,
  createMilestone,
  getMilestones,
  updateMilestone,
  deleteMilestone,
  completeMilestone,
  uncompleteMilestone,
} from '../services/goalService.js';
import {
  validateGoalCreateInput,
  validateGoalUpdateInput,
} from '../validators/goalValidators.js';
import {
  validateMilestoneCreateInput,
  validateMilestoneUpdateInput,
} from '../validators/milestoneValidators.js';
import { ApiError } from '../utils/ApiError.js';

export async function getAllGoals(req, res, next) {
  try {
    const goals = await getGoals(req.user._id, req.query);
    res.status(200).json({ success: true, message: 'Goals retrieved successfully.', goals });
  } catch (error) {
    next(error);
  }
}

export async function getGoal(req, res, next) {
  try {
    const goal = await getGoalById(req.user._id, req.params.id);
    res.status(200).json({ success: true, message: 'Goal retrieved successfully.', goal });
  } catch (error) {
    next(error);
  }
}

export async function createGoalHandler(req, res, next) {
  try {
    const { errors, values } = validateGoalCreateInput(req.body);
    if (Object.keys(errors).length > 0) {
      throw new ApiError(400, 'Please fix the validation errors below.', errors);
    }
    const goal = await createGoal(req.user._id, values);
    res.status(201).json({ success: true, message: 'Goal created successfully.', goal });
  } catch (error) {
    next(error);
  }
}

export async function updateGoalHandler(req, res, next) {
  try {
    const { errors, values } = validateGoalUpdateInput(req.body);
    if (Object.keys(errors).length > 0) {
      throw new ApiError(400, 'Please fix the validation errors below.', errors);
    }
    const goal = await updateGoal(req.user._id, req.params.id, values);
    res.status(200).json({ success: true, message: 'Goal updated successfully.', goal });
  } catch (error) {
    next(error);
  }
}

export async function deleteGoalHandler(req, res, next) {
  try {
    const result = await deleteGoal(req.user._id, req.params.id);
    res.status(200).json({ success: true, message: 'Goal deleted successfully.', ...result });
  } catch (error) {
    next(error);
  }
}

export async function completeGoalHandler(req, res, next) {
  try {
    const goal = await completeGoal(req.user._id, req.params.id);
    res.status(200).json({ success: true, message: 'Goal completed.', goal });
  } catch (error) {
    next(error);
  }
}

export async function uncompleteGoalHandler(req, res, next) {
  try {
    const goal = await uncompleteGoal(req.user._id, req.params.id);
    res.status(200).json({ success: true, message: 'Goal reopened.', goal });
  } catch (error) {
    next(error);
  }
}

export async function getAllMilestones(req, res, next) {
  try {
    const milestones = await getMilestones(req.user._id, req.params.goalId);
    res.status(200).json({ success: true, message: 'Milestones retrieved successfully.', milestones });
  } catch (error) {
    next(error);
  }
}

export async function createMilestoneHandler(req, res, next) {
  try {
    const { errors, values } = validateMilestoneCreateInput(req.body);
    if (Object.keys(errors).length > 0) {
      throw new ApiError(400, 'Please fix the validation errors below.', errors);
    }
    const milestone = await createMilestone(req.user._id, req.params.goalId, values);
    res.status(201).json({ success: true, message: 'Milestone created successfully.', milestone });
  } catch (error) {
    next(error);
  }
}

export async function updateMilestoneHandler(req, res, next) {
  try {
    const { errors, values } = validateMilestoneUpdateInput(req.body);
    if (Object.keys(errors).length > 0) {
      throw new ApiError(400, 'Please fix the validation errors below.', errors);
    }
    const milestone = await updateMilestone(req.user._id, req.params.milestoneId, values);
    res.status(200).json({ success: true, message: 'Milestone updated successfully.', milestone });
  } catch (error) {
    next(error);
  }
}

export async function deleteMilestoneHandler(req, res, next) {
  try {
    const result = await deleteMilestone(req.user._id, req.params.milestoneId);
    res.status(200).json({ success: true, message: 'Milestone deleted successfully.', ...result });
  } catch (error) {
    next(error);
  }
}

export async function completeMilestoneHandler(req, res, next) {
  try {
    const milestone = await completeMilestone(req.user._id, req.params.milestoneId);
    res.status(200).json({ success: true, message: 'Milestone completed.', milestone });
  } catch (error) {
    next(error);
  }
}

export async function uncompleteMilestoneHandler(req, res, next) {
  try {
    const milestone = await uncompleteMilestone(req.user._id, req.params.milestoneId);
    res.status(200).json({ success: true, message: 'Milestone reopened.', milestone });
  } catch (error) {
    next(error);
  }
}

export async function updateTopMilestoneHandler(req, res, next) {
  try {
    const { errors, values } = validateMilestoneUpdateInput(req.body);
    if (Object.keys(errors).length > 0) {
      throw new ApiError(400, 'Please fix the validation errors below.', errors);
    }
    const milestone = await updateMilestone(req.user._id, req.params.id, values);
    res.status(200).json({ success: true, message: 'Milestone updated successfully.', milestone });
  } catch (error) {
    next(error);
  }
}

export async function deleteTopMilestoneHandler(req, res, next) {
  try {
    const result = await deleteMilestone(req.user._id, req.params.id);
    res.status(200).json({ success: true, message: 'Milestone deleted successfully.', ...result });
  } catch (error) {
    next(error);
  }
}