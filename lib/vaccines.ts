import { formatIsoDate, toIsoDate } from '@/lib/schedule';
import type { Child } from '@/lib/types';

export type Vaccine = {
  id: string;
  name: string;
  protects: string;
  dueDays: number;
  dueLabel: string;
};

export const VACCINE_DISCLAIMER =
  'This is a general routine schedule for tracking. Your child’s doctor may adjust timing and catch-up doses.';

export const VACCINES: Vaccine[] = [
  { id: 'bcg', name: 'BCG', protects: 'Tuberculosis', dueDays: 0, dueLabel: 'At birth' },
  { id: 'hepb-birth', name: 'Hepatitis B (birth dose)', protects: 'Hepatitis B liver infection', dueDays: 0, dueLabel: 'At birth' },
  { id: 'penta-1', name: 'Pentavalent and OPV (1st)', protects: 'Diphtheria, whooping cough, tetanus, polio, hepatitis B, Hib', dueDays: 42, dueLabel: '6 weeks' },
  { id: 'rota-1', name: 'Rotavirus (1st)', protects: 'Severe diarrhoea and dehydration', dueDays: 42, dueLabel: '6 weeks' },
  { id: 'pcv-1', name: 'Pneumococcal (1st)', protects: 'Pneumonia and meningitis', dueDays: 42, dueLabel: '6 weeks' },
  { id: 'penta-2', name: 'Pentavalent and OPV (2nd)', protects: 'Same protection as the 1st dose', dueDays: 70, dueLabel: '10 weeks' },
  { id: 'penta-3', name: 'Pentavalent and OPV (3rd)', protects: 'Same protection as the 1st dose', dueDays: 98, dueLabel: '14 weeks' },
  { id: 'mmr-1', name: 'Measles and rubella (1st)', protects: 'Measles and German measles', dueDays: 274, dueLabel: '9 months' },
  { id: 'hepa', name: 'Hepatitis A', protects: 'Hepatitis A liver infection', dueDays: 365, dueLabel: '12 months' },
  { id: 'mmr-2', name: 'Measles, rubella and varicella (2nd)', protects: 'Measles, rubella and chickenpox', dueDays: 456, dueLabel: '15 months' },
  { id: 'dtp-booster', name: 'DTP and Hib booster', protects: 'Diphtheria, tetanus, whooping cough', dueDays: 548, dueLabel: '18 months' },
  { id: 'dtp-school', name: 'DTP booster (school entry)', protects: 'Diphtheria, tetanus, whooping cough', dueDays: 1460, dueLabel: '4 to 6 years' },
];

export type VaccineStatus = 'done' | 'due' | 'upcoming';

const ISO_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const MAX_AGE_YEARS = 8;

export function addDays(iso: string, days: number) {
  const [y, m, d] = iso.split('-').map(Number);
  return toIsoDate(new Date(y, m - 1, d + days));
}

export function dueDateFor(birthDate: string, vaccine: Vaccine) {
  return addDays(birthDate, vaccine.dueDays);
}

export function vaccineStatus(given: boolean, dueIso: string, todayIso: string): VaccineStatus {
  if (given) return 'done';
  return dueIso <= todayIso ? 'due' : 'upcoming';
}

export function nextVaccineFor(birthDate: string, givenKeys: string[], childId: string, todayIso: string) {
  const givenSet = new Set(givenKeys);
  const next = VACCINES.find((vaccine) => !givenSet.has(`${childId}|${vaccine.id}`));
  if (!next) return null;
  const dueIso = dueDateFor(birthDate, next);
  return { vaccine: next, dueIso, status: dueIso <= todayIso ? 'due' : 'upcoming' } as const;
}

export type VaccineReminder = {
  title: string;
  body: string;
  actionLabel: string;
};

export function vaccineReminder(child: Child | null, givenKeys: string[], todayIso: string): VaccineReminder | null {
  if (!child) return null;
  if (!child.birthDate) {
    return {
      title: 'Track your child\u2019s vaccines',
      body: `Add ${child.name}\u2019s date of birth to see what is due next.`,
      actionLabel: 'Add date',
    };
  }
  const next = nextVaccineFor(child.birthDate, givenKeys, child.id, todayIso);
  if (!next) {
    return {
      title: `${child.name}\u2019s routine vaccines are up to date`,
      body: 'Nothing is due right now. Your schedule is still available for reference.',
      actionLabel: 'View',
    };
  }
  return {
    title: next.status === 'due' ? `${next.vaccine.name} is due now` : `${next.vaccine.name} due ${formatIsoDate(next.dueIso)}`,
    body: `For ${child.name}. Protects against ${next.vaccine.protects.toLowerCase()}.`,
    actionLabel: 'View',
  };
}

export function ageLabel(birthDate: string, todayIso: string) {
  const [by, bm, bd] = birthDate.split('-').map(Number);
  const [ty, tm, td] = todayIso.split('-').map(Number);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  const days = Math.floor((Date.parse(todayIso) - Date.parse(birthDate)) / 86_400_000);
  if (months < 1) return `${days} day${days === 1 ? '' : 's'} old`;
  if (months < 24) return `${months} month${months === 1 ? '' : 's'} old`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return `${years} year${years === 1 ? '' : 's'}${rest ? ` ${rest} month${rest === 1 ? '' : 's'}` : ''} old`;
}

// Accepts dd/mm/yyyy as typed by a parent and returns yyyy-mm-dd, or an error message.
export function parseBirthDate(input: string, todayIso: string): { iso: string } | { error: string } {
  const match = ISO_PATTERN.exec(input.trim());
  if (!match) return { error: 'Enter the date as day/month/year, for example 14/03/2025.' };
  const [, dd, mm, yyyy] = match;
  const iso = `${yyyy}-${mm}-${dd}`;
  const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (toIsoDate(parsed) !== iso) return { error: 'That date does not exist. Please check it.' };
  if (iso > todayIso) return { error: 'The date of birth cannot be in the future.' };
  const earliest = addDays(todayIso, -MAX_AGE_YEARS * 366);
  if (iso < earliest) return { error: 'This app covers children up to 7 years old.' };
  return { iso };
}
