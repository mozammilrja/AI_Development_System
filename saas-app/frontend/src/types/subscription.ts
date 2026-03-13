export type PlanType = 'free' | 'starter' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';
export type BillingCycle = 'monthly' | 'yearly';

export interface Subscription {
  id: string;
  userId: string;
  plan: PlanType;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlanFeatures {
  maxProjects: number;
  maxTeamMembers: number;
  apiCalls: number;
  storage: string;
  support: string;
  customDomain: boolean;
  analytics: boolean;
  prioritySupport: boolean;
}

export interface Plan {
  id: PlanType;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: PlanFeatures;
  popular?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: {
      maxProjects: 1,
      maxTeamMembers: 1,
      apiCalls: 1000,
      storage: '100MB',
      support: 'Community',
      customDomain: false,
      analytics: false,
      prioritySupport: false,
    },
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For small teams',
    monthlyPrice: 19,
    yearlyPrice: 190,
    features: {
      maxProjects: 5,
      maxTeamMembers: 5,
      apiCalls: 10000,
      storage: '1GB',
      support: 'Email',
      customDomain: false,
      analytics: true,
      prioritySupport: false,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For growing businesses',
    monthlyPrice: 49,
    yearlyPrice: 490,
    popular: true,
    features: {
      maxProjects: 20,
      maxTeamMembers: 20,
      apiCalls: 100000,
      storage: '10GB',
      support: 'Priority Email',
      customDomain: true,
      analytics: true,
      prioritySupport: true,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    monthlyPrice: 199,
    yearlyPrice: 1990,
    features: {
      maxProjects: -1, // unlimited
      maxTeamMembers: -1, // unlimited
      apiCalls: -1, // unlimited
      storage: 'Unlimited',
      support: 'Dedicated',
      customDomain: true,
      analytics: true,
      prioritySupport: true,
    },
  },
];
