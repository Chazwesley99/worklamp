import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { authenticate } from '../middleware/auth.middleware';
import { canCreateProject, requireRole } from '../middleware/subscription.middleware';

const router = Router();

// All project routes require authentication
router.use(authenticate);

// Get all projects for tenant
router.get('/', projectController.getProjects.bind(projectController));

// Get project by ID
router.get('/:id', projectController.getProject.bind(projectController));

// Create new project (with limit check)
router.post(
  '/',
  canCreateProject,
  requireRole('owner', 'admin'),
  projectController.createProject.bind(projectController)
);

// Update project (owner/admin only)
router.patch(
  '/:id',
  requireRole('owner', 'admin'),
  projectController.updateProject.bind(projectController)
);

// Delete project (owner/admin only)
router.delete(
  '/:id',
  requireRole('owner', 'admin'),
  projectController.deleteProject.bind(projectController)
);

export default router;
