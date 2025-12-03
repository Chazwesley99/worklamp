import { Router } from 'express';
import { projectFileController } from '../controllers/projectfile.controller';
import { authenticate, setTenantContext } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/subscription.middleware';
import multer from 'multer';

const router = Router();

// Configure multer for file uploads (accept any file type for documents)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

// All routes require authentication
router.use(authenticate);
router.use(setTenantContext);

// Get all files for a project
router.get(
  '/projects/:projectId/files',
  projectFileController.getFiles.bind(projectFileController)
);

// Upload a file (developer+ can upload)
router.post(
  '/projects/:projectId/files',
  requireRole('owner', 'admin', 'developer'),
  upload.single('file'),
  projectFileController.uploadFile.bind(projectFileController)
);

// Delete a file (owner/admin only)
router.delete(
  '/files/:id',
  requireRole('owner', 'admin'),
  projectFileController.deleteFile.bind(projectFileController)
);

// Generate milestones from tasks file (owner/admin only)
router.post(
  '/files/:id/generate-milestones',
  requireRole('owner', 'admin'),
  projectFileController.generateMilestones.bind(projectFileController)
);

export default router;
