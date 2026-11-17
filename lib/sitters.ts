import type { AGE_GROUPS } from '@/components/ChildForm';

export type AgeGroup = (typeof AGE_GROUPS)[number];

export type Sitter = {
  id: string;
  name: string;
  experience: number;
  rating: number;
  reviews: number;
  hourlyRate: number;
  cprCertified: boolean;
  languages: string[];
  ageGroups: AgeGroup[];
  about: string;
  image: string;
};

export const SITTERS: Sitter[] = [
  {
    id: 'meera-iyer',
    name: 'Meera Iyer',
    experience: 8,
    rating: 4.9,
    reviews: 214,
    hourlyRate: 249,
    cprCertified: true,
    languages: ['English', 'Tamil', 'Hindi'],
    ageGroups: ['6-12 months', '1-2 years', '2-4 years'],
    about: 'Former preschool teacher who loves structured play, reading time and calm bedtime routines.',
    image: 'https://images.pexels.com/photos/6859299/pexels-photo-6859299.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'priya-nair',
    name: 'Priya Nair',
    experience: 5,
    rating: 4.8,
    reviews: 165,
    hourlyRate: 199,
    cprCertified: true,
    languages: ['English', 'Malayalam', 'Hindi'],
    ageGroups: ['1-2 years', '2-4 years', '4-7 years'],
    about: 'Energetic and creative. Great with art, outdoor games and helping with homework.',
    image: 'https://images.pexels.com/photos/15074990/pexels-photo-15074990.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'sunita-rao',
    name: 'Sunita Rao',
    experience: 12,
    rating: 4.9,
    reviews: 302,
    hourlyRate: 279,
    cprCertified: true,
    languages: ['English', 'Kannada', 'Telugu'],
    ageGroups: ['0-6 months', '6-12 months', '1-2 years'],
    about: 'Trained infant caregiver, comfortable with feeding, nap schedules and baby-proofed play spaces.',
    image: 'https://images.pexels.com/photos/7717254/pexels-photo-7717254.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'fatima-sheikh',
    name: 'Fatima Sheikh',
    experience: 3,
    rating: 4.6,
    reviews: 88,
    hourlyRate: 179,
    cprCertified: false,
    languages: ['English', 'Hindi', 'Urdu'],
    ageGroups: ['1-2 years', '4-7 years'],
    about: 'Patient and punctual, with a gentle approach to meals, storytelling and screen-free afternoons.',
    image: 'https://images.pexels.com/photos/3936894/pexels-photo-3936894.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'anjali-das',
    name: 'Anjali Das',
    experience: 6,
    rating: 4.7,
    reviews: 129,
    hourlyRate: 219,
    cprCertified: true,
    languages: ['English', 'Bengali', 'Hindi'],
    ageGroups: ['2-4 years', '4-7 years'],
    about: 'Loves music, science experiments and building forts. Strong routine with school-age kids too.',
    image: 'https://images.pexels.com/photos/15827759/pexels-photo-15827759.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'kavya-menon',
    name: 'Kavya Menon',
    experience: 2,
    rating: 4.5,
    reviews: 41,
    hourlyRate: 159,
    cprCertified: false,
    languages: ['English', 'Malayalam'],
    ageGroups: ['0-6 months', '6-12 months'],
    about: 'Caring newborn specialist for short evening shifts, with a calm and reassuring manner.',
    image: 'https://images.pexels.com/photos/38624440/pexels-photo-38624440.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
];

export type SitterPlanOption = 'once' | 'week' | 'month';
export type SitterSlotBand = 'morning' | 'afternoon' | 'night';

export const SITTER_PLAN_OPTIONS: { value: SitterPlanOption; label: string; hint: string; multiplier: number }[] = [
  { value: 'once', label: 'One day', hint: 'Single booking', multiplier: 1 },
  { value: 'week', label: 'Weekly', hint: 'Same slot for 7 days', multiplier: 6.5 },
  { value: 'month', label: 'Monthly', hint: 'Same slot for 30 days', multiplier: 24 },
];

export const SITTER_SLOT_BANDS: {
  value: SitterSlotBand;
  label: string;
  hint: string;
  slots: string[];
}[] = [
  { value: 'morning', label: 'Morning 6–12', hint: 'Early care and school drop', slots: ['6:00 AM', '8:00 AM', '10:00 AM'] },
  { value: 'afternoon', label: 'Afternoon 12–6', hint: 'Naps, play and homework', slots: ['12:00 PM', '2:00 PM', '4:00 PM'] },
  { value: 'night', label: 'Night 6–11', hint: 'Dinner, bath and bedtime', slots: ['6:00 PM', '8:00 PM', '9:00 PM'] },
];

export const SITTER_SLOTS = SITTER_SLOT_BANDS.flatMap((band) => band.slots);
export const SITTER_DURATIONS = [2, 4, 6] as const;

export function slotsForBand(band: SitterSlotBand) {
  return SITTER_SLOT_BANDS.find((item) => item.value === band)?.slots ?? [];
}

export function planMultiplier(plan: SitterPlanOption) {
  return SITTER_PLAN_OPTIONS.find((item) => item.value === plan)?.multiplier ?? 1;
}
export const SITTER_REQUIREMENTS = [
  'Bedtime routine',
  'Meal preparation',
  'Homework help',
  'Outdoor play',
  'Medicine reminders',
  'Bath time',
] as const;

export function getSitter(id: string) {
  return SITTERS.find((sitter) => sitter.id === id);
}

function toHour24(time: string) {
  const [clock, period] = time.split(' ');
  const hour = Number(clock.split(':')[0]) % 12;
  return period === 'PM' ? hour + 12 : hour;
}

function formatHour(hour24: number) {
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:00 ${period}`;
}

const LATEST_END_HOUR = 23;

export function maxHoursFrom(startTime: string) {
  return LATEST_END_HOUR - toHour24(startTime);
}

export function endTimeFor(startTime: string, hours: number) {
  return formatHour(toHour24(startTime) + hours);
}

export function sitterTotal(hourlyRate: number, hours: number, plan: SitterPlanOption = 'once') {
  return Math.round(hourlyRate * hours * planMultiplier(plan));
}
