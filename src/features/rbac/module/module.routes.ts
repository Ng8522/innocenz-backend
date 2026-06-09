import { Router } from 'express';
import { moduleController } from '@/composition-root.js';

const router = Router();

router.get('', moduleController.list.bind(moduleController));
router.get('/:id', moduleController.getById.bind(moduleController));
router.post('', moduleController.create.bind(moduleController));
router.put('/:id', moduleController.update.bind(moduleController));
router.delete('/:id', moduleController.remove.bind(moduleController));

export default router;
