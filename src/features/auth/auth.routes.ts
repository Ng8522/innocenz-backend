import { Router } from 'express';
import { authController } from '@/composition-root.js';
import authenticateJWT from '@/middlewares/authenticate-jwt';

const router = Router();

router.post('/login', authController.login.bind(authController));
router.post('/register', authController.register.bind(authController));
router.get('/profile', authenticateJWT, authController.getProfile.bind(authController));

export default router;
