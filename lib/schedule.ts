export type DayOption = { iso: string; weekday: string; day: number; month: string };

export function dayOptions(count: number): DayOption[] {
  return Array.from({ length: count }, (_, offset) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    return {
      iso: toIsoDate(date),
      weekday: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      day: date.getDate(),
      month: date.toLocaleDateString('en-IN', { month: 'short' }),
    };
  });
}

export function toIsoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatIsoDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

// Deterministic mock availability: a stable subset of slots is open per doctor/day,
// and anything already booked in the app is removed.
export function openSlots<T extends string>(
  slots: readonly T[],
  seed: string,
  iso: string,
  booked: readonly string[],
) {
  const dayIndex = Number(iso.slice(-2));
  return slots.map((time, index) => ({
    time,
    available: !booked.includes(time) && (index + dayIndex + seed.length) % 5 !== 0,
  }));
}
