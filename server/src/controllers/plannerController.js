import { getDayPlanner, getWeekPlanner, getPlannerOverview } from '../services/plannerService.js';

export async function getDay(req, res, next) {
  try {
    const data = await getDayPlanner(req.user._id, req.query.date);
    if (!data) {
      return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD.' });
    }
    res.status(200).json({ success: true, message: 'Day planner retrieved.', day: data });
  } catch (error) {
    next(error);
  }
}

export async function getWeek(req, res, next) {
  try {
    const data = await getWeekPlanner(req.user._id, req.query.startDate);
    if (!data) {
      return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD.' });
    }
    res.status(200).json({ success: true, message: 'Week planner retrieved.', week: data });
  } catch (error) {
    next(error);
  }
}

export async function getOverview(req, res, next) {
  try {
    const data = await getPlannerOverview(req.user._id);
    res.status(200).json({ success: true, message: 'Planner overview retrieved.', overview: data });
  } catch (error) {
    next(error);
  }
}