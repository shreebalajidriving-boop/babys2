export function formatINR(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function discountPercent(mrp: number, price: number) {
  return Math.round((1 - price / mrp) * 100);
}

export function formatDelivery(daysFromNow: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function formatOrderDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
