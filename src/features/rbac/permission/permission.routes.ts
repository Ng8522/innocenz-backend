import { Router } from 'express';
import { permissionController } from '@/composition-root.js';

const router = Router();

router.get('', permissionController.list.bind(permissionController));
router.get('/:id', permissionController.getById.bind(permissionController));
router.post('', permissionController.create.bind(permissionController));
router.put('/:id', permissionController.update.bind(permissionController));
router.delete('/:id', permissionController.remove.bind(permissionController));

export default router;
