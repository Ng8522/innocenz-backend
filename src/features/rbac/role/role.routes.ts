import { Router } from 'express';
import { roleController } from '@/composition-root.js';

const router = Router();

router.get('', roleController.list.bind(roleController));
router.get('/:id', roleController.getById.bind(roleController));
router.post('', roleController.create.bind(roleController));
router.put('/:id', roleController.update.bind(roleController));
router.delete('/:id', roleController.remove.bind(roleController));

export default router;
