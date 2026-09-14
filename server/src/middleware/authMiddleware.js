import { verifyToken } from '../services/jwtService.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

export default async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Please log in to access this resource.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new ApiError(401, 'User no longer exists. Please log in again.');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}