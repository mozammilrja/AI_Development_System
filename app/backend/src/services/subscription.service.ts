import { Subscription } from '../models/Subscription.js';
import type { PlanType, BillingCycle } from '../models/Subscription.js';

export class SubscriptionService {
  async getSubscription(userId: string) {
    let subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      // Create a free subscription for new users
      subscription = await Subscription.create({
        userId,
        plan: 'free',
        status: 'active',
        billingCycle: 'monthly',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }
    
    return subscription;
  }

  async upgrade(userId: string, plan: PlanType, billingCycle: BillingCycle) {
    const subscription = await this.getSubscription(userId);
    
    const periodDays = billingCycle === 'yearly' ? 365 : 30;
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000);
    
    subscription.plan = plan;
    subscription.billingCycle = billingCycle;
    subscription.status = 'active';
    subscription.currentPeriodStart = currentPeriodStart;
    subscription.currentPeriodEnd = currentPeriodEnd;
    subscription.cancelAtPeriodEnd = false;
    
    await subscription.save();
    return subscription;
  }

  async cancel(userId: string) {
    const subscription = await this.getSubscription(userId);
    
    subscription.cancelAtPeriodEnd = true;
    await subscription.save();
    
    return subscription;
  }

  async resume(userId: string) {
    const subscription = await this.getSubscription(userId);
    
    subscription.cancelAtPeriodEnd = false;
    await subscription.save();
    
    return subscription;
  }

  async getBillingHistory(userId: string) {
    // In a real app, this would fetch from a payment provider like Stripe
    // For now, return mock data
    return [
      {
        id: '1',
        amount: 49,
        status: 'paid',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        invoice_url: '#',
      },
      {
        id: '2',
        amount: 49,
        status: 'paid',
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        invoice_url: '#',
      },
    ];
  }
}

export const subscriptionService = new SubscriptionService();
