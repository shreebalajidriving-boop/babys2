import type { InsuranceFrequency } from '@/lib/types';

export type InsuranceTypeId = 'health' | 'accident' | 'savings' | 'wedding';

export type InsuranceCompany = {
  id: string;
  name: string;
  tagline: string;
  rating: number;
};

export type InsuranceType = {
  id: InsuranceTypeId;
  label: string;
  summary: string;
  compareRows: { key: string; label: string }[];
};

export type InsurancePlan = {
  id: string;
  typeId: InsuranceTypeId;
  companyId: string;
  name: string;
  category: string;
  summary: string;
  highlights: string[];
  coverOptions: number[];
  yearlyPremiumPerLakh: number;
  coversWedding: boolean;
  /** Feature flags used on the type compare table */
  features: Record<string, boolean | string>;
};

export const INSURANCE_COMPANIES: InsuranceCompany[] = [
  { id: 'secure-care', name: 'SecureCare', tagline: 'Trusted family health partner', rating: 4.7 },
  { id: 'brightlife', name: 'BrightLife', tagline: 'Simple digital claims', rating: 4.5 },
  { id: 'nestshield', name: 'NestShield', tagline: 'Child-first protection', rating: 4.8 },
];

export const INSURANCE_TYPES: InsuranceType[] = [
  {
    id: 'health',
    label: 'Health cover',
    summary: 'Hospital care for your child — compare the same cover across companies.',
    compareRows: [
      { key: 'cashless', label: 'Cashless network' },
      { key: 'icu', label: 'ICU & surgery' },
      { key: 'prepost', label: 'Pre / post hospital' },
      { key: 'maternity', label: 'Maternity add-on' },
      { key: 'checkup', label: 'Annual checkup' },
    ],
  },
  {
    id: 'accident',
    label: 'Accident cover',
    summary: 'Protection for accidental injury — compare benefits company by company.',
    compareRows: [
      { key: 'fracture', label: 'Fractures & burns' },
      { key: 'ambulance', label: 'Ambulance cover' },
      { key: 'disability', label: 'Disability benefit' },
      { key: 'hospital', label: 'Accident hospitalisation' },
    ],
  },
  {
    id: 'savings',
    label: 'Savings plan',
    summary: 'Build a corpus for school or college while your child is covered.',
    compareRows: [
      { key: 'fixedPremium', label: 'Fixed premium' },
      { key: 'maturity', label: 'Maturity corpus' },
      { key: 'waiver', label: 'Premium waiver' },
      { key: 'lifeCover', label: 'Parent life cover' },
    ],
  },
  {
    id: 'wedding',
    label: 'Wedding & milestone',
    summary: 'Save for wedding and life milestones — compare every insurer’s offer.',
    compareRows: [
      { key: 'weddingCorpus', label: 'Wedding corpus' },
      { key: 'lifeCover', label: 'Parent life cover' },
      { key: 'flexiblePayout', label: 'Flexible payout age' },
      { key: 'rider', label: 'Celebration rider' },
      { key: 'accident', label: 'Accident rider' },
    ],
  },
];

