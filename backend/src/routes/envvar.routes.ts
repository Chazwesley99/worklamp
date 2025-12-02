import { Router } from 'express';
import * as envVarController from '../controllers/envvar.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all environment variables for a project
router.get('/projects/:projectId/env-vars', envVarController.getEnvVars);

// Create a new environment variable
router.post('/projects/:projectId/env-vars', envVarController.createEnvVar);

// Update an environment variable
router.patch('/env-vars/:id', envVarController.updateEnvVar);

// Delete an environment variable
router.delete('/env-vars/:id', envVarController.deleteEnvVar);

export default router;
