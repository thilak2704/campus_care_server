const validateProfileUpdate = (req) => {
  const errors = [];
  const { name, email } = req.body;

  if (typeof name !== 'string' || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
  }

  if (typeof email !== 'string' || !email.includes('@')) {
    errors.push({ field: 'email', message: 'A valid email is required' });
  }

  return {
    success: errors.length === 0,
    errors,
  };
};

const validatePasswordUpdate = (req) => {
  const errors = [];
  const { currentPassword, newPassword } = req.body;

  if (typeof currentPassword !== 'string' || currentPassword.length === 0) {
    errors.push({ field: 'currentPassword', message: 'Current password is required' });
  }

  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    errors.push({ field: 'newPassword', message: 'New password must be at least 6 characters long' });
  }

  return {
    success: errors.length === 0,
    errors,
  };
};

export { validateProfileUpdate, validatePasswordUpdate };
