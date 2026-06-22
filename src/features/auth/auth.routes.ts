import { Router } from 'express';
import { authController } from '@/composition-root.js';
import authenticateJWT from '@/middlewares/authenticate-jwt';

const router = Router();


export default router;
