import pool from '../config/db.js';
import env from '../config/env.js';
import AppError from '../utils/AppError.js';

const ensureDatabaseReady = async () => {
  await pool.query('SELECT 1');

  const [tables] = await pool.query(
    `
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ?
      AND TABLE_NAME = 'users'
      LIMIT 1
    `,
    [env.dbName]
  );

  if (tables.length === 0) {
    throw new AppError(
      'Database is connected but the users table is missing. Import server/sql/schema.sql into MAMP first.',
      500
    );
  }
};

export { ensureDatabaseReady };
