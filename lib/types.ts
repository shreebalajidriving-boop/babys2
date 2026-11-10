export type Gender = 'male' | 'female' | 'other';
export type ThemeKey = 'blue' | 'pink' | 'neutral';
export type ThemeOverride = ThemeKey | null;
export type PaymentMethod = 'upi' | 'card' | 'cod';

export type Child = { id: string; name: string; ageGroup: string; gender: Gender; birthDate?: string };
export type Parent = { name: string; phone: string; city: string };
export type Address = { id: string; label: string; line: string; city: string; pincode: string };
export type CartItem = { key: string; productId: string; variant: string; qty: number };

export type Order = {
  id: string;
  createdAt: number;
  items: CartItem[];
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  address: Address;
  slot: string;
  payment: PaymentMethod;
};

export type ConsultMode = 'online' | 'offline';

export type Appointment = {
  id: string;
  createdAt: number;
  doctorId: string;
  mode: ConsultMode;
  date: string;
  time: string;
  childId: string;
  reason: string;
  fee: number;
  payment: PaymentMethod;
  status: 'confirmed' | 'cancelled';
};

export type LabBooking = {
  id: string;
  createdAt: number;
  testId: string;
  labId: string;
  date: string;
  slot: string;
  childId: string;
  address: string;
  fee: number;
  payment: PaymentMethod;
};

export type SitterBooking = {
  id: string;
  createdAt: number;
  sitterId: string;
  date: string;
  startTime: string;
  hours: number;
  childId: string;
  address: string;
  requirements: string[];
  notes: string;
  total: number;
  payment: PaymentMethod;
  status: 'confirmed' | 'cancelled';
};

export type AssistantMessage = { id: string; role: 'user' | 'assistant'; text: string };

export type CommunityTopic = 'sleep' | 'feeding' | 'milestones' | 'health' | 'meetups';
export type CommunityPost = {
  id: string;
  createdAt: number;
  topic: CommunityTopic;
  text: string;
  authorName: string;
  likes: number;
};

export type InsuranceFrequency = 'monthly' | 'yearly';
export type InsurancePolicy = {
  id: string;
  createdAt: number;
  planId: string;
  childId: string;
  cover: number;
  frequency: InsuranceFrequency;
  premium: number;
  nomineeName: string;
  nomineeRelation: string;
  payment: PaymentMethod;
  status: 'active' | 'cancelled';
};

export type MembershipPlan = 'monthly' | 'yearly';
export type Membership = { plan: MembershipPlan; startedAt: number };

export type SavingsContribution = { id: string; createdAt: number; amount: number };
export type SavingsGoal = {
  id: string;
  createdAt: number;
  childId: string;
  name: string;
  targetAmount: number;
  monthlyAmount: number;
  contributions: SavingsContribution[];
};

export type PersistedState = {
  onboarded: boolean;
  parent: Parent | null;
  children: Child[];
  activeChildId: string | null;
  themeOverride: ThemeOverride;
  wishlist: string[];
  cart: CartItem[];
  coupon: string | null;
  addresses: Address[];
  orders: Order[];
  appointments: Appointment[];
  labBookings: LabBooking[];
  sitterBookings: SitterBooking[];
  completedVideos: string[];
  vaccinesGiven: string[];
  assistantMessages: AssistantMessage[];
  communityPosts: CommunityPost[];
  likedPostIds: string[];
  insurancePolicies: InsurancePolicy[];
  membership: Membership | null;
  savingsGoals: SavingsGoal[];
};
