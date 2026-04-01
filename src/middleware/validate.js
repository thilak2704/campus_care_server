import AppError from '../utils/AppError.js';

const validate = (validator) => (req, res, next) => {
  const result = validator(req);

  if (!result || result.success) {
    return next();
  }

  return next(new AppError('Validation failed', 400, result.errors || []));
};

export default validate;
