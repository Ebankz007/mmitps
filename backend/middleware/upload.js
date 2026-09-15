const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('../utils/ApiError');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../uploads/documents');
const avatarDir = path.join(__dirname, '../uploads/avatars');

[uploadDir, avatarDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure storage for documents
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const userId = req.user ? req.user._id : 'unknown';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Configure storage for avatars
const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, avatarDir);
    },
    filename: function (req, file, cb) {
        const userId = req.user ? req.user._id : 'unknown';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `avatar-${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// File filter for documents
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new ApiError(400, 'Only images (jpeg, jpg, png) and PDFs are allowed!'), false);
    }
};

// File filter for avatars (images only)
const avatarFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new ApiError(400, 'Only images (jpeg, jpg, png) are allowed for avatars!'), false);
    }
};

// Limits
const limits = {
    fileSize: 5 * 1024 * 1024 // 5MB
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: limits
});

const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: avatarFilter,
    limits: limits
}).single('avatar');

module.exports = upload;
module.exports.uploadAvatar = uploadAvatar;
