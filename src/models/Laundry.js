const { promisePool } = require('../config/database');

class Laundry {
    static async getAllServices() {
        const [rows] = await promisePool.query(
            'SELECT * FROM laundry_services WHERE is_active = TRUE'
        );
        return rows;
    }

    static async getServiceById(id) {
        const [rows] = await promisePool.query(
            'SELECT * FROM laundry_services WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async createOrder(orderData) {
        const {
            userId, serviceId, weightKg, itemCount, totalPrice,
            pickupAddress, deliveryAddress, pickupDate, pickupTime,
            specialInstructions, paymentMethod = 'cash'
        } = orderData;

        const [result] = await promisePool.query(
            `INSERT INTO laundry_orders 
             (user_id, service_id, weight_kg, item_count, total_price, 
              pickup_address, delivery_address, pickup_date, pickup_time, 
              special_instructions, payment_method, status, payment_status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')`,
            [userId, serviceId, weightKg, itemCount, totalPrice,
             pickupAddress, deliveryAddress, pickupDate, pickupTime,
             specialInstructions, paymentMethod]
        );

        return result.insertId;
    }

    static async getUserOrders(userId) {
        const [rows] = await promisePool.query(
            `SELECT lo.*, ls.name as service_name 
             FROM laundry_orders lo
             JOIN laundry_services ls ON lo.service_id = ls.id
             WHERE lo.user_id = ?
             ORDER BY lo.created_at DESC`,
            [userId]
        );
        return rows;
    }

    static async getOrderById(orderId, userId) {
        const [rows] = await promisePool.query(
            `SELECT lo.*, ls.name as service_name, ls.description as service_description
             FROM laundry_orders lo
             JOIN laundry_services ls ON lo.service_id = ls.id
             WHERE lo.id = ? AND lo.user_id = ?`,
            [orderId, userId]
        );
        return rows[0];
    }

    static async updateOrderStatus(orderId, status) {
        const [result] = await promisePool.query(
            'UPDATE laundry_orders SET status = ? WHERE id = ?',
            [status, orderId]
        );
        return result.affectedRows > 0;
    }

    static async updatePaymentStatus(orderId, paymentStatus) {
        const [result] = await promisePool.query(
            'UPDATE laundry_orders SET payment_status = ? WHERE id = ?',
            [paymentStatus, orderId]
        );
        return result.affectedRows > 0;
    }

    static async cancelOrder(orderId, userId) {
        const [result] = await promisePool.query(
            `UPDATE laundry_orders 
             SET status = 'cancelled' 
             WHERE id = ? AND user_id = ? AND status IN ('pending', 'confirmed')`,
            [orderId, userId]
        );
        return result.affectedRows > 0;
    }

    static async getAdminOrders(filters = {}) {
        let query = `
            SELECT lo.*, ls.name as service_name, u.name as user_name, u.email
            FROM laundry_orders lo
            JOIN laundry_services ls ON lo.service_id = ls.id
            JOIN users u ON lo.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.status) {
            query += ' AND lo.status = ?';
            params.push(filters.status);
        }

        if (filters.dateFrom) {
            query += ' AND lo.pickup_date >= ?';
            params.push(filters.dateFrom);
        }

        if (filters.dateTo) {
            query += ' AND lo.pickup_date <= ?';
            params.push(filters.dateTo);
        }

        query += ' ORDER BY lo.created_at DESC';

        const [rows] = await promisePool.query(query, params);
        return rows;
    }
}

module.exports = Laundry;