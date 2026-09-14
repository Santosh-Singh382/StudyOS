import {
  registerUser,
  loginUser,
  getCurrentUser,
} from '../services/authService.js';
import {
  validateRegisterInput,
  validateLoginInput,
} from '../validators/authValidators.js';
import { ApiError } from '../utils/ApiError.js';

export async function register(req, res, next) {
  try {
    const { errors, values } = validateRegisterInput(req.body);

    if (Object.keys(errors).length > 0) {
      throw new ApiError(400, 'Please fix the validation errors below.', errors);
    }

    const { user, token } = await registerUser(values);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { errors, values } = validateLoginInput(req.body);

    if (Object.keys(errors).length > 0) {
      throw new ApiError(400, 'Please fix the validation errors below.', errors);
    }

    const { user, token } = await loginUser(values);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await getCurrentUser(req.user._id);

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully.',
      user,
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    // Token strategy is client-held; tokens are stateless JWTs.
    // The client discards the token to complete logout.
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
}