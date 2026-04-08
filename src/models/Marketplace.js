const { promisePool } = require('../config/database');

const normalizeListingImages = (listing) => {
    if (!listing) {
        return listing;
    }

    try {
        return {
            ...listing,
            images: listing.images ? JSON.parse(listing.images) : []
        };
    } catch (error) {
        return {
            ...listing,
            images: []
        };
    }
};

class Marketplace {
    static async getAllCategories() {
        const [rows] = await promisePool.query(
            'SELECT * FROM categories ORDER BY name'
        );
        return rows;
    }

    static async createListing(listingData) {
        const {
            sellerId, categoryId, title, description, price,
            condition, images, location, isNegotiable
        } = listingData;

        const [result] = await promisePool.query(
            `INSERT INTO listings 
             (seller_id, category_id, title, description, price, 
              \`condition\`, images, location, is_negotiable, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
            [sellerId, categoryId, title, description, price,
             condition, JSON.stringify(images || []), location, isNegotiable || false]
        );

        return result.insertId;
    }

    static async getListings(filters = {}) {
        let query = `
            SELECT l.*, u.name as seller_name, u.email, c.name as category_name,
                   (SELECT AVG(rating) FROM reviews WHERE listing_id = l.id) as avg_rating
            FROM listings l
            JOIN users u ON l.seller_id = u.id
            JOIN categories c ON l.category_id = c.id
            WHERE l.status = 'active'
        `;
        const params = [];

        if (filters.categoryId) {
            query += ' AND l.category_id = ?';
            params.push(filters.categoryId);
        }

        if (filters.minPrice) {
            query += ' AND l.price >= ?';
            params.push(filters.minPrice);
        }

        if (filters.maxPrice) {
            query += ' AND l.price <= ?';
            params.push(filters.maxPrice);
        }

        if (filters.search) {
            query += ' AND MATCH(l.title, l.description) AGAINST(?)';
            params.push(filters.search);
        }

        query += ' ORDER BY l.created_at DESC';
        query += ' LIMIT ? OFFSET ?';
        params.push(filters.limit || 20, filters.offset || 0);

        const [rows] = await promisePool.query(query, params);
        return rows.map(normalizeListingImages);
    }

    static async getListingById(listingId) {
        const [rows] = await promisePool.query(
            `SELECT l.*, u.name as seller_name, u.email, u.phone, c.name as category_name,
                    (SELECT AVG(rating) FROM reviews WHERE listing_id = l.id) as avg_rating,
                    (SELECT COUNT(*) FROM reviews WHERE listing_id = l.id) as review_count
             FROM listings l
             JOIN users u ON l.seller_id = u.id
             JOIN categories c ON l.category_id = c.id
             WHERE l.id = ?`,
            [listingId]
        );

        if (rows[0]) {
            // Increment view count
            await promisePool.query(
                'UPDATE listings SET views_count = views_count + 1 WHERE id = ?',
                [listingId]
            );
        }

        return normalizeListingImages(rows[0]);
    }

    static async getUserListings(userId) {
        const [rows] = await promisePool.query(
            `SELECT l.*, c.name as category_name,
                    (SELECT COUNT(*) FROM messages WHERE listing_id = l.id) as message_count
             FROM listings l
             JOIN categories c ON l.category_id = c.id
             WHERE l.seller_id = ?
             ORDER BY l.created_at DESC`,
            [userId]
        );
        return rows.map(normalizeListingImages);
    }

    static async updateListingStatus(listingId, userId, status) {
        const [result] = await promisePool.query(
            'UPDATE listings SET status = ? WHERE id = ? AND seller_id = ?',
            [status, listingId, userId]
        );
        return result.affectedRows > 0;
    }

    static async deleteListing(listingId, userId) {
        const [result] = await promisePool.query(
            'DELETE FROM listings WHERE id = ? AND seller_id = ?',
            [listingId, userId]
        );
        return result.affectedRows > 0;
    }

    static async sendMessage(messageData) {
        const { senderId, receiverId, listingId, message } = messageData;

        const [result] = await promisePool.query(
            `INSERT INTO messages (sender_id, receiver_id, listing_id, message)
             VALUES (?, ?, ?, ?)`,
            [senderId, receiverId, listingId, message]
        );

        return result.insertId;
    }

    static async getConversations(userId) {
        const [rows] = await promisePool.query(
            `SELECT DISTINCT 
                CASE 
                    WHEN m.sender_id = ? THEN m.receiver_id
                    ELSE m.sender_id
                END as other_user_id,
                u.name as other_user_name,
                u.profile_picture,
                (SELECT message FROM messages 
                 WHERE (sender_id = ? AND receiver_id = other_user_id) 
                    OR (sender_id = other_user_id AND receiver_id = ?)
                 ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT created_at FROM messages 
                 WHERE (sender_id = ? AND receiver_id = other_user_id) 
                    OR (sender_id = other_user_id AND receiver_id = ?)
                 ORDER BY created_at DESC LIMIT 1) as last_message_time
             FROM messages m
             JOIN users u ON u.id = CASE 
                 WHEN m.sender_id = ? THEN m.receiver_id
                 ELSE m.sender_id
             END
             WHERE m.sender_id = ? OR m.receiver_id = ?
             ORDER BY last_message_time DESC`,
            [userId, userId, userId, userId, userId, userId, userId, userId]
        );
        return rows;
    }

    static async getMessages(userId, otherUserId) {
        const [rows] = await promisePool.query(
            `SELECT m.*, u.name as sender_name
             FROM messages m
             JOIN users u ON m.sender_id = u.id
             WHERE (m.sender_id = ? AND m.receiver_id = ?)
                OR (m.sender_id = ? AND m.receiver_id = ?)
             ORDER BY m.created_at ASC`,
            [userId, otherUserId, otherUserId, userId]
        );

        // Mark messages as read
        await promisePool.query(
            'UPDATE messages SET is_read = TRUE WHERE receiver_id = ? AND sender_id = ?',
            [userId, otherUserId]
        );

        return rows;
    }
}

module.exports = Marketplace;
