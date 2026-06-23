import { Router } from 'express';
import { discountController } from '../controllers/discount.controller';

const router = Router();

router.get('/', discountController.getAllDiscounts);
router.get('/:id', discountController.getDiscountById);
router.post('/', discountController.createDiscount);
router.put('/:id', discountController.updateDiscount);
router.delete('/:id', discountController.deleteDiscount);

export default router;
