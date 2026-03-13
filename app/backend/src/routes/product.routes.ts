import { Router } from 'express';
import { createProduct, getProducts, getProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import { createProductSchema, updateProductSchema } from '../validators/product.validator.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getProducts);
router.get('/:slug', getProduct);
router.post('/', protect, restrictTo('admin'), validate(createProductSchema), createProduct);
router.patch('/:id', protect, restrictTo('admin'), validate(updateProductSchema), updateProduct);
router.delete('/:id', protect, restrictTo('admin'), deleteProduct);

export default router;
