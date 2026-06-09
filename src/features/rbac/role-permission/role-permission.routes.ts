import { Router } from 'express';
import { rolePermissionController, rolePermissionRepository } from '@/composition-root.js';
import { AuditTrailAction, auditTrailMiddleware } from '@/middlewares/audit-trail.js';
import { withRestAudit } from '@/features/audit-log/audit-rest.wrapper';
import { paramId } from '@/util/params';

const router = Router();

router.get('', rolePermissionController.list.bind(rolePermissionController));
router.get('/:id', rolePermissionController.getById.bind(rolePermissionController));
router.post(
  '',
  auditTrailMiddleware(AuditTrailAction.CREATE),
  withRestAudit(
    { entity: 'role_permission', action: 'CREATE' },
    rolePermissionController.create.bind(rolePermissionController),
  ),
);
router.put(
  '/:roleId/sync',
  auditTrailMiddleware(AuditTrailAction.UPDATE),
  withRestAudit(
    {
      entity: 'role_permission',
      action: 'BULK_UPDATE',
      getOldData: (req) => rolePermissionRepository.list({ roleId: paramId(req.params.roleId) }),
      getNewData: (_req, body) => (body as { data?: unknown })?.data,
    },
    rolePermissionController.sync.bind(rolePermissionController),
  ),
);
router.delete(
  '/:id',
  withRestAudit(
    {
      entity: 'role_permission',
      action: 'DELETE',
      getOldData: (req) => rolePermissionRepository.getById(paramId(req.params.id)),
    },
    rolePermissionController.remove.bind(rolePermissionController),
  ),
);

export default router;
