import { useState } from 'react';
import { AppLayout } from '../components/layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  Button,
  Badge,
  Modal,
  ModalTitle,
  ModalDescription,
} from '../components/ui';
import { useSubscription, useUpgradeSubscription, useCancelSubscription, useBillingHistory } from '../hooks';
import { PLANS, type PlanType, type BillingCycle } from '../types';
import { cn } from '../lib/utils';

export function BillingPage() {
  const { data: subscription, isLoading } = useSubscription();
  const { data: billingHistory } = useBillingHistory();
  const upgradeSubscription = useUpgradeSubscription();
  const cancelSubscription = useCancelSubscription();
  
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const currentPlan = PLANS.find((p) => p.id === subscription?.plan) || PLANS[0];

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    await upgradeSubscription.mutateAsync({ plan: selectedPlan, billingCycle });
    setShowUpgradeModal(false);
  };

  const handleCancel = async () => {
    await cancelSubscription.mutateAsync();
    setShowCancelModal(false);
  };

  const openUpgradeModal = (planId: PlanType) => {
    setSelectedPlan(planId);
    setShowUpgradeModal(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
          <p className="text-gray-500 mt-1">
            Manage your subscription and billing information.
          </p>
        </div>

        {/* Current Plan */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>You are currently on the {currentPlan.name} plan.</CardDescription>
              </div>
              <Badge
                variant={subscription?.status === 'active' ? 'success' : 'warning'}
                size="md"
              >
                {subscription?.status || 'active'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-gray-900">
                ${subscription?.billingCycle === 'yearly' ? currentPlan.yearlyPrice : currentPlan.monthlyPrice}
              </span>
              <span className="text-gray-500">/{subscription?.billingCycle === 'yearly' ? 'year' : 'month'}</span>
            </div>
            {subscription?.currentPeriodEnd && (
              <p className="text-sm text-gray-500 mt-2">
                {subscription.cancelAtPeriodEnd
                  ? `Cancels on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                  : `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
              </p>
            )}
          </CardContent>
          {subscription?.plan !== 'free' && (
            <CardFooter>
              <Button variant="outline" onClick={() => setShowCancelModal(true)}>
                {subscription?.cancelAtPeriodEnd ? 'Resume Subscription' : 'Cancel Subscription'}
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                billingCycle === 'yearly'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Yearly <span className="text-green-600 ml-1">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => {
            const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            const isCurrentPlan = subscription?.plan === plan.id;

            return (
              <Card
                key={plan.id}
                className={cn(
                  'relative',
                  plan.popular && 'border-blue-500 border-2'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="info">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900">${price}</span>
                    <span className="text-gray-500">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                  </div>

                  <ul className="mt-6 space-y-3">
                    <FeatureItem>
                      {plan.features.maxProjects === -1
                        ? 'Unlimited projects'
                        : `${plan.features.maxProjects} projects`}
                    </FeatureItem>
                    <FeatureItem>
                      {plan.features.maxTeamMembers === -1
                        ? 'Unlimited team members'
                        : `${plan.features.maxTeamMembers} team members`}
                    </FeatureItem>
                    <FeatureItem>
                      {plan.features.apiCalls === -1
                        ? 'Unlimited API calls'
                        : `${plan.features.apiCalls.toLocaleString()} API calls`}
                    </FeatureItem>
                    <FeatureItem>{plan.features.storage} storage</FeatureItem>
                    <FeatureItem>{plan.features.support} support</FeatureItem>
                    {plan.features.customDomain && <FeatureItem>Custom domain</FeatureItem>}
                    {plan.features.analytics && <FeatureItem>Advanced analytics</FeatureItem>}
                  </ul>

                  <Button
                    className="w-full mt-6"
                    variant={isCurrentPlan ? 'outline' : plan.popular ? 'primary' : 'secondary'}
                    disabled={isCurrentPlan}
                    onClick={() => openUpgradeModal(plan.id)}
                  >
                    {isCurrentPlan ? 'Current Plan' : 'Upgrade'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {billingHistory?.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No billing history yet.</p>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {billingHistory?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={item.status === 'paid' ? 'success' : 'warning'}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {item.invoice_url && (
                          <a
                            href={item.invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-500"
                          >
                            Download
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Upgrade Modal */}
        <Modal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)}>
          <ModalTitle>Upgrade to {PLANS.find((p) => p.id === selectedPlan)?.name}</ModalTitle>
          <ModalDescription>
            You will be charged ${
              selectedPlan
                ? billingCycle === 'yearly'
                  ? PLANS.find((p) => p.id === selectedPlan)?.yearlyPrice
                  : PLANS.find((p) => p.id === selectedPlan)?.monthlyPrice
                : 0
            }/{billingCycle === 'yearly' ? 'year' : 'month'}.
          </ModalDescription>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpgrade} isLoading={upgradeSubscription.isPending}>
              Confirm Upgrade
            </Button>
          </div>
        </Modal>

        {/* Cancel Modal */}
        <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)}>
          <ModalTitle>Cancel Subscription</ModalTitle>
          <ModalDescription>
            Are you sure you want to cancel your subscription? You will lose access to premium
            features at the end of your current billing period.
          </ModalDescription>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              Keep Subscription
            </Button>
            <Button variant="danger" onClick={handleCancel} isLoading={cancelSubscription.isPending}>
              Cancel Subscription
            </Button>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2 text-sm text-gray-600">
      <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
      {children}
    </li>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
