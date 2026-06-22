import { Router } from 'express';
import { userController } from '@/composition-root.js';
import authenticateJWT from '@/middlewares/authenticate-jwt';

const router = Router();

router.use(authenticateJWT);

router.get('', userController.list.bind(userController));
router.get('/:id', userController.getById.bind(userController));

export default router;
