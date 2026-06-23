import { Router } from 'express';
import { roleController } from '@/composition-root.js';

const router = Router();

router.get('', roleController.getRoles.bind(roleController));
router.get('/:id', roleController.getRoleById.bind(roleController));
router.post('', roleController.createRole.bind(roleController));
router.put('/:id', roleController.updateRole.bind(roleController));
router.put('/inactive/:id', roleController.inactiveRole.bind(roleController));

export default router;
