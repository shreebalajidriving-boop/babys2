import type { Gender, ThemeKey, ThemeOverride } from '@/lib/types';

export type Palette = {
  key: ThemeKey;
  name: string;
  primary: string;
  strong: string;
  background: string;
  secondary: string;
  card: string;
  ink: string;
  muted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
};

const shared = {
  card: '#FFFFFF',
  ink: '#1E2433',
  muted: '#5B6575',
  border: '#E3E7EE',
  success: '#2F855A',
  warning: '#B7791F',
  error: '#C53030',
};

export const PALETTES: Record<ThemeKey, Palette> = {
  blue: {
    key: 'blue',
    name: 'Soft Baby Blue',
    primary: '#79A9F5',
    strong: '#3569C9',
    background: '#F2F7FF',
    secondary: '#DCEAFF',
    ...shared,
  },
  pink: {
    key: 'pink',
    name: 'Baby Pink',
    primary: '#EFA8C5',
    strong: '#B8456F',
    background: '#FFF3F8',
    secondary: '#FADCE9',
    ...shared,
  },
  neutral: {
    key: 'neutral',
    name: 'Neutral Sage',
    primary: '#9CC9B9',
    strong: '#2F7D6B',
    background: '#F5F8F7',
    secondary: '#DDEFE8',
    ...shared,
  },
};

export function resolveThemeKey(gender: Gender | undefined, override: ThemeOverride): ThemeKey {
  if (override) return override;
  if (gender === 'male') return 'blue';
  if (gender === 'female') return 'pink';
  return 'neutral';
}

export const FONT = {
  regular: 'Nunito-Regular',
  semibold: 'Nunito-SemiBold',
  bold: 'Nunito-Bold',
} as const;
