import { Router } from 'express';
import { rbacController } from '@/composition-root.js';
import authenticateJWT from '@/middlewares/authenticate-jwt';

const router = Router();

router.use(authenticateJWT);

router.get('', rbacController.getMyAccess.bind(rbacController));

router.get('/roles', rbacController.listRoles.bind(rbacController));
router.get('/roles/:id', rbacController.getRole.bind(rbacController));
router.post('/roles', rbacController.createRole.bind(rbacController));
router.put('/roles/:id', rbacController.updateRole.bind(rbacController));
router.delete('/roles/:id', rbacController.deleteRole.bind(rbacController));

router.get('/modules', rbacController.listModules.bind(rbacController));
router.get('/modules/:id', rbacController.getModule.bind(rbacController));
router.post('/modules', rbacController.createModule.bind(rbacController));
router.put('/modules/:id', rbacController.updateModule.bind(rbacController));
router.delete('/modules/:id', rbacController.deleteModule.bind(rbacController));

router.get('/permissions', rbacController.listPermissions.bind(rbacController));
router.get('/permissions/:id', rbacController.getPermission.bind(rbacController));
router.post('/permissions', rbacController.createPermission.bind(rbacController));
router.put('/permissions/:id', rbacController.updatePermission.bind(rbacController));
router.delete('/permissions/:id', rbacController.deletePermission.bind(rbacController));

router.get('/role-permissions', rbacController.listRolePermissions.bind(rbacController));
router.post('/role-permissions', rbacController.createRolePermission.bind(rbacController));
router.put('/role-permissions/:roleId/sync', rbacController.syncRolePermissions.bind(rbacController));
router.delete('/role-permissions/:id', rbacController.deleteRolePermission.bind(rbacController));

router.get('/admin-roles', rbacController.listAdminRoles.bind(rbacController));
router.post('/admin-roles', rbacController.createAdminRole.bind(rbacController));
router.put('/admin-roles/:id', rbacController.updateAdminRole.bind(rbacController));
router.delete('/admin-roles/:id', rbacController.deleteAdminRole.bind(rbacController));

export default router;
