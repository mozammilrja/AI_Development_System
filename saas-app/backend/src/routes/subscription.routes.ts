import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', subscriptionController.getSubscription);
router.post('/upgrade', subscriptionController.upgrade);
router.post('/cancel', subscriptionController.cancel);
router.post('/resume', subscriptionController.resume);
router.get('/billing-history', subscriptionController.getBillingHistory);

export default router;
