import type { ComponentType } from 'react';
import { Apple, Armchair, Baby, Droplets, Heart, Milk, Puzzle, Shirt, Stethoscope } from 'lucide-react-native';

export type Category = {
  id: string;
  name: string;
  icon: ComponentType<{ size?: number; color?: string }>;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  categoryId: string;
  mrp: number;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  variants: string[];
  description: string;
  highlights: string[];
};

export type Review = { name: string; rating: number; text: string };

const px = (id: string, ext = 'jpeg') =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}?auto=compress&cs=tinysrgb&h=650&w=940`;

export const CATEGORIES: Category[] = [
  { id: 'clothing', name: 'Baby Clothing', icon: Shirt },
  { id: 'diapers', name: 'Diapers & Wipes', icon: Baby },
  { id: 'food', name: 'Baby Food & Nutrition', icon: Apple },
  { id: 'bath', name: 'Bath & Skincare', icon: Droplets },
  { id: 'healthcare', name: 'Baby Healthcare', icon: Stethoscope },
  { id: 'toys', name: 'Toys & Accessories', icon: Puzzle },
  { id: 'feeding', name: 'Feeding Products', icon: Milk },
  { id: 'furniture', name: 'Baby Furniture', icon: Armchair },
  { id: 'momcare', name: 'Mom Care', icon: Heart },
];

export const PRODUCTS: Product[] = [
  {
    id: 'dry-pants',
    name: 'Dry Comfort Pants Diapers',
    brand: 'SoftNest',
    categoryId: 'diapers',
    mrp: 1299,
    price: 999,
    rating: 4.6,
    reviews: 2140,
    image: px('6849268'),
    variants: ['Small (4-8 kg)', 'Medium (6-11 kg)', 'Large (9-14 kg)'],
    description:
      'Super-absorbent pants with a 12-hour leak guard and a soft, breathable top sheet that stays dry through busy days.',
    highlights: ['Pack of 44', '12-hour leak protection', 'Lotion-enriched top sheet', 'Dermatologically tested'],
  },
  {
    id: 'gentle-wipes',
    name: 'Fragrance-Free Baby Wipes',
    brand: 'Little Cloud',
    categoryId: 'diapers',
    mrp: 349,
    price: 249,
    rating: 4.4,
    reviews: 980,
    image: px('21268301'),
    variants: ['Pack of 80', 'Pack of 160'],
    description: 'Alcohol-free wipes soaked in aloe and water for gentle cleaning on delicate skin.',
    highlights: ['99% water', 'Alcohol and paraben free', 'Resealable pouch'],
  },
  {
    id: 'romper-set',
    name: 'Organic Cotton Romper Set',
    brand: 'Tiny Petal',
    categoryId: 'clothing',
    mrp: 1199,
    price: 799,
    rating: 4.7,
    reviews: 412,
    image: px('5693888'),
    variants: ['0-3 M', '3-6 M', '6-12 M'],
    description: 'Certified organic cotton romper with snap buttons for quick changes and a relaxed, breathable fit.',
    highlights: ['100% GOTS certified organic cotton', 'Covered snap buttons', 'Machine washable'],
  },
  {
    id: 'muslin-swaddle',
    name: 'Muslin Swaddle Blanket (Pack of 2)',
    brand: 'Hug & Hush',
    categoryId: 'clothing',
    mrp: 899,
    price: 599,
    rating: 4.8,
    reviews: 1260,
    image: px('5693889'),
    variants: ['Cream', 'Sky Blue', 'Blush'],
    description: 'Six-layer muslin swaddles that are light, airy and soft enough for everyday naps.',
    highlights: ['Six-layer muslin', '120 x 120 cm', 'Pre-washed for softness'],
  },
  {
    id: 'tear-free-shampoo',
    name: 'Tear-Free Baby Shampoo',
    brand: 'PureDrop',
    categoryId: 'bath',
    mrp: 349,
    price: 279,
    rating: 4.5,
    reviews: 3120,
    image: px('33537352', 'png'),
    variants: ['200 ml', '400 ml'],
    description: 'A gentle, no-tears formula that cleans hair and scalp without stinging little eyes.',
    highlights: ['No tears formula', 'Paraben free', 'Dermatologist approved'],
  },
  {
    id: 'oat-lotion',
    name: 'Oat Milk Baby Lotion',
    brand: 'PureDrop',
    categoryId: 'bath',
    mrp: 449,
    price: 349,
    rating: 4.3,
    reviews: 860,
    image: px('27561830'),
    variants: ['Fragrance Free', 'Chamomile'],
    description: 'A light daily lotion with colloidal oat that keeps delicate skin soft for up to 24 hours.',
    highlights: ['Colloidal oat', '24-hour hydration', 'Non-greasy finish'],
  },
  {
    id: 'stretch-cream',
    name: 'Stretch Mark Recovery Cream',
    brand: 'Bloom Baby',
    categoryId: 'momcare',
    mrp: 699,
    price: 549,
    rating: 4.4,
    reviews: 530,
    image: px('7135161'),
    variants: ['100 g', '200 g'],
    description: 'A nourishing cream with shea butter and vitamin E to support skin elasticity after pregnancy.',
    highlights: ['Shea butter and vitamin E', 'Fragrance light', 'Suitable for nursing mothers'],
  },
  {
    id: 'anti-colic-bottle',
    name: 'Anti-Colic Feeding Bottle 260 ml',
    brand: 'Bloom Baby',
    categoryId: 'feeding',
    mrp: 599,
    price: 449,
    rating: 4.6,
    reviews: 1890,
    image: px('20387764'),
    variants: ['Green', 'Blue'],
    description: 'A vented feeding bottle that reduces air intake, helping to ease gas and colic during feeds.',
    highlights: ['Vented valve', 'BPA free', 'Wide neck for easy cleaning'],
  },
  {
    id: 'silicone-set',
    name: 'Silicone Bowl and Spoon Set',
    brand: 'Tiny Petal',
    categoryId: 'feeding',
    mrp: 549,
    price: 399,
    rating: 4.5,
    reviews: 310,
    image: px('20387931'),
    variants: ['Pink', 'Mint'],
    description: 'Suction-base bowl and soft-tip spoon that are easy to grip and safe for first solids.',
    highlights: ['Suction base', 'Food-grade silicone', 'Dishwasher safe'],
  },
  {
    id: 'veggie-pouch',
    name: 'Stage 2 Veggie Puree Pouches (6 Pack)',
    brand: 'Nestling Foods',
    categoryId: 'food',
    mrp: 560,
    price: 480,
    rating: 4.2,
    reviews: 640,
    image: px('34531190'),
    variants: ['Carrot & Pea', 'Apple & Oat'],
    description: 'Smooth vegetable purees with no added sugar, made for babies moving on to 6 months and above.',
    highlights: ['No added sugar', 'Iron fortified', 'Ready to serve'],
  },
  {
    id: 'wooden-puzzle',
    name: 'Wooden Animal Puzzle',
    brand: 'Woodbee',
    categoryId: 'toys',
    mrp: 999,
    price: 699,
    rating: 4.7,
    reviews: 240,
    image: px('4309152'),
    variants: ['Elephant', 'Lion'],
    description: 'Chunky wooden puzzle pieces with painted, non-toxic finishes that build fine motor skills.',
    highlights: ['Non-toxic paint', 'Ages 2 and above', 'Builds hand-eye coordination'],
  },
  {
    id: 'sensory-teether',
    name: 'Sensory Rattle Teether Set',
    brand: 'Woodbee',
    categoryId: 'toys',
    mrp: 499,
    price: 349,
    rating: 4.4,
    reviews: 512,
    image: px('4309155'),
    variants: ['Ocean', 'Forest'],
    description: 'A set of three textured teethers and rattles that soothe gums and encourage grasping.',
    highlights: ['Three pieces', 'Textured for sensory play', 'BPA free silicone'],
  },
  {
    id: 'travel-stroller',
    name: 'Lightweight Travel Stroller',
    brand: 'Trekko',
    categoryId: 'furniture',
    mrp: 10499,
    price: 7999,
    rating: 4.5,
    reviews: 188,
    image: px('10840740'),
    variants: ['Grey', 'Mint'],
    description: 'A compact, one-hand fold stroller with a reclining seat and a sun canopy for city walks.',
    highlights: ['One-hand fold', 'Reclines flat', 'Suitable from birth to 4 years'],
  },
  {
    id: 'digital-thermometer',
    name: 'Quick-Read Digital Thermometer',
    brand: 'CareTone',
    categoryId: 'healthcare',
    mrp: 799,
    price: 499,
    rating: 4.6,
    reviews: 1400,
    image: px('32299511'),
    variants: ['Standard'],
    description: 'A flexible-tip thermometer that gives a clear reading in about 10 seconds with a beeping alert.',
    highlights: ['10 second reading', 'Flexible tip', 'Memory of last reading'],
  },
];

export const REVIEWS: Review[] = [
  { name: 'Ananya K.', rating: 5, text: 'Very soft and the fit is great. Would buy again.' },
  { name: 'Rohit M.', rating: 4, text: 'Good quality for the price. Delivery was on time.' },
  { name: 'Sneha P.', rating: 5, text: 'My daughter has sensitive skin and it has never caused a rash.' },
];

export function getProduct(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}

export function getCategory(id: string) {
  return CATEGORIES.find((c) => c.id === id);
}

export function productsInCategory(categoryId: string) {
  return PRODUCTS.filter((p) => p.categoryId === categoryId);
}

export function searchProducts(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PRODUCTS.filter((p) => {
    const categoryName = getCategory(p.categoryId)?.name ?? '';
    return [p.name, p.brand, categoryName].some((field) => field.toLowerCase().includes(q));
  });
}
