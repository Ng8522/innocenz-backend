import { Router } from 'express';
import { rolePermissionController } from '@/composition-root.js';

const router = Router();

router.get('', rolePermissionController.list.bind(rolePermissionController));
router.get('/:id', rolePermissionController.getById.bind(rolePermissionController));
router.post('', rolePermissionController.create.bind(rolePermissionController));
router.put('/:roleId/sync', rolePermissionController.sync.bind(rolePermissionController));
router.delete('/:id', rolePermissionController.remove.bind(rolePermissionController));

export default router;
