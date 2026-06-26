import { Router } from 'express';
import { limitTypeController } from '@/composition-root.js';

const router = Router();

router.get('', limitTypeController.getLimitTypes.bind(limitTypeController));
router.get('/:id', limitTypeController.getLimitTypeById.bind(limitTypeController));
router.post('', limitTypeController.createLimitType.bind(limitTypeController));
router.put('/:id', limitTypeController.updateLimitType.bind(limitTypeController));
router.delete('/:id', limitTypeController.inactiveLimitType.bind(limitTypeController));

export default router;
