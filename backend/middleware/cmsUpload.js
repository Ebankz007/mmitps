const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('../utils/ApiError');

// Ensure upload directories exist
const cmsUploadDir = path.join(__dirname, '../uploads/cms');
const subDirs = ['images', 'videos', 'icons', 'documents'];

subDirs.forEach(sub => {
    const dir = path.join(cmsUploadDir, sub);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dest = 'documents';
        if (file.mimetype.startsWith('image')) dest = 'images';
        else if (file.mimetype.startsWith('video')) dest = 'videos';
        else if (file.mimetype.includes('svg') || file.originalname.endsWith('.svg')) dest = 'icons';

        cb(null, path.join(cmsUploadDir, dest));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `cms-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg|mp4|webm|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new ApiError(400, 'Unsupported file format!'), false);
    }
};

const cmsUpload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max for videos
    }
});

module.exports = cmsUpload;
