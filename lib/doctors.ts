export const CONSULT_SLOTS = [
  '9:00 AM',
  '9:30 AM',
  '10:00 AM',
  '11:00 AM',
  '12:30 PM',
  '2:00 PM',
  '3:30 PM',
  '5:00 PM',
  '6:30 PM',
] as const;

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experience: number;
  rating: number;
  reviews: number;
  onlineFee: number;
  offlineFee: number;
  clinic: string;
  languages: string[];
  about: string;
  image: string;
};

export const DOCTORS: Doctor[] = [
  {
    id: 'ayesha',
    name: 'Dr. Ayesha Khan',
    specialty: 'Pediatrician',
    qualification: 'MBBS, MD (Paediatrics)',
    experience: 12,
    rating: 4.9,
    reviews: 812,
    onlineFee: 399,
    offlineFee: 599,
    clinic: 'Bliss Care Clinic, Indiranagar',
    languages: ['English', 'Hindi', 'Urdu'],
    about: 'Routine newborn and toddler care, vaccinations, feeding guidance and fever management.',
    image: 'https://images.pexels.com/photos/37272329/pexels-photo-37272329.png?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'rahul',
    name: 'Dr. Rahul Mehta',
    specialty: 'Child specialist',
    qualification: 'MBBS, DNB (Paediatric Pulmonology)',
    experience: 15,
    rating: 4.8,
    reviews: 640,
    onlineFee: 499,
    offlineFee: 699,
    clinic: 'Little Lungs Centre, Koramangala',
    languages: ['English', 'Hindi'],
    about: 'Cough, wheeze, asthma and allergy care for children, with a focus on breathing health.',
    image: 'https://images.pexels.com/photos/19601385/pexels-photo-19601385.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'neha',
    name: 'Dr. Neha Sharma',
    specialty: 'Pediatric nutritionist',
    qualification: 'MBBS, PGDCN',
    experience: 9,
    rating: 4.7,
    reviews: 388,
    onlineFee: 349,
    offlineFee: 499,
    clinic: 'Bliss Care Clinic, Indiranagar',
    languages: ['English', 'Hindi', 'Punjabi'],
    about: 'Weaning plans, picky eating, growth concerns and healthy meal planning for toddlers.',
    image: 'https://images.pexels.com/photos/30270934/pexels-photo-30270934.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'arjun',
    name: 'Dr. Arjun Iyer',
    specialty: 'Neonatologist',
    qualification: 'MBBS, DM (Neonatology)',
    experience: 18,
    rating: 4.9,
    reviews: 1024,
    onlineFee: 549,
    offlineFee: 799,
    clinic: 'Mother & Baby Hospital, Jayanagar',
    languages: ['English', 'Kannada', 'Tamil'],
    about: 'Care for premature and newborn babies, jaundice management and early development follow-up.',
    image: 'https://images.pexels.com/photos/9271168/pexels-photo-9271168.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'vikram',
    name: 'Dr. Vikram Shah',
    specialty: 'Pediatric dermatologist',
    qualification: 'MBBS, MD (Dermatology)',
    experience: 10,
    rating: 4.6,
    reviews: 275,
    onlineFee: 449,
    offlineFee: 649,
    clinic: 'Skin & Smile Clinic, HSR Layout',
    languages: ['English', 'Hindi', 'Gujarati'],
    about: 'Diaper rash, eczema, baby acne and gentle skincare routines for sensitive skin.',
    image: 'https://images.pexels.com/photos/39172781/pexels-photo-39172781.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
];

export function getDoctor(id: string) {
  return DOCTORS.find((d) => d.id === id);
}
