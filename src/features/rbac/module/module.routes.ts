import { Router } from 'express';
import { moduleController } from '@/composition-root.js';

const router = Router();

router.get('', moduleController.getModules.bind(moduleController));
router.get('/:id', moduleController.getModuleById.bind(moduleController));
router.post('', moduleController.createModule.bind(moduleController));
router.put('/:id', moduleController.updateModule.bind(moduleController));
router.delete('/:id', moduleController.inactiveModule.bind(moduleController));

export default router;
