import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller';

const router = Router();

router.get('/', inventoryController.getAllInventory);
router.get('/:id', inventoryController.getInventoryById);
router.post('/', inventoryController.createInventory);
router.put('/:id', inventoryController.updateInventory);
router.delete('/:id', inventoryController.deleteInventory);

export default router;
