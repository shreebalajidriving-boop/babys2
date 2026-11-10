import { MEMBER_DISCOUNT_PERCENT } from '@/lib/pricing';
import type { MembershipPlan } from '@/lib/types';

export const MEMBERSHIP_PLANS: { value: MembershipPlan; label: string; price: number; period: string; note: string }[] = [
  { value: 'monthly', label: 'Monthly', price: 99, period: 'per month', note: 'Cancel anytime' },
  { value: 'yearly', label: 'Yearly', price: 899, period: 'per year', note: 'Save about 24% compared with monthly' },
];

export const MEMBERSHIP_BENEFITS = [
  'Free delivery on every order, with no minimum',
  `${MEMBER_DISCOUNT_PERCENT}% off every product, on top of any coupon`,
];

export const MEMBERSHIP_DISCLAIMER =
  'This is a prototype. No payment is taken and membership is not billed to a real account.';

export function getMembershipPlan(value: string) {
  return MEMBERSHIP_PLANS.find((plan) => plan.value === value);
}

export function renewalTimestamp(startedAt: number, plan: MembershipPlan) {
  const date = new Date(startedAt);
  if (plan === 'monthly') date.setMonth(date.getMonth() + 1);
  else date.setFullYear(date.getFullYear() + 1);
  return date.getTime();
}
