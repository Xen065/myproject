/**
 * ============================================
 * File Upload Middleware
 * ============================================
 * Handles file uploads for course content (videos, PDFs, documents, etc.)
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '..', 'uploads');
const courseContentDir = path.join(uploadDir, 'course-content');
const thumbnailsDir = path.join(uploadDir, 'thumbnails');

// Create directories if they don't exist
[uploadDir, courseContentDir, thumbnailsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'thumbnail') {
      cb(null, thumbnailsDir);
    } else {
      cb(null, courseContentDir);
    }
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, nameWithoutExt + '-' + uniqueSuffix + ext);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed MIME types
  const allowedMimeTypes = {
    // Videos
    'video/mp4': true,
    'video/mpeg': true,
    'video/quicktime': true,
    'video/x-msvideo': true,
    'video/x-ms-wmv': true,
    'video/webm': true,

    // Documents
    'application/pdf': true,
    'application/msword': true,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
    'application/vnd.ms-powerpoint': true,
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': true,
    'application/vnd.ms-excel': true,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true,
    'text/plain': true,

    // Images
    'image/jpeg': true,
    'image/png': true,
    'image/gif': true,
    'image/webp': true,
    'image/svg+xml': true,

    // Audio
    'audio/mpeg': true,
    'audio/wav': true,
    'audio/ogg': true,
    'audio/webm': true,
  };

  if (allowedMimeTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed. Please upload videos, PDFs, documents, images, or audio files.`), false);
  }
};

// Create multer instance with configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max file size
  }
});

// Export upload middleware variants
module.exports = {
  // Single file upload
  uploadSingle: upload.single('file'),

  // Multiple files upload (up to 10)
  uploadMultiple: upload.array('files', 10),

  // File with thumbnail
  uploadWithThumbnail: upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),

  // Direct access to upload instance for custom configurations
  upload,

  // Helper function to delete a file
  deleteFile: (filePath) => {
    return new Promise((resolve, reject) => {
      if (!filePath) {
        return resolve();
      }

      const fullPath = path.join(__dirname, '..', filePath);
      fs.unlink(fullPath, (err) => {
        if (err && err.code !== 'ENOENT') {
          // Ignore "file not found" errors
          console.error('Error deleting file:', err);
          return reject(err);
        }
        resolve();
      });
    });
  },

  // Get file info helper
  getFileInfo: (file) => {
    if (!file) return null;

    return {
      fileName: file.originalname,
      filePath: file.path.replace(/\\/g, '/'), // Normalize path separators
      fileSize: file.size,
      mimeType: file.mimetype,
    };
  }
};
