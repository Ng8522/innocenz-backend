import { Router } from 'express';
import { auditLogController } from '@/composition-root.js';
import authenticateJWT from '@/middlewares/authenticate-jwt';

const router = Router();

router.use(authenticateJWT);

router.get('/actions', auditLogController.listActions.bind(auditLogController));
router.get('/entities', auditLogController.listEntities.bind(auditLogController));
router.get('', auditLogController.list.bind(auditLogController));
router.get('/:id', auditLogController.getById.bind(auditLogController));

export default router;
