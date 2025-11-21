import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import ghostRoutes from './ghost.routes';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/ghosts', ghostRoutes);

export default router;
