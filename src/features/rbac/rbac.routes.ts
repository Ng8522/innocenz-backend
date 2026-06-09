import { Router } from 'express';
import authenticateJWT from '@/middlewares/authenticate-jwt';
import { rbacController } from '@/composition-root.js';
import roleRoutes from '@/features/rbac/role/role.routes.js';
import moduleRoutes from '@/features/rbac/module/module.routes.js';
import permissionRoutes from '@/features/rbac/permission/permission.routes.js';
import rolePermissionRoutes from '@/features/rbac/role-permission/role-permission.routes.js';

const router = Router();

router.use(authenticateJWT);

router.get('', rbacController.getMyAccess.bind(rbacController));
router.use('/roles', roleRoutes);
router.use('/modules', moduleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/role-permissions', rolePermissionRoutes);

export default router;
