import type { SavingsGoal } from '@/lib/types';

export const SAVINGS_GOAL_PRESETS = [
  { id: 'school', label: 'School fees', name: 'School fees' },
  { id: 'college', label: 'College', name: 'College fund' },
  { id: 'travel', label: 'Family trip', name: 'Family trip' },
  { id: 'custom', label: 'Something else', name: '' },
];

export const SAVINGS_MAX_AMOUNT = 10000000;

export const SAVINGS_DISCLAIMER =
  'This is a planning tool for your own savings. It is not an investment product, and no returns are assumed.';

export function savedTotal(goal: SavingsGoal) {
  return goal.contributions.reduce((sum, c) => sum + c.amount, 0);
}

export function savingsProgress(goal: SavingsGoal) {
  if (goal.targetAmount <= 0) return 0;
  return Math.min(1, savedTotal(goal) / goal.targetAmount);
}

export function monthsRemaining(goal: SavingsGoal) {
  const remaining = goal.targetAmount - savedTotal(goal);
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / goal.monthlyAmount);
}

export function projectedCompletion(goal: SavingsGoal, fromTimestamp: number) {
  const months = monthsRemaining(goal);
  const date = new Date(fromTimestamp);
  date.setMonth(date.getMonth() + months);
  return date.getTime();
}

export function parseAmount(input: string) {
  const digits = input.replace(/[^0-9]/g, '');
  return digits ? Number(digits) : 0;
}
