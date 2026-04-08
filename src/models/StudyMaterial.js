const { promisePool } = require('../config/database');

class StudyMaterial {
    static async create(materialData) {
        const {
            userId, title, description, subject, courseCode,
            type, fileUrl, fileSize, isFree, price
        } = materialData;

        const [result] = await promisePool.query(
            `INSERT INTO study_materials 
             (user_id, title, description, subject, course_code, type,
              file_url, file_size, is_free, price, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
            [userId, title, description, subject, courseCode,
             type, fileUrl, fileSize, isFree, price || 0]
        );

        return result.insertId;
    }

    static async getAll(filters = {}) {
        let query = `
            SELECT sm.*, u.name as author_name, u.profile_picture,
                   (SELECT AVG(rating) FROM reviews WHERE material_id = sm.id) as avg_rating
            FROM study_materials sm
            JOIN users u ON sm.user_id = u.id
            WHERE sm.status = 'active'
        `;
        const params = [];

        if (filters.subject) {
            query += ' AND sm.subject = ?';
            params.push(filters.subject);
        }

        if (filters.type) {
            query += ' AND sm.type = ?';
            params.push(filters.type);
        }

        if (filters.courseCode) {
            query += ' AND sm.course_code LIKE ?';
            params.push(`%${filters.courseCode}%`);
        }

        if (filters.search) {
            query += ' AND MATCH(sm.title, sm.description) AGAINST(?)';
            params.push(filters.search);
        }

        if (filters.isFree !== undefined) {
            query += ' AND sm.is_free = ?';
            params.push(filters.isFree);
        }

        query += ' ORDER BY sm.downloads_count DESC, sm.created_at DESC';
        query += ' LIMIT ? OFFSET ?';
        params.push(filters.limit || 20, filters.offset || 0);

        const [rows] = await promisePool.query(query, params);
        return rows;
    }

    static async getById(materialId) {
        const [rows] = await promisePool.query(
            `SELECT sm.*, u.name as author_name, u.email, u.profile_picture,
                    (SELECT AVG(rating) FROM reviews WHERE material_id = sm.id) as avg_rating,
                    (SELECT COUNT(*) FROM reviews WHERE material_id = sm.id) as review_count
             FROM study_materials sm
             JOIN users u ON sm.user_id = u.id
             WHERE sm.id = ?`,
            [materialId]
        );
        return rows[0];
    }

    static async incrementDownloads(materialId) {
        const [result] = await promisePool.query(
            'UPDATE study_materials SET downloads_count = downloads_count + 1 WHERE id = ?',
            [materialId]
        );
        return result.affectedRows > 0;
    }

    static async getUserMaterials(userId) {
        const [rows] = await promisePool.query(
            `SELECT sm.*, 
                    (SELECT AVG(rating) FROM reviews WHERE material_id = sm.id) as avg_rating
             FROM study_materials sm
             WHERE sm.user_id = ?
             ORDER BY sm.created_at DESC`,
            [userId]
        );
        return rows;
    }

    static async delete(materialId, userId) {
        const [result] = await promisePool.query(
            'DELETE FROM study_materials WHERE id = ? AND user_id = ?',
            [materialId, userId]
        );
        return result.affectedRows > 0;
    }

    static async addReview(reviewData) {
        const { reviewerId, materialId, rating, comment } = reviewData;

        const [result] = await promisePool.query(
            `INSERT INTO reviews (reviewer_id, material_id, rating, comment)
             VALUES (?, ?, ?, ?)`,
            [reviewerId, materialId, rating, comment]
        );

        // Update material rating
        await promisePool.query(
            `UPDATE study_materials sm
             SET sm.rating = (
                 SELECT AVG(rating) FROM reviews WHERE material_id = ?
             )
             WHERE sm.id = ?`,
            [materialId, materialId]
        );

        return result.insertId;
    }

    static async getSubjects() {
        const [rows] = await promisePool.query(
            'SELECT DISTINCT subject FROM study_materials WHERE status = "active" ORDER BY subject'
        );
        return rows.map(r => r.subject);
    }
}

module.exports = StudyMaterial;