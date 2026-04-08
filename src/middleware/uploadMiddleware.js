const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDir = 'uploads/';
const subDirs = ['general', 'materials', 'listings', 'profiles'];

subDirs.forEach(dir => {
    const fullPath = path.join(__dirname, '../../', uploadDir, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'general';
        if (file.fieldname === 'material' || file.fieldname === 'file') folder = 'materials';
        if (file.fieldname === 'listing_image') folder = 'listings';
        if (file.fieldname === 'profile_picture') folder = 'profiles';
        
        cb(null, path.join(__dirname, '../../uploads/', folder));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error('Only images, PDFs, and documents are allowed'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 },
    fileFilter: fileFilter
});

module.exports = { upload };
