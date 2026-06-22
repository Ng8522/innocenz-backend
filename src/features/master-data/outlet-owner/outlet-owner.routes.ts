import { Router } from 'express';
import { outletOwnerController } from '@/composition-root.js';
import authenticateJWT from '@/middlewares/authenticate-jwt';

const router = Router();

router.use(authenticateJWT);

router.get('', outletOwnerController.list.bind(outletOwnerController));
router.get('/:id', outletOwnerController.getById.bind(outletOwnerController));
router.post('', outletOwnerController.create.bind(outletOwnerController));

export default router;
