import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Subscription, PlanType, BillingCycle } from '../types';

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.get<Subscription>('/subscription'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpgradeSubscription() {
  return useMutation({
    mutationFn: (data: { plan: PlanType; billingCycle: BillingCycle }) =>
      api.post<Subscription>('/subscription/upgrade', data),
  });
}

export function useCancelSubscription() {
  return useMutation({
    mutationFn: () => api.post<Subscription>('/subscription/cancel'),
  });
}

export function useResumeSubscription() {
  return useMutation({
    mutationFn: () => api.post<Subscription>('/subscription/resume'),
  });
}

export function useBillingHistory() {
  return useQuery({
    queryKey: ['billingHistory'],
    queryFn: () =>
      api.get<
        {
          id: string;
          amount: number;
          status: string;
          date: string;
          invoice_url?: string;
        }[]
      >('/subscription/billing-history'),
  });
}
