import { Router } from 'express';
import { roleController, roleRepository } from '@/composition-root.js';
import { AuditTrailAction, auditTrailMiddleware } from '@/middlewares/audit-trail.js';
import {
  withRestAudit,
  entityIdFromResponse,
  entityIdFromParams,
} from '@/features/audit-log/audit-rest.wrapper';
import { paramId } from '@/util/params';

const router = Router();

router.get('', roleController.list.bind(roleController));
router.get('/:id', roleController.getById.bind(roleController));
router.post(
  '',
  auditTrailMiddleware(AuditTrailAction.CREATE),
  withRestAudit(
    { entity: 'Role', action: 'CREATE', getEntityId: entityIdFromResponse },
    roleController.create.bind(roleController),
  ),
);
router.put(
  '/:id',
  auditTrailMiddleware(AuditTrailAction.UPDATE),
  withRestAudit(
    {
      entity: 'Role',
      action: 'UPDATE',
      getEntityId: (req, body) => entityIdFromResponse(req, body) ?? entityIdFromParams(req),
      getOldData: (req) => roleRepository.getById(paramId(req.params.id)),
    },
    roleController.update.bind(roleController),
  ),
);
router.delete(
  '/:id',
  withRestAudit(
    {
      entity: 'Role',
      action: 'DELETE',
      getEntityId: (req) => entityIdFromParams(req),
      getOldData: (req) => roleRepository.getById(paramId(req.params.id)),
    },
    roleController.remove.bind(roleController),
  ),
);

export default router;
