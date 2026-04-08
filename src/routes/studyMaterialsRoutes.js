const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const {
    uploadMaterial,
    getMaterials,
    getMaterialById,
    downloadMaterial,
    getMyMaterials,
    deleteMaterial,
    addReview,
    getSubjects
} = require('../controllers/studyMaterialsController');

const router = express.Router();

// Public routes
router.get('/materials', getMaterials);
router.get('/materials/:id', getMaterialById);
router.get('/subjects', getSubjects);

// Protected routes
router.post('/materials', protect, upload.single('file'), uploadMaterial);
router.post('/materials/:id/download', protect, downloadMaterial);
router.get('/my/materials', protect, getMyMaterials);
router.delete('/materials/:id', protect, deleteMaterial);
router.post('/reviews', protect, addReview);

module.exports = router;