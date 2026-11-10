import type { InsuranceFrequency } from '@/lib/types';

export type InsurancePlan = {
  id: string;
  name: string;
  category: string;
  summary: string;
  highlights: string[];
  coverOptions: number[];
  yearlyPremiumPerLakh: number;
};

export const INSURANCE_PLANS: InsurancePlan[] = [
  {
    id: 'health-cover',
    name: 'Child Health Cover',
    category: 'Health',
    summary: 'Hospital care for your child, including planned and emergency treatment.',
    highlights: [
      'Room, ICU and surgery expenses covered',
      'Cashless admission at partner hospitals',
      'Expenses before and after a hospital stay',
    ],
    coverOptions: [500000, 1000000, 2500000],
    yearlyPremiumPerLakh: 1200,
  },
  {
    id: 'accident-cover',
    name: 'Child Accident Cover',
    category: 'Accident',
    summary: 'Affordable protection against accidental injury, from falls to road incidents.',
    highlights: [
      'Fractures, burns and emergency treatment',
      'Ambulance cost after an accident',
      'Benefit payable for permanent disability',
    ],
    coverOptions: [200000, 500000],
    yearlyPremiumPerLakh: 300,
  },
  {
    id: 'savings-plan',
    name: 'Child Savings Plan',
    category: 'Savings',
    summary: 'Build a corpus for school and college while your child is covered.',
    highlights: [
      'Fixed premium for the full term',
      'Corpus paid out at the chosen maturity age',
      'Waiver of future premiums if the parent is unable to pay',
    ],
    coverOptions: [100000, 300000, 500000],
    yearlyPremiumPerLakh: 9000,
  },
];

export const INSURANCE_FREQUENCY_OPTIONS: { value: InsuranceFrequency; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export const NOMINEE_RELATIONS = ['Mother', 'Father', 'Grandparent', 'Guardian', 'Other'];

export const INSURANCE_DISCLAIMER =
  'This is a prototype. Premiums and terms are illustrative, and no policy is issued by a real insurer.';

export function getInsurancePlan(id: string) {
  return INSURANCE_PLANS.find((plan) => plan.id === id);
}

export function isValidCover(plan: InsurancePlan, cover: number) {
  return plan.coverOptions.includes(cover);
}

export function premiumFor(plan: InsurancePlan, cover: number, frequency: InsuranceFrequency) {
  const yearly = Math.round((cover / 100000) * plan.yearlyPremiumPerLakh);
  return frequency === 'yearly' ? yearly : Math.ceil(yearly / 12);
}
