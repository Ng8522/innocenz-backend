import { Router } from 'express';
import { adminController } from '@/composition-root.js';
import authenticateJWT from '@/middlewares/authenticate-jwt';

const router = Router();

router.use(authenticateJWT);

router.get('', adminController.list.bind(adminController));
router.get('/:id', adminController.getById.bind(adminController));
router.post('', adminController.create.bind(adminController));
router.put('/:id', adminController.update.bind(adminController));
router.delete('/:id', adminController.remove.bind(adminController));

export default router;
