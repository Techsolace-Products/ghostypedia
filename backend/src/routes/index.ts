import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import ghostRoutes from './ghost.routes';
import storyRoutes from './story.routes';
import bookmarkRoutes from './bookmark.routes';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/ghosts', ghostRoutes);
router.use('/stories', storyRoutes);
router.use('/bookmarks', bookmarkRoutes);

export default router;
