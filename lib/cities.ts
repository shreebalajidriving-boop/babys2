export const CITIES = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune'] as const;
export type City = (typeof CITIES)[number];
