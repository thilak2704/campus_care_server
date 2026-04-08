const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const {
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
} = require('../controllers/marketplaceController');

const router = express.Router();

// Public routes
router.get('/categories', getCategories);
router.get('/listings', getListings);
router.get('/listings/:id', getListingById);

// Protected routes
router.post('/listings', protect, upload.single('listing_image'), createListing);
router.get('/my/listings', protect, getMyListings);
router.put('/listings/:id/status', protect, updateListingStatus);
router.delete('/listings/:id', protect, deleteListing);

// Messages
router.post('/messages', protect, sendMessage);
router.get('/conversations', protect, getConversations);
router.get('/messages/:userId', protect, getMessages);

module.exports = router;
