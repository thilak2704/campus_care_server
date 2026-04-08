const Laundry = require('../models/Laundry');

const getServices = async (req, res) => {
    try {
        const services = await Laundry.getAllServices();
        res.json({
            success: true,
            data: { services }
        });
    } catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const createOrder = async (req, res) => {
    try {
        const {
            serviceId, weightKg, itemCount, totalPrice,
            pickupAddress, deliveryAddress, pickupDate, pickupTime,
            specialInstructions, paymentMethod
        } = req.body;

        const orderId = await Laundry.createOrder({
            userId: req.user.id,
            serviceId,
            weightKg,
            itemCount,
            totalPrice,
            pickupAddress,
            deliveryAddress,
            pickupDate,
            pickupTime,
            specialInstructions,
            paymentMethod
        });

        res.status(201).json({
            success: true,
            message: 'Laundry order created successfully',
            data: { orderId }
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Laundry.getUserOrders(req.user.id);
        res.json({
            success: true,
            data: { orders }
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getOrderDetails = async (req, res) => {
    try {
        const order = await Laundry.getOrderById(req.params.id, req.user.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: { order }
        });
    } catch (error) {
        console.error('Get order details error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const cancelled = await Laundry.cancelOrder(req.params.id, req.user.id);
        if (!cancelled) {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled'
            });
        }

        res.json({
            success: true,
            message: 'Order cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getAdminOrders = async (req, res) => {
    try {
        const orders = await Laundry.getAdminOrders(req.query);
        res.json({
            success: true,
            data: { orders }
        });
    } catch (error) {
        console.error('Get admin orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await Laundry.updateOrderStatus(req.params.id, status);
        
        if (!updated) {
            return res.status(400).json({
                success: false,
                message: 'Failed to update order status'
            });
        }

        res.json({
            success: true,
            message: 'Order status updated successfully'
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    getServices,
    createOrder,
    getMyOrders,
    getOrderDetails,
    cancelOrder,
    getAdminOrders,
    updateOrderStatus
};