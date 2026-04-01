const validateNamePayload = (req) => {
  const errors = [];
  const { name } = req.body;

  if (typeof name !== 'string' || name.trim().length < 2) {
    errors.push({
      field: 'name',
      message: 'Name must be a string with at least 2 characters',
    });
  }

  return {
    success: errors.length === 0,
    errors,
  };
};

export { validateNamePayload };
