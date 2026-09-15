import { getDashboard } from '../services/dashboardService.js';

export async function getDashboardHandler(req, res, next) {
  try {
    const dashboard = await getDashboard(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Dashboard retrieved successfully.',
      dashboard,
    });
  } catch (error) {
    next(error);
  }
}