const { promisePool } = require('../config/database');
const { hashPassword, comparePassword } = require('../config/auth');

class User {
    static async create(userData) {
        const { name, email, studentId, password, phone, role = 'student' } = userData;
        const hashedPassword = await hashPassword(password);
        
        const [result] = await promisePool.query(
            `INSERT INTO users (name, email, student_id, password_hash, phone, role) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, email, studentId, hashedPassword, phone, role]
        );
        
        return result.insertId;
    }

    static async findByEmail(email) {
        const [rows] = await promisePool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await promisePool.query(
            `SELECT id, name, email, student_id, phone, profile_picture, role, 
                    is_verified, created_at 
             FROM users WHERE id = ?`,
            [id]
        );
        return rows[0];
    }

    static async findByStudentId(studentId) {
        const [rows] = await promisePool.query(
            'SELECT * FROM users WHERE student_id = ?',
            [studentId]
        );
        return rows[0];
    }

    static async updateProfile(id, updateData) {
        const fields = [];
        const values = [];
        
        Object.keys(updateData).forEach(key => {
            if (key === 'name') {
                fields.push('name = ?');
                values.push(updateData.name);
            }
            if (key === 'phone') {
                fields.push('phone = ?');
                values.push(updateData.phone);
            }
            if (key === 'profilePicture') {
                fields.push('profile_picture = ?');
                values.push(updateData.profilePicture);
            }
        });
        
        if (fields.length === 0) return null;
        
        values.push(id);
        const [result] = await promisePool.query(
            `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        
        return result.affectedRows > 0;
    }

    static async verifyUser(id) {
        const [result] = await promisePool.query(
            'UPDATE users SET is_verified = TRUE WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    static async updatePassword(id, newPassword) {
        const hashedPassword = await hashPassword(newPassword);
        const [result] = await promisePool.query(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [hashedPassword, id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = User;