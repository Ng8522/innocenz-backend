import { Router } from 'express';
import { commissionConfigController } from '@/composition-root.js';

const router = Router();

router.get('/', commissionConfigController.list.bind(commissionConfigController));
router.get('/:id', commissionConfigController.getById.bind(commissionConfigController));
router.post('/', commissionConfigController.upsert.bind(commissionConfigController));
router.put('/:id', commissionConfigController.update.bind(commissionConfigController));
router.delete('/:id', commissionConfigController.remove.bind(commissionConfigController));

export default router;
