import AppError from '../utils/AppError.js';
import { verifyToken } from '../utils/jwt.js';
import { findUserById } from '../models/user.model.js';

const authenticate = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization || '';
    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new AppError('Authentication token is required', 401);
    }

    const payload = verifyToken(token);
    const user = await findUserById(payload.sub);

    if (!user) {
      throw new AppError('User not found', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error.statusCode ? error : new AppError('Invalid or expired token', 401));
  }
};

export default authenticate;
