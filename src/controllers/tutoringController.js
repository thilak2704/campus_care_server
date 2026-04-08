const Tutoring = require('../models/Tutoring');

const createTutorProfile = async (req, res) => {
    try {
        const existing = await Tutoring.getTutorProfile(req.user.id);
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'You already have a tutor profile'
            });
        }

        const tutorId = await Tutoring.createTutorProfile(req.user.id, req.body);
        
        res.status(201).json({
            success: true,
            message: 'Tutor profile created successfully',
            data: { tutorId }
        });
    } catch (error) {
        console.error('Create tutor profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getTutorProfile = async (req, res) => {
    try {
        const profile = await Tutoring.getTutorProfile(req.user.id);
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Tutor profile not found'
            });
        }

        res.json({
            success: true,
            data: { profile }
        });
    } catch (error) {
        console.error('Get tutor profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getAllTutors = async (req, res) => {
    try {
        const tutors = await Tutoring.getAllTutors(req.query);
        res.json({
            success: true,
            data: { tutors }
        });
    } catch (error) {
        console.error('Get tutors error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getTutorById = async (req, res) => {
    try {
        const tutor = await Tutoring.getTutorById(req.params.id);
        if (!tutor) {
            return res.status(404).json({
                success: false,
                message: 'Tutor not found'
            });
        }

        res.json({
            success: true,
            data: { tutor }
        });
    } catch (error) {
        console.error('Get tutor error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const bookSession = async (req, res) => {
    try {
        const sessionData = {
            ...req.body,
            studentId: req.user.id
        };

        const sessionId = await Tutoring.createSession(sessionData);
        
        res.status(201).json({
            success: true,
            message: 'Session booked successfully',
            data: { sessionId }
        });
    } catch (error) {
        console.error('Book session error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getMySessions = async (req, res) => {
    try {
        const sessions = await Tutoring.getStudentSessions(req.user.id);
        res.json({
            success: true,
            data: { sessions }
        });
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getTutorSessions = async (req, res) => {
    try {
        const tutorProfile = await Tutoring.getTutorProfile(req.user.id);
        if (!tutorProfile) {
            return res.status(404).json({
                success: false,
                message: 'Tutor profile not found'
            });
        }

        const sessions = await Tutoring.getTutorSessions(tutorProfile.id);
        res.json({
            success: true,
            data: { sessions }
        });
    } catch (error) {
        console.error('Get tutor sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const updateSessionStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const isTutor = req.user.role === 'tutor';
        
        const updated = await Tutoring.updateSessionStatus(
            req.params.id, status, req.user.id, isTutor
        );

        if (!updated) {
            return res.status(400).json({
                success: false,
                message: 'Failed to update session status'
            });
        }

        res.json({
            success: true,
            message: 'Session status updated successfully'
        });
    } catch (error) {
        console.error('Update session status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const addReview = async (req, res) => {
    try {
        const { tutorId, rating, comment } = req.body;
        
        const reviewId = await Tutoring.addReview({
            reviewerId: req.user.id,
            tutorId,
            rating,
            comment
        });

        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            data: { reviewId }
        });
    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    createTutorProfile,
    getTutorProfile,
    getAllTutors,
    getTutorById,
    bookSession,
    getMySessions,
    getTutorSessions,
    updateSessionStatus,
    addReview
};