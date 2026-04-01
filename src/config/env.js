import dotenv from 'dotenv';

dotenv.config();

const requiredInProduction = [
  'PORT',
  'CLIENT_URL',
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_NAME',
  'JWT_SECRET',
];

if (process.env.NODE_ENV === 'production') {
  const missing = requiredInProduction.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: Number(process.env.DB_PORT) || 8889,
  dbUser: process.env.DB_USER || 'root',
  dbPassword: process.env.DB_PASSWORD || 'root',
  dbName: process.env.DB_NAME || 'campus_care',
  jwtSecret: process.env.JWT_SECRET || 'change-this-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

export default env;
