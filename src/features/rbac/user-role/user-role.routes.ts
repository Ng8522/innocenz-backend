import { Router } from 'express';
import { userRoleController } from '@/composition-root.js';

const router = Router();

router.get('', userRoleController.listUserRoles.bind(userRoleController));
router.post('', userRoleController.createUserRole.bind(userRoleController));
router.put('', userRoleController.updateUserRole.bind(userRoleController));

export default router;
