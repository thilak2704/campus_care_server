const StudyMaterial = require('../models/StudyMaterial');

const uploadMaterial = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const materialData = {
            ...req.body,
            userId: req.user.id,
            fileUrl: `/uploads/materials/${req.file.filename}`,
            fileSize: req.file.size,
            isFree: req.body.isFree === 'true'
        };

        const materialId = await StudyMaterial.create(materialData);
        
        res.status(201).json({
            success: true,
            message: 'Material uploaded successfully',
            data: { materialId }
        });
    } catch (error) {
        console.error('Upload material error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getMaterials = async (req, res) => {
    try {
        const materials = await StudyMaterial.getAll(req.query);
        res.json({
            success: true,
            data: { materials }
        });
    } catch (error) {
        console.error('Get materials error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getMaterialById = async (req, res) => {
    try {
        const material = await StudyMaterial.getById(req.params.id);
        if (!material) {
            return res.status(404).json({
                success: false,
                message: 'Material not found'
            });
        }

        res.json({
            success: true,
            data: { material }
        });
    } catch (error) {
        console.error('Get material error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const downloadMaterial = async (req, res) => {
    try {
        const material = await StudyMaterial.getById(req.params.id);
        if (!material) {
            return res.status(404).json({
                success: false,
                message: 'Material not found'
            });
        }

        await StudyMaterial.incrementDownloads(req.params.id);
        
        res.json({
            success: true,
            data: { downloadUrl: material.file_url }
        });
    } catch (error) {
        console.error('Download material error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getMyMaterials = async (req, res) => {
    try {
        const materials = await StudyMaterial.getUserMaterials(req.user.id);
        res.json({
            success: true,
            data: { materials }
        });
    } catch (error) {
        console.error('Get my materials error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const deleteMaterial = async (req, res) => {
    try {
        const deleted = await StudyMaterial.delete(req.params.id, req.user.id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Material not found'
            });
        }

        res.json({
            success: true,
            message: 'Material deleted successfully'
        });
    } catch (error) {
        console.error('Delete material error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const addReview = async (req, res) => {
    try {
        const { materialId, rating, comment } = req.body;
        
        const reviewId = await StudyMaterial.addReview({
            reviewerId: req.user.id,
            materialId,
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

const getSubjects = async (req, res) => {
    try {
        const subjects = await StudyMaterial.getSubjects();
        res.json({
            success: true,
            data: { subjects }
        });
    } catch (error) {
        console.error('Get subjects error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    uploadMaterial,
    getMaterials,
    getMaterialById,
    downloadMaterial,
    getMyMaterials,
    deleteMaterial,
    addReview,
    getSubjects
};