const express = require('express');
const { protect, tutorOnly } = require('../middleware/authMiddleware');
const {
    createTutorProfile,
    getTutorProfile,
    getAllTutors,
    getTutorById,
    bookSession,
    getMySessions,
    getTutorSessions,
    updateSessionStatus,
    addReview
} = require('../controllers/tutoringController');

const router = express.Router();

// Public routes
router.get('/tutors', getAllTutors);
router.get('/tutors/:id', getTutorById);

// Protected routes
router.post('/tutor/profile', protect, createTutorProfile);
router.get('/tutor/profile', protect, getTutorProfile);
router.post('/sessions', protect, bookSession);
router.get('/sessions/my', protect, getMySessions);
router.get('/sessions/tutor', protect, tutorOnly, getTutorSessions);
router.put('/sessions/:id/status', protect, updateSessionStatus);
router.post('/reviews', protect, addReview);

module.exports = router;