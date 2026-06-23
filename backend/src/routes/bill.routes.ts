import { Router } from 'express';
import { billController } from '../controllers/bill.controller';

const router = Router();

router.get('/', billController.getAllBills);
router.get('/:id', billController.getBillById);
router.post('/', billController.createBill);
router.put('/:id', billController.updateBill);
router.delete('/:id', billController.deleteBill);

export default router;
