import { Router } from 'express';
import { permissionController } from '@/composition-root.js';

const router = Router();

router.get('', permissionController.getPermissions.bind(permissionController));
router.get('/:id', permissionController.getPermissionById.bind(permissionController));
router.post('', permissionController.createPermission.bind(permissionController));
router.put('/:id', permissionController.updatePermission.bind(permissionController));
router.delete('/:id', permissionController.inactivePermission.bind(permissionController));

export default router;