export const INSURANCE_PLANS: InsurancePlan[] = [
  // Health — all 3 companies
  {
    id: 'health-secure',
    typeId: 'health',
    companyId: 'secure-care',
    name: 'Child Health Cover',
    category: 'Health',
    summary: 'Hospital care for your child, including planned and emergency treatment.',
    highlights: ['Room, ICU and surgery expenses covered', 'Cashless admission at partner hospitals', 'Expenses before and after a hospital stay'],
    coverOptions: [500000, 1000000, 2500000],
    yearlyPremiumPerLakh: 1200,
    coversWedding: false,
    features: { cashless: true, icu: true, prepost: true, maternity: false, checkup: true },
  },
  {
    id: 'health-bright',
    typeId: 'health',
    companyId: 'brightlife',
    name: 'Family Health Plus',
    category: 'Health',
    summary: 'Broader hospital network with maternity add-ons for growing families.',
    highlights: ['Wider cashless network', 'Maternity waiting-period buy-down', 'Annual health check'],
    coverOptions: [500000, 1500000, 2500000],
    yearlyPremiumPerLakh: 1400,
    coversWedding: false,
    features: { cashless: true, icu: true, prepost: true, maternity: true, checkup: true },
  },
  {
    id: 'health-nest',
    typeId: 'health',
    companyId: 'nestshield',
    name: 'Nest Child Care',
    category: 'Health',
    summary: 'Child-first hospital cover with strong ICU support and cashless claims.',
    highlights: ['Paediatric cashless focus', 'ICU without room-rent cap on critical care', 'Second opinion support'],
    coverOptions: [500000, 1000000, 2000000],
    yearlyPremiumPerLakh: 1300,
    coversWedding: false,
    features: { cashless: true, icu: true, prepost: false, maternity: false, checkup: true },
  },

  // Accident — all 3 companies
  {
    id: 'accident-secure',
    typeId: 'accident',
    companyId: 'secure-care',
    name: 'Secure Accident Shield',
    category: 'Accident',
    summary: 'Accident cover with hospitalisation and disability benefit for your child.',
    highlights: ['Fractures and burns covered', 'Ambulance after accident', 'Permanent disability benefit'],
    coverOptions: [200000, 500000, 1000000],
    yearlyPremiumPerLakh: 280,
    coversWedding: false,
    features: { fracture: true, ambulance: true, disability: true, hospital: true },
  },
  {
    id: 'accident-bright',
    typeId: 'accident',
    companyId: 'brightlife',
    name: 'Child Accident Cover',
    category: 'Accident',
    summary: 'Affordable protection against accidental injury, from falls to road incidents.',
    highlights: ['Fractures, burns and emergency treatment', 'Ambulance cost after an accident', 'Benefit payable for permanent disability'],
    coverOptions: [200000, 500000],
    yearlyPremiumPerLakh: 300,
    coversWedding: false,
    features: { fracture: true, ambulance: true, disability: true, hospital: false },
  },
  {
    id: 'accident-nest',
    typeId: 'accident',
    companyId: 'nestshield',
    name: 'Nest Accident Care',
    category: 'Accident',
    summary: 'School and play accident cover with quick digital claims.',
    highlights: ['Playground and school incidents', 'Day-care accidental treatment', 'App-based claim filing'],
    coverOptions: [300000, 700000],
    yearlyPremiumPerLakh: 320,
    coversWedding: false,
    features: { fracture: true, ambulance: false, disability: true, hospital: true },
  },

  // Savings — all 3 companies
  {
    id: 'savings-secure',
    typeId: 'savings',
    companyId: 'secure-care',
    name: 'Secure Education Plan',
    category: 'Savings',
    summary: 'Save for school and college with life cover on the paying parent.',
    highlights: ['Education corpus at maturity', 'Parent life cover included', 'Flexible premium term'],
    coverOptions: [200000, 500000, 1000000],
    yearlyPremiumPerLakh: 8800,
    coversWedding: false,
    features: { fixedPremium: true, maturity: true, waiver: false, lifeCover: true },
  },
  {
    id: 'savings-bright',
    typeId: 'savings',
    companyId: 'brightlife',
    name: 'Bright Future Saver',
    category: 'Savings',
    summary: 'Goal-based child savings with digital premium tracking.',
    highlights: ['Goal tracker in app', 'Maturity payout options', 'Premium holiday option'],
    coverOptions: [100000, 400000, 800000],
    yearlyPremiumPerLakh: 9200,
    coversWedding: false,
    features: { fixedPremium: false, maturity: true, waiver: true, lifeCover: false },
  },
  {
    id: 'savings-nest',
    typeId: 'savings',
    companyId: 'nestshield',
    name: 'Child Savings Plan',
    category: 'Savings',
    summary: 'Build a corpus for school and college while your child is covered.',
    highlights: ['Fixed premium for the full term', 'Corpus paid out at the chosen maturity age', 'Waiver of future premiums if the parent is unable to pay'],
    coverOptions: [100000, 300000, 500000],
    yearlyPremiumPerLakh: 9000,
    coversWedding: false,
    features: { fixedPremium: true, maturity: true, waiver: true, lifeCover: true },
  },

  // Wedding — all 3 companies
  {
    id: 'wedding-secure',
    typeId: 'wedding',
    companyId: 'secure-care',
    name: 'Secure Wedding Goal',
    category: 'Wedding',
    summary: 'Dedicated wedding corpus with accidental cover for the child.',
    highlights: ['Wedding corpus guarantee', 'Accident rider', 'Tax-benefit illustration'],
    coverOptions: [750000, 1500000],
    yearlyPremiumPerLakh: 8200,
    coversWedding: true,
    features: { weddingCorpus: true, lifeCover: true, flexiblePayout: true, rider: false, accident: true },
  },
  {
    id: 'wedding-bright',
    typeId: 'wedding',
    companyId: 'brightlife',
    name: 'Bright Milestone Cover',
    category: 'Wedding',
    summary: 'Wedding and life-milestone savings with celebration benefit.',
    highlights: ['Milestone payouts', 'Celebration rider', 'Optional parent cover'],
    coverOptions: [500000, 1200000, 2000000],
    yearlyPremiumPerLakh: 7900,
    coversWedding: true,
    features: { weddingCorpus: true, lifeCover: false, flexiblePayout: true, rider: true, accident: false },
  },
  {
    id: 'wedding-nest',
    typeId: 'wedding',
    companyId: 'nestshield',
    name: 'Wedding & Milestone Cover',
    category: 'Wedding',
    summary: 'Save toward wedding and life milestones with life cover for the parent.',
    highlights: ['Goal-based corpus for wedding expenses', 'Optional life cover for the paying parent', 'Flexible payout at age 18–25', 'Wedding celebration benefit rider included'],
    coverOptions: [500000, 1000000, 2000000],
    yearlyPremiumPerLakh: 7500,
    coversWedding: true,
    features: { weddingCorpus: true, lifeCover: true, flexiblePayout: true, rider: true, accident: false },
  },
];

