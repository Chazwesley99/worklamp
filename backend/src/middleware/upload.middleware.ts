import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

// Configure multer for memory storage (we'll process with Sharp)
const storage = multer.memoryStorage();

// File filter to only accept images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images only
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'));
  }

  // Check file size (10MB max)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return cb(new Error('File size exceeds 10MB limit'));
  }

  cb(null, true);
};

// Create multer upload instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1, // Only one file at a time
  },
});

// Middleware for single file upload
export const uploadSingle = (fieldName: string) => {
  return upload.single(fieldName);
};

// Error handling middleware for multer errors
export const handleUploadError = (
  error: Error | undefined,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'File size exceeds 10MB limit',
        },
        statusCode: 400,
      });
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: {
          code: 'INVALID_FILE_FIELD',
          message: 'Unexpected file field',
        },
        statusCode: 400,
      });
    }

    return res.status(400).json({
      error: {
        code: 'UPLOAD_ERROR',
        message: error.message,
      },
      statusCode: 400,
    });
  }

  if (error) {
    return res.status(400).json({
      error: {
        code: 'INVALID_FILE_TYPE',
        message: error.message || 'Invalid file type',
      },
      statusCode: 400,
    });
  }

  next();
};
