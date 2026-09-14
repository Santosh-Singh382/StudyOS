import {
  listSubjects,
  getSubjectById,
  createSubjectForUser,
  updateSubjectForUser,
  deleteSubjectForUser,
} from '../services/subjectService.js';
import {
  validateSubjectCreateInput,
  validateSubjectUpdateInput,
} from '../validators/subjectValidators.js';
import { ApiError } from '../utils/ApiError.js';

export async function getAllSubjects(req, res, next) {
  try {
    const { sort } = req.query;
    const subjects = await listSubjects(req.user._id, sort);

    res.status(200).json({
      success: true,
      message: 'Subjects retrieved successfully.',
      subjects,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSubject(req, res, next) {
  try {
    const subject = await getSubjectById(req.user._id, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Subject retrieved successfully.',
      subject,
    });
  } catch (error) {
    next(error);
  }
}

export async function createSubject(req, res, next) {
  try {
    const { errors, values } = validateSubjectCreateInput(req.body);

    if (Object.keys(errors).length > 0) {
      throw new ApiError(400, 'Please fix the validation errors below.', errors);
    }

    const subject = await createSubjectForUser(req.user._id, values);

    res.status(201).json({
      success: true,
      message: 'Subject created successfully.',
      subject,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSubject(req, res, next) {
  try {
    const { errors, values } = validateSubjectUpdateInput(req.body);

    if (Object.keys(errors).length > 0) {
      throw new ApiError(400, 'Please fix the validation errors below.', errors);
    }

    const subject = await updateSubjectForUser(req.user._id, req.params.id, values);

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully.',
      subject,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteSubject(req, res, next) {
  try {
    const result = await deleteSubjectForUser(req.user._id, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully.',
      ...result,
    });
  } catch (error) {
    next(error);
  }
}