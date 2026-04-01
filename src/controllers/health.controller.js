const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Campus Care API is running',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
};

const echoName = (req, res) => {
  res.status(200).json({
    success: true,
    message: `Hello, ${req.body.name}`,
  });
};

export { getHealth, echoName };
