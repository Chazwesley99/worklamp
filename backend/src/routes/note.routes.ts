import { Router } from 'express';
import { noteController } from '../controllers/note.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All note routes require authentication
router.use(authenticate);

// Note routes
router.get('/notes', noteController.getNotes.bind(noteController));
router.post('/notes', noteController.createNote.bind(noteController));
router.patch('/notes/:id', noteController.updateNote.bind(noteController));
router.delete('/notes/:id', noteController.deleteNote.bind(noteController));

export default router;
