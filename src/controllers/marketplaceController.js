const Marketplace = require('../models/Marketplace');

const getCategories = async (req, res) => {
    try {
        const categories = await Marketplace.getAllCategories();
        res.json({
            success: true,
            data: { categories }
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const createListing = async (req, res) => {
    try {
        const uploadedImagePath = req.file ? `/uploads/listings/${req.file.filename}` : null;
        const parsedImages = req.body.images
            ? JSON.parse(req.body.images)
            : [];
        const listingData = {
            ...req.body,
            sellerId: req.user.id,
            categoryId: Number(req.body.categoryId),
            price: Number(req.body.price),
            isNegotiable: req.body.isNegotiable === 'true' || req.body.isNegotiable === true,
            images: uploadedImagePath ? [uploadedImagePath, ...parsedImages] : parsedImages
        };

        const listingId = await Marketplace.createListing(listingData);
        
        res.status(201).json({
            success: true,
            message: 'Listing created successfully',
            data: { listingId }
        });
    } catch (error) {
        console.error('Create listing error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getListings = async (req, res) => {
    try {
        const listings = await Marketplace.getListings(req.query);
        res.json({
            success: true,
            data: { listings }
        });
    } catch (error) {
        console.error('Get listings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getListingById = async (req, res) => {
    try {
        const listing = await Marketplace.getListingById(req.params.id);
        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
        }

        res.json({
            success: true,
            data: { listing }
        });
    } catch (error) {
        console.error('Get listing error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getMyListings = async (req, res) => {
    try {
        const listings = await Marketplace.getUserListings(req.user.id);
        res.json({
            success: true,
            data: { listings }
        });
    } catch (error) {
        console.error('Get my listings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const updateListingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await Marketplace.updateListingStatus(
            req.params.id, req.user.id, status
        );

        if (!updated) {
            return res.status(400).json({
                success: false,
                message: 'Failed to update listing'
            });
        }

        res.json({
            success: true,
            message: 'Listing updated successfully'
        });
    } catch (error) {
        console.error('Update listing error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const deleteListing = async (req, res) => {
    try {
        const deleted = await Marketplace.deleteListing(req.params.id, req.user.id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
        }

        res.json({
            success: true,
            message: 'Listing deleted successfully'
        });
    } catch (error) {
        console.error('Delete listing error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { receiverId, listingId, message } = req.body;
        
        const messageId = await Marketplace.sendMessage({
            senderId: req.user.id,
            receiverId,
            listingId,
            message
        });

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: { messageId }
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getConversations = async (req, res) => {
    try {
        const conversations = await Marketplace.getConversations(req.user.id);
        res.json({
            success: true,
            data: { conversations }
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getMessages = async (req, res) => {
    try {
        const messages = await Marketplace.getMessages(req.user.id, req.params.userId);
        res.json({
            success: true,
            data: { messages }
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    getCategories,
    createListing,
    getListings,
    getListingById,
    getMyListings,
    updateListingStatus,
    deleteListing,
    sendMessage,
    getConversations,
    getMessages
};
