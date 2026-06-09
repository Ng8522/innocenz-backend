import { Router } from 'express';
import { permissionController, permissionRepository } from '@/composition-root.js';
import { AuditTrailAction, auditTrailMiddleware } from '@/middlewares/audit-trail.js';
import { withRestAudit } from '@/features/audit-log/audit-rest.wrapper';
import { paramId } from '@/util/params';

const router = Router();

router.get('', permissionController.list.bind(permissionController));
router.get('/:id', permissionController.getById.bind(permissionController));
router.post(
  '',
  auditTrailMiddleware(AuditTrailAction.CREATE),
  withRestAudit(
    { entity: 'm_permission', action: 'CREATE' },
    permissionController.create.bind(permissionController),
  ),
);
router.put(
  '/:id',
  auditTrailMiddleware(AuditTrailAction.UPDATE),
  withRestAudit(
    {
      entity: 'm_permission',
      action: 'UPDATE',
      getOldData: (req) => permissionRepository.getById(paramId(req.params.id)),
    },
    permissionController.update.bind(permissionController),
  ),
);
router.delete(
  '/:id',
  withRestAudit(
    {
      entity: 'm_permission',
      action: 'DELETE',
      getOldData: (req) => permissionRepository.getById(paramId(req.params.id)),
    },
    permissionController.remove.bind(permissionController),
  ),
);

export default router;
