import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { commentController } from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All task routes require authentication
router.use(authenticate);

// Task routes
router.get('/projects/:projectId/tasks', taskController.getTasks.bind(taskController));
router.post('/projects/:projectId/tasks', taskController.createTask.bind(taskController));
router.patch('/tasks/:id', taskController.updateTask.bind(taskController));
router.delete('/tasks/:id', taskController.deleteTask.bind(taskController));
router.post('/tasks/:id/assign', taskController.assignUsers.bind(taskController));

// Comment routes (generic for all resources)
router.get('/comments', commentController.getComments.bind(commentController));
router.post('/comments', commentController.createComment.bind(commentController));
router.patch('/comments/:id', commentController.updateComment.bind(commentController));
router.delete('/comments/:id', commentController.deleteComment.bind(commentController));

export default router;
