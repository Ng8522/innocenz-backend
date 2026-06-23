import { Router } from 'express';
import { rolePermissionController } from '@/composition-root.js';

const router = Router();

router.get('', rolePermissionController.getRolePermissions.bind(rolePermissionController));
router.post('', rolePermissionController.assignPermissionsToRole.bind(rolePermissionController));
router.put('/update/:roleId', rolePermissionController.updateRolePermissions.bind(rolePermissionController));
router.delete('/:roleId', rolePermissionController.removeAllPermissionsFromRole.bind(rolePermissionController));

export default router;
