import { Router } from 'express';
import { moduleController, moduleRepository } from '@/composition-root.js';
import { AuditTrailAction, auditTrailMiddleware } from '@/middlewares/audit-trail.js';
import { withRestAudit } from '@/features/audit-log/audit-rest.wrapper';
import { paramId } from '@/util/params';

const router = Router();

router.get('', moduleController.list.bind(moduleController));
router.get('/:id', moduleController.getById.bind(moduleController));
router.post(
  '',
  auditTrailMiddleware(AuditTrailAction.CREATE),
  withRestAudit({ entity: 'm_module', action: 'CREATE' }, moduleController.create.bind(moduleController)),
);
router.put(
  '/:id',
  auditTrailMiddleware(AuditTrailAction.UPDATE),
  withRestAudit(
    {
      entity: 'm_module',
      action: 'UPDATE',
      getOldData: (req) => moduleRepository.getById(paramId(req.params.id)),
    },
    moduleController.update.bind(moduleController),
  ),
);
router.delete(
  '/:id',
  withRestAudit(
    {
      entity: 'm_module',
      action: 'DELETE',
      getOldData: (req) => moduleRepository.getById(paramId(req.params.id)),
    },
    moduleController.remove.bind(moduleController),
  ),
);

export default router;
