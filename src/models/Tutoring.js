const { promisePool } = require('../config/database');

class Tutoring {
    static async createTutorProfile(userId, profileData) {
        const {
            subject, specialization, qualification,
            experienceYears, hourlyRate, bio
        } = profileData;

        const [result] = await promisePool.query(
            `INSERT INTO tutors 
             (user_id, subject, specialization, qualification, 
              experience_years, hourly_rate, bio)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, subject, specialization, qualification,
             experienceYears, hourlyRate, bio]
        );

        return result.insertId;
    }

    static async getTutorProfile(userId) {
        const [rows] = await promisePool.query(
            `SELECT t.*, u.name, u.email, u.profile_picture 
             FROM tutors t
             JOIN users u ON t.user_id = u.id
             WHERE t.user_id = ?`,
            [userId]
        );
        return rows[0];
    }

    static async getAllTutors(filters = {}) {
        let query = `
            SELECT t.*, u.name, u.email, u.profile_picture,
                   (SELECT AVG(rating) FROM reviews WHERE tutor_id = t.id) as avg_rating
            FROM tutors t
            JOIN users u ON t.user_id = u.id
            WHERE t.is_available = TRUE
        `;
        const params = [];

        if (filters.subject) {
            query += ' AND t.subject LIKE ?';
            params.push(`%${filters.subject}%`);
        }

        if (filters.minRating) {
            query += ' HAVING avg_rating >= ?';
            params.push(filters.minRating);
        }

        if (filters.maxPrice) {
            query += ' AND t.hourly_rate <= ?';
            params.push(filters.maxPrice);
        }

        query += ' ORDER BY t.rating DESC, t.total_sessions DESC';
        query += ' LIMIT ? OFFSET ?';
        params.push(filters.limit || 20, filters.offset || 0);

        const [rows] = await promisePool.query(query, params);
        return rows;
    }

    static async getTutorById(tutorId) {
        const [rows] = await promisePool.query(
            `SELECT t.*, u.name, u.email, u.profile_picture,
                    (SELECT COUNT(*) FROM tutoring_sessions WHERE tutor_id = t.id AND status = 'completed') as total_sessions,
                    (SELECT AVG(rating) FROM reviews WHERE tutor_id = t.id) as avg_rating
             FROM tutors t
             JOIN users u ON t.user_id = u.id
             WHERE t.id = ?`,
            [tutorId]
        );
        return rows[0];
    }

    static async createSession(sessionData) {
        const {
            tutorId, studentId, subject, sessionDate,
            startTime, endTime, durationHours, totalPrice,
            locationType, locationDetails, notes
        } = sessionData;

        const [result] = await promisePool.query(
            `INSERT INTO tutoring_sessions 
             (tutor_id, student_id, subject, session_date, start_time, end_time,
              duration_hours, total_price, location_type, location_details, notes, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [tutorId, studentId, subject, sessionDate, startTime, endTime,
             durationHours, totalPrice, locationType, locationDetails, notes]
        );

        return result.insertId;
    }

    static async getStudentSessions(studentId) {
        const [rows] = await promisePool.query(
            `SELECT ts.*, t.subject, t.hourly_rate, u.name as tutor_name
             FROM tutoring_sessions ts
             JOIN tutors t ON ts.tutor_id = t.id
             JOIN users u ON t.user_id = u.id
             WHERE ts.student_id = ?
             ORDER BY ts.session_date DESC, ts.start_time DESC`,
            [studentId]
        );
        return rows;
    }

    static async getTutorSessions(tutorId) {
        const [rows] = await promisePool.query(
            `SELECT ts.*, u.name as student_name
             FROM tutoring_sessions ts
             JOIN users u ON ts.student_id = u.id
             WHERE ts.tutor_id = ?
             ORDER BY ts.session_date DESC, ts.start_time DESC`,
            [tutorId]
        );
        return rows;
    }

    static async updateSessionStatus(sessionId, status, userId, isTutor = false) {
        let query = 'UPDATE tutoring_sessions SET status = ?';
        const params = [status];

        if (isTutor) {
            query += ' WHERE id = ? AND tutor_id = (SELECT id FROM tutors WHERE user_id = ?)';
            params.push(sessionId, userId);
        } else {
            query += ' WHERE id = ? AND student_id = ?';
            params.push(sessionId, userId);
        }

        const [result] = await promisePool.query(query, params);
        return result.affectedRows > 0;
    }

    static async addReview(reviewData) {
        const { reviewerId, tutorId, rating, comment } = reviewData;

        const [result] = await promisePool.query(
            `INSERT INTO reviews (reviewer_id, tutor_id, rating, comment)
             VALUES (?, ?, ?, ?)`,
            [reviewerId, tutorId, rating, comment]
        );

        // Update tutor rating
        await promisePool.query(
            `UPDATE tutors t
             SET t.rating = (
                 SELECT AVG(rating) FROM reviews WHERE tutor_id = ?
             )
             WHERE t.id = ?`,
            [tutorId, tutorId]
        );

        return result.insertId;
    }
}

module.exports = Tutoring;