import {
  createStudySession,
  getStudySessions,
  getStudySessionById,
  getTodayStudySessions,
  getWeeklyStudySessions,
  pauseStudySession,
  resumeStudySession,
  completeStudySession,
  cancelStudySession,
} from '../services/studySessionService.js';
import { validateStudySessionCreateInput } from '../validators/studySessionValidators.js';
import { ApiError } from '../utils/ApiError.js';

export async function getAllStudySessions(req, res, next) {
  try {
    const sessions = await getStudySessions(req.user._id, req.query);

    res.status(200).json({
      success: true,
      message: 'Study sessions retrieved successfully.',
      sessions,
    });
  } catch (error) {
    next(error);
  }
}

export async function getStudySession(req, res, next) {
  try {
    const session = await getStudySessionById(req.user._id, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Study session retrieved successfully.',
      session,
    });
  } catch (error) {
    next(error);
  }
}

export async function getToday(req, res, next) {
  try {
    const result = await getTodayStudySessions(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Today study sessions retrieved successfully.',
      date: result.date,
      sessions: result.sessions,
      summary: result.summary,
    });
  } catch (error) {
    next(error);
  }
}

export async function getWeekly(req, res, next) {
  try {
    const result = await getWeeklyStudySessions(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Weekly study sessions retrieved successfully.',
      startDate: result.startDate,
      sessions: result.sessions,
      summary: result.summary,
    });
  } catch (error) {
    next(error);
  }
}

export async function createStudySessionHandler(req, res, next) {
  try {
    const { errors, values } = validateStudySessionCreateInput(req.body);

    if (Object.keys(errors).length > 0) {
      throw new ApiError(400, 'Please fix the validation errors below.', errors);
    }

    const session = await createStudySession(req.user._id, values);

    res.status(201).json({
      success: true,
      message: 'Study session started.',
      session,
    });
  } catch (error) {
    next(error);
  }
}

export async function pause(req, res, next) {
  try {
    const session = await pauseStudySession(req.user._id, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Study session paused.',
      session,
    });
  } catch (error) {
    next(error);
  }
}

export async function resume(req, res, next) {
  try {
    const session = await resumeStudySession(req.user._id, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Study session resumed.',
      session,
    });
  } catch (error) {
    next(error);
  }
}

export async function complete(req, res, next) {
  try {
    const session = await completeStudySession(req.user._id, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Study session completed.',
      session,
    });
  } catch (error) {
    next(error);
  }
}

export async function cancel(req, res, next) {
  try {
    const session = await cancelStudySession(req.user._id, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Study session cancelled.',
      session,
    });
  } catch (error) {
    next(error);
  }
}