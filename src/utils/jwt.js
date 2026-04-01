import jwt from 'jsonwebtoken';

import env from '../config/env.js';

const signToken = (payload) =>
  jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

export { signToken, verifyToken };
