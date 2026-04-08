const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
    getServices,
    createOrder,
    getMyOrders,
    getOrderDetails,
    cancelOrder,
    getAdminOrders,
    updateOrderStatus
} = require('../controllers/laundryController');

const router = express.Router();

// User routes
router.get('/services', protect, getServices);
router.post('/orders', protect, createOrder);
router.get('/orders', protect, getMyOrders);
router.get('/orders/:id', protect, getOrderDetails);
router.put('/orders/:id/cancel', protect, cancelOrder);

// Admin routes
router.get('/admin/orders', protect, adminOnly, getAdminOrders);
router.put('/admin/orders/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;