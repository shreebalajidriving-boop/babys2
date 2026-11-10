export const LAB_SLOTS = [
  '7:00 - 8:00 AM',
  '8:00 - 9:00 AM',
  '9:00 - 10:00 AM',
  '11:00 AM - 12:00 PM',
  '4:00 - 5:00 PM',
  '6:00 - 7:00 PM',
] as const;

export type LabTest = {
  id: string;
  name: string;
  category: 'Routine' | 'Vitamins' | 'Allergy' | 'Newborn';
  price: number;
  mrp: number;
  sample: string;
  fasting: boolean;
  reportIn: string;
  description: string;
  preparation: string;
};

export const LAB_TESTS: LabTest[] = [
  {
    id: 'cbc',
    name: 'Complete blood count (CBC)',
    category: 'Routine',
    price: 450,
    mrp: 650,
    sample: 'Blood',
    fasting: false,
    reportIn: '6 hours',
    description: 'Checks haemoglobin, white and red cells and platelets. Useful for fever, anaemia and general health checks.',
    preparation: 'No preparation needed. Eat normally before the test.',
  },
  {
    id: 'vitd',
    name: 'Vitamin D (25-OH) test',
    category: 'Vitamins',
    price: 899,
    mrp: 1400,
    sample: 'Blood',
    fasting: false,
    reportIn: '24 hours',
    description: 'Measures vitamin D levels to guide supplementation for bone growth and immunity.',
    preparation: 'No preparation needed.',
  },
  {
    id: 'ferritin',
    name: 'Iron studies with ferritin',
    category: 'Vitamins',
    price: 699,
    mrp: 999,
    sample: 'Blood',
    fasting: true,
    reportIn: '12 hours',
    description: 'Assesses iron stores and helps detect iron deficiency anaemia in toddlers.',
    preparation: 'Fast for 8 hours before the test. Water is allowed.',
  },
  {
    id: 'allergy',
    name: 'Paediatric allergy panel (IgE)',
    category: 'Allergy',
    price: 1499,
    mrp: 2200,
    sample: 'Blood',
    fasting: false,
    reportIn: '48 hours',
    description: 'Screens for common food and environmental allergens such as milk, egg, dust and pollen.',
    preparation: 'Stop antihistamines 3 days before the test, after checking with your doctor.',
  },
  {
    id: 'newborn',
    name: 'Newborn metabolic screen',
    category: 'Newborn',
    price: 2499,
    mrp: 3200,
    sample: 'Heel prick',
    fasting: false,
    reportIn: '72 hours',
    description: 'Early screening for inherited metabolic and thyroid conditions in the first weeks of life.',
    preparation: 'Collect for babies aged 3 to 28 days. The phlebotomist handles everything at home.',
  },
  {
    id: 'thyroid',
    name: 'Thyroid profile (T3, T4, TSH)',
    category: 'Routine',
    price: 599,
    mrp: 900,
    sample: 'Blood',
    fasting: false,
    reportIn: '12 hours',
    description: 'Checks thyroid function for growth, energy and development concerns.',
    preparation: 'No preparation needed.',
  },
];

export type Lab = { id: string; name: string; distance: string; rating: number };

export const LABS: Lab[] = [
  { id: 'bliss', name: 'Bliss Diagnostics', distance: '1.2 km away', rating: 4.8 },
  { id: 'citypath', name: 'CityPath Labs', distance: '2.6 km away', rating: 4.6 },
  { id: 'apex', name: 'Apex Pathology Hub', distance: '3.9 km away', rating: 4.7 },
];

export function getLabTest(id: string) {
  return LAB_TESTS.find((t) => t.id === id);
}

export function getLab(id: string) {
  return LABS.find((l) => l.id === id);
}
