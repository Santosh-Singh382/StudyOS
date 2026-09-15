import {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
  completeExam,
  cancelExam,
  reopenExam,
} from '../services/examService.js';
import {
  validateExamCreateInput,
  validateExamUpdateInput,
} from '../validators/examValidators.js';
import { ApiError } from '../utils/ApiError.js';

export async function getAllExams(req, res, next) {
  try {
    const exams = await getExams(req.user._id, req.query);
    res.status(200).json({ success: true, message: 'Exams retrieved successfully.', exams });
  } catch (error) {
    next(error);
  }
}

export async function getUpcoming(req, res, next) {
  try {
    const exams = await getExams(req.user._id, { status: 'UPCOMING' });
    res.status(200).json({ success: true, message: 'Upcoming exams retrieved.', exams });
  } catch (error) {
    next(error);
  }
}

export async function getExam(req, res, next) {
  try {
    const exam = await getExamById(req.user._id, req.params.id);
    res.status(200).json({ success: true, message: 'Exam retrieved successfully.', exam });
  } catch (error) {
    next(error);
  }
}

export async function createExamHandler(req, res, next) {
  try {
    const { errors, values } = validateExamCreateInput(req.body);
    if (Object.keys(errors).length > 0) {
      throw new ApiError(400, 'Please fix the validation errors below.', errors);
    }
    const exam = await createExam(req.user._id, values);
    res.status(201).json({ success: true, message: 'Exam created successfully.', exam });
  } catch (error) {
    next(error);
  }
}

export async function updateExamHandler(req, res, next) {
  try {
    const { errors, values } = validateExamUpdateInput(req.body);
    if (Object.keys(errors).length > 0) {
      throw new ApiError(400, 'Please fix the validation errors below.', errors);
    }
    const exam = await updateExam(req.user._id, req.params.id, values);
    res.status(200).json({ success: true, message: 'Exam updated successfully.', exam });
  } catch (error) {
    next(error);
  }
}

export async function deleteExamHandler(req, res, next) {
  try {
    const result = await deleteExam(req.user._id, req.params.id);
    res.status(200).json({ success: true, message: 'Exam deleted successfully.', ...result });
  } catch (error) {
    next(error);
  }
}

export async function completeExamHandler(req, res, next) {
  try {
    const exam = await completeExam(req.user._id, req.params.id);
    res.status(200).json({ success: true, message: 'Exam completed.', exam });
  } catch (error) {
    next(error);
  }
}

export async function cancelExamHandler(req, res, next) {
  try {
    const exam = await cancelExam(req.user._id, req.params.id);
    res.status(200).json({ success: true, message: 'Exam cancelled.', exam });
  } catch (error) {
    next(error);
  }
}

export async function reopenExamHandler(req, res, next) {
  try {
    const exam = await reopenExam(req.user._id, req.params.id);
    res.status(200).json({ success: true, message: 'Exam reopened.', exam });
  } catch (error) {
    next(error);
  }
}