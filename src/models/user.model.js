import pool from '../config/db.js';

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

const findUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
};

const findUserById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

const createUser = async ({ name, email, passwordHash, role }) => {
  const [result] = await pool.query(
    `
      INSERT INTO users (name, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `,
    [name, email, passwordHash, role]
  );

  return findUserById(result.insertId);
};

const updateUserProfile = async ({ id, name, email }) => {
  await pool.query(
    `
      UPDATE users
      SET name = ?, email = ?
      WHERE id = ?
    `,
    [name, email, id]
  );

  return findUserById(id);
};

const updateUserPassword = async ({ id, passwordHash }) => {
  await pool.query(
    `
      UPDATE users
      SET password_hash = ?
      WHERE id = ?
    `,
    [passwordHash, id]
  );

  return findUserById(id);
};

export {
  sanitizeUser,
  findUserByEmail,
  findUserById,
  createUser,
  updateUserProfile,
  updateUserPassword,
};