export const INSURANCE_FREQUENCY_OPTIONS: { value: InsuranceFrequency; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export const NOMINEE_RELATIONS = ['Mother', 'Father', 'Grandparent', 'Guardian', 'Other'];

export const INSURANCE_DISCLAIMER =
  'This is a prototype. Premiums and terms are illustrative, and no policy is issued by a real insurer.';

export function getInsuranceType(id: string) {
  return INSURANCE_TYPES.find((type) => type.id === id);
}

export function getInsurancePlan(id: string) {
  return INSURANCE_PLANS.find((plan) => plan.id === id);
}

export function getInsuranceCompany(id: string) {
  return INSURANCE_COMPANIES.find((company) => company.id === id);
}

export function plansForType(typeId: InsuranceTypeId) {
  return INSURANCE_PLANS.filter((plan) => plan.typeId === typeId);
}

export function plansForCompany(companyId: string) {
  return INSURANCE_PLANS.filter((plan) => plan.companyId === companyId);
}

export function isValidCover(plan: InsurancePlan, cover: number) {
  return plan.coverOptions.includes(cover);
}

export function premiumFor(plan: InsurancePlan, cover: number, frequency: InsuranceFrequency) {
  const yearly = Math.round((cover / 100000) * plan.yearlyPremiumPerLakh);
  return frequency === 'yearly' ? yearly : Math.ceil(yearly / 12);
}

export function startingPremium(plan: InsurancePlan) {
  return premiumFor(plan, plan.coverOptions[0], 'monthly');
}

export function typeStartingFrom(typeId: InsuranceTypeId) {
  const plans = plansForType(typeId);
  if (plans.length === 0) return 0;
  return Math.min(...plans.map(startingPremium));
}
