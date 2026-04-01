const allowedRoles = ['student', 'counselor', 'admin'];

const validateRegister = (req) => {
  const errors = [];
  const { name, email, password, role = 'student' } = req.body;

  if (typeof name !== 'string' || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
  }

  if (typeof email !== 'string' || !email.includes('@')) {
    errors.push({ field: 'email', message: 'A valid email is required' });
  }

  if (typeof password !== 'string' || password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
  }

  if (!allowedRoles.includes(role)) {
    errors.push({ field: 'role', message: 'Role must be student, counselor, or admin' });
  }

  return {
    success: errors.length === 0,
    errors,
  };
};

const validateLogin = (req) => {
  const errors = [];
  const { email, password } = req.body;

  if (typeof email !== 'string' || !email.includes('@')) {
    errors.push({ field: 'email', message: 'A valid email is required' });
  }

  if (typeof password !== 'string' || password.length === 0) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return {
    success: errors.length === 0,
    errors,
  };
};

export { validateRegister, validateLogin };
