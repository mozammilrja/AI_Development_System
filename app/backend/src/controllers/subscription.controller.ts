import { Request, Response, NextFunction } from 'express';
import { subscriptionService } from '../services/subscription.service.js';

export class SubscriptionController {
  async getSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const subscription = await subscriptionService.getSubscription(userId);
      res.json(subscription);
    } catch (error) {
      next(error);
    }
  }

  async upgrade(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { plan, billingCycle } = req.body;
      const subscription = await subscriptionService.upgrade(userId, plan, billingCycle);
      res.json(subscription);
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const subscription = await subscriptionService.cancel(userId);
      res.json(subscription);
    } catch (error) {
      next(error);
    }
  }

  async resume(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const subscription = await subscriptionService.resume(userId);
      res.json(subscription);
    } catch (error) {
      next(error);
    }
  }

  async getBillingHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const history = await subscriptionService.getBillingHistory(userId);
      res.json(history);
    } catch (error) {
      next(error);
    }
  }
}

export const subscriptionController = new SubscriptionController();
