import { Router } from 'express';
import { inventoryTransactionController } from '../controllers/inventoryTransaction.controller';

const router = Router();

router.get('/', inventoryTransactionController.getAll);
router.get('/:id', inventoryTransactionController.getById);
router.post('/', inventoryTransactionController.create);
router.put('/:id', inventoryTransactionController.update);
router.delete('/:id', inventoryTransactionController.delete);

export default router;
