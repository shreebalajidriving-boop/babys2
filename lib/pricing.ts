import { getProduct } from '@/lib/catalog';
import { formatINR } from '@/lib/format';
import type { CartItem } from '@/lib/types';

type Coupon = {
  code: string;
  minSubtotal: number;
  percent?: number;
  maxDiscount?: number;
  flat?: number;
  freeDelivery?: boolean;
};

export const COUPONS: Coupon[] = [
  { code: 'BLISS10', minSubtotal: 499, percent: 10, maxDiscount: 300 },
  { code: 'WELCOME200', minSubtotal: 999, flat: 200 },
  { code: 'FREEDEL', minSubtotal: 0, freeDelivery: true },
];

export const COUPON_HINT = 'Try BLISS10, WELCOME200 or FREEDEL';
const DELIVERY_FEE = 49;
const FREE_DELIVERY_ABOVE = 499;
export const MEMBER_DISCOUNT_PERCENT = 5;

export function subtotalOf(items: CartItem[]) {
  return items.reduce((sum, item) => {
    const product = getProduct(item.productId);
    return product ? sum + product.price * item.qty : sum;
  }, 0);
}

export function validateCoupon(code: string, subtotal: number): { ok: true; coupon: Coupon } | { ok: false; error: string } {
  const coupon = COUPONS.find((c) => c.code === code.trim().toUpperCase());
  if (!coupon) return { ok: false, error: 'This coupon code is not valid.' };
  if (subtotal < coupon.minSubtotal) {
    return {
      ok: false,
      error: `Add ${formatINR(coupon.minSubtotal - subtotal)} more to use ${coupon.code}.`,
    };
  }
  return { ok: true, coupon };
}

export function computeTotals(items: CartItem[], couponCode: string | null, isMember: boolean) {
  const subtotal = subtotalOf(items);
  const result = couponCode ? validateCoupon(couponCode, subtotal) : null;
  const coupon = result?.ok ? result.coupon : null;

  let couponDiscount = 0;
  if (coupon?.percent) {
    couponDiscount = Math.min(Math.round((subtotal * coupon.percent) / 100), coupon.maxDiscount ?? Infinity);
  }
  if (coupon?.flat) {
    couponDiscount = Math.min(coupon.flat, subtotal);
  }

  const memberDiscount = isMember ? Math.round(((subtotal - couponDiscount) * MEMBER_DISCOUNT_PERCENT) / 100) : 0;
  const discount = couponDiscount + memberDiscount;

  const freeDelivery = isMember || Boolean(coupon?.freeDelivery) || subtotal >= FREE_DELIVERY_ABOVE || subtotal === 0;
  const delivery = freeDelivery ? 0 : DELIVERY_FEE;

  return {
    subtotal,
    couponDiscount,
    memberDiscount,
    discount,
    delivery,
    total: subtotal - discount + delivery,
    couponApplied: coupon?.code ?? null,
    couponError: result && !result.ok ? result.error : null,
    freeDeliveryThreshold: FREE_DELIVERY_ABOVE,
  };
}
