import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import ghostRoutes from './ghost.routes';
import storyRoutes from './story.routes';
import bookmarkRoutes from './bookmark.routes';
import recommendationRoutes from './recommendation.routes';
import digitalTwinRoutes from './digital-twin.routes';
import imageRoutes from './image.routes';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/ghosts', ghostRoutes);
router.use('/stories', storyRoutes);
router.use('/bookmarks', bookmarkRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/twin', digitalTwinRoutes);
router.use('/images', imageRoutes);

export default router;
