import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { SaveFailedBanner, StartupScreen } from '@/components/SyncStatus';
import {
  createDemoState,
  getWorkspaceId,
  loadLegacyState,
  loadLocalState,
  loadRemoteState,
  saveLocalState,
  saveRemoteState,
} from '@/lib/storage';
import { PALETTES, resolveThemeKey, type Palette } from '@/lib/theme';
import { subtotalOf, validateCoupon } from '@/lib/pricing';
import type {
  Address,
  AssistantMessage,
  Appointment,
  Child,
  CommunityPost,
  InsurancePolicy,
  LabBooking,
  MembershipPlan,
  SavingsGoal,
  Order,
  PersistedState,
  SitterBooking,
  ThemeOverride,
} from '@/lib/types';

type ChildInput = Omit<Child, 'id'>;

const DEFAULT_STATE: PersistedState = {
  onboarded: false,
  parent: null,
  children: [],
  activeChildId: null,
  themeOverride: null,
  wishlist: [],
  cart: [],
  coupon: null,
  addresses: [],
  orders: [],
  appointments: [],
  labBookings: [],
  sitterBookings: [],
  completedVideos: [],
  vaccinesGiven: [],
  assistantMessages: [],
  communityPosts: [],
  likedPostIds: [],
  insurancePolicies: [],
  membership: null,
  savingsGoals: [],
};

type AppContextValue = PersistedState & {
  activeChild: Child | null;
  theme: Palette;
  signIn: (phone: string, city: string) => void;
  signOut: () => void;
  updateParentName: (name: string) => void;
  completeOnboarding: (parentName: string, child: ChildInput) => void;
  addChild: (child: ChildInput) => void;
  updateChild: (id: string, child: ChildInput) => void;
  removeChild: (id: string) => void;
  setActiveChild: (id: string) => void;
  setThemeOverride: (theme: ThemeOverride) => void;
  toggleWishlist: (productId: string) => void;
  addToCart: (productId: string, variant: string) => void;
  setCartQty: (key: string, qty: number) => void;
  removeFromCart: (key: string) => void;
  applyCoupon: (code: string) => string | null;
  removeCoupon: () => void;
  addAddress: (address: Omit<Address, 'id'>) => string;
  placeOrder: (order: Omit<Order, 'id' | 'createdAt'>) => string;
  bookAppointment: (input: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => string;
  cancelAppointment: (id: string) => void;
  bookLabTest: (input: Omit<LabBooking, 'id' | 'createdAt'>) => string;
  bookSitter: (input: Omit<SitterBooking, 'id' | 'createdAt' | 'status'>) => string;
  cancelSitterBooking: (id: string) => void;
  addInsurancePolicy: (input: Omit<InsurancePolicy, 'id' | 'createdAt' | 'status'>) => string;
  cancelInsurancePolicy: (id: string) => void;
  joinMembership: (plan: MembershipPlan) => void;
  cancelMembership: () => void;
  addSavingsGoal: (input: Omit<SavingsGoal, 'id' | 'createdAt' | 'contributions'>) => string;
  addSavingsContribution: (goalId: string, amount: number) => void;
  toggleVideoCompleted: (id: string) => void;
  setChildBirthDate: (childId: string, birthDate: string | undefined) => void;
  toggleVaccineGiven: (childId: string, vaccineId: string) => void;
  addAssistantMessage: (role: AssistantMessage['role'], text: string) => void;
  clearAssistantChat: () => void;
  addCommunityPost: (input: Pick<CommunityPost, 'topic' | 'text' | 'authorName'>) => string;
  toggleCommunityLike: (postId: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

function newId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(DEFAULT_STATE);
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [saveFailed, setSaveFailed] = useState(false);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  const hydrate = useCallback(async () => {
    setStatus('loading');
    let remote: Partial<PersistedState> | null = null;
    try {
      remote = await loadRemoteState(getWorkspaceId());
    } catch {
      // Cloud schema/RPC may be missing — continue with local / demo data.
      remote = null;
    }
    const next = {
      ...DEFAULT_STATE,
      ...(remote ?? loadLocalState() ?? loadLegacyState() ?? createDemoState()),
    };
    setState(next);
    saveLocalState(next);
    setStatus('ready');
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (status !== 'ready') return;
    const workspaceId = getWorkspaceId();
    saveLocalState(state);
    saveQueue.current = saveQueue.current
      .then(() => saveRemoteState(workspaceId, state))
      .then(
        () => setSaveFailed(false),
        () => setSaveFailed(true),
      );
  }, [state, status]);

  if (status === 'loading') return <StartupScreen message="Loading your Baby Bliss..." />;

  const activeChild = state.children.find((c) => c.id === state.activeChildId) ?? null;
  const theme = PALETTES[resolveThemeKey(activeChild?.gender, state.themeOverride)];

  const value: AppContextValue = {
    ...state,
    activeChild,
    theme,
    signIn: (phone, city) =>
      setState((s) => ({ ...s, parent: { name: s.parent?.name ?? '', phone, city } })),
    signOut: () => setState((s) => ({ ...s, onboarded: false, parent: null, activeChildId: null, cart: [], coupon: null })),
    updateParentName: (name) =>
      setState((s) => (s.parent ? { ...s, parent: { ...s.parent, name } } : s)),
    completeOnboarding: (parentName, child) =>
      setState((s) => {
        const id = newId();
        return {
          ...s,
          onboarded: true,
          parent: s.parent ? { ...s.parent, name: parentName } : { name: parentName, phone: '', city: '' },
          children: [...s.children, { ...child, id }],
          activeChildId: id,
        };
      }),
    addChild: (child) =>
      setState((s) => {
        const id = newId();
        return { ...s, children: [...s.children, { ...child, id }], activeChildId: id };
      }),
    setActiveChild: (id) => setState((s) => ({ ...s, activeChildId: id })),
    updateChild: (id, child) =>
      setState((s) => ({ ...s, children: s.children.map((c) => (c.id === id ? { ...c, ...child } : c)) })),
    removeChild: (id) =>
      setState((s) => {
        const remaining = s.children.filter((c) => c.id !== id);
        if (remaining.length === 0) return s;
        const activeChildId = s.activeChildId === id ? remaining[0].id : s.activeChildId;
        return { ...s, children: remaining, activeChildId };
      }),
    setThemeOverride: (themeOverride) => setState((s) => ({ ...s, themeOverride })),
    toggleWishlist: (productId) =>
      setState((s) => ({
        ...s,
        wishlist: s.wishlist.includes(productId)
          ? s.wishlist.filter((id) => id !== productId)
          : [...s.wishlist, productId],
      })),
    addToCart: (productId, variant) =>
      setState((s) => {
        const key = `${productId}|${variant}`;
        const existing = s.cart.find((item) => item.key === key);
        const cart = existing
          ? s.cart.map((item) => (item.key === key ? { ...item, qty: item.qty + 1 } : item))
          : [...s.cart, { key, productId, variant, qty: 1 }];
        return { ...s, cart };
      }),
    setCartQty: (key, qty) =>
      setState((s) => ({
        ...s,
        cart: s.cart.map((item) => (item.key === key ? { ...item, qty: Math.max(1, qty) } : item)),
      })),
    removeFromCart: (key) => setState((s) => ({ ...s, cart: s.cart.filter((item) => item.key !== key) })),
    applyCoupon: (code) => {
      const result = validateCoupon(code, subtotalOf(state.cart));
      if (!result.ok) return result.error;
      setState((s) => ({ ...s, coupon: result.coupon.code }));
      return null;
    },
    removeCoupon: () => setState((s) => ({ ...s, coupon: null })),
    addAddress: (address) => {
      const id = newId();
      setState((s) => ({ ...s, addresses: [...s.addresses, { ...address, id }] }));
      return id;
    },
    placeOrder: (order) => {
      const id = `BB${Date.now().toString().slice(-8)}`;
      setState((s) => ({
        ...s,
        orders: [{ ...order, id, createdAt: Date.now() }, ...s.orders],
        cart: [],
        coupon: null,
      }));
      return id;
    },
    bookAppointment: (input) => {
      const id = `AP${Date.now().toString().slice(-8)}`;
      setState((s) => ({
        ...s,
        appointments: [{ ...input, id, createdAt: Date.now(), status: 'confirmed' }, ...s.appointments],
      }));
      return id;
    },
    cancelAppointment: (id) =>
      setState((s) => ({
        ...s,
        appointments: s.appointments.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a)),
      })),
    bookLabTest: (input) => {
      const id = `LB${Date.now().toString().slice(-8)}`;
      setState((s) => ({ ...s, labBookings: [{ ...input, id, createdAt: Date.now() }, ...s.labBookings] }));
      return id;
    },
    bookSitter: (input) => {
      const id = `SB${Date.now().toString().slice(-8)}`;
      setState((s) => ({
        ...s,
        sitterBookings: [{ ...input, id, createdAt: Date.now(), status: 'confirmed' }, ...s.sitterBookings],
      }));
      return id;
    },
    cancelSitterBooking: (id) =>
      setState((s) => ({
        ...s,
        sitterBookings: s.sitterBookings.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)),
      })),
    addInsurancePolicy: (input) => {
      const id = `IN${Date.now().toString().slice(-8)}`;
      setState((s) => ({
        ...s,
        insurancePolicies: [{ ...input, id, createdAt: Date.now(), status: 'active' }, ...s.insurancePolicies],
      }));
      return id;
    },
    cancelInsurancePolicy: (id) =>
      setState((s) => ({
        ...s,
        insurancePolicies: s.insurancePolicies.map((p) => (p.id === id ? { ...p, status: 'cancelled' } : p)),
      })),
    joinMembership: (plan) => setState((s) => ({ ...s, membership: { plan, startedAt: Date.now() } })),
    cancelMembership: () => setState((s) => ({ ...s, membership: null })),
    addSavingsGoal: (input) => {
      const id = newId();
      setState((s) => ({
        ...s,
        savingsGoals: [...s.savingsGoals, { ...input, id, createdAt: Date.now(), contributions: [] }],
      }));
      return id;
    },
    addSavingsContribution: (goalId, amount) =>
      setState((s) => ({
        ...s,
        savingsGoals: s.savingsGoals.map((goal) =>
          goal.id === goalId
            ? {
                ...goal,
                contributions: [...goal.contributions, { id: newId(), createdAt: Date.now(), amount }],
              }
            : goal,
        ),
      })),
    setChildBirthDate: (childId, birthDate) =>
      setState((s) => ({
        ...s,
        children: s.children.map((c) => (c.id === childId ? { ...c, birthDate } : c)),
      })),
    toggleVaccineGiven: (childId, vaccineId) =>
      setState((s) => {
        const key = `${childId}|${vaccineId}`;
        return {
          ...s,
          vaccinesGiven: s.vaccinesGiven.includes(key)
            ? s.vaccinesGiven.filter((k) => k !== key)
            : [...s.vaccinesGiven, key],
        };
      }),
    addAssistantMessage: (role, text) =>
      setState((s) => ({
        ...s,
        assistantMessages: [...s.assistantMessages, { id: newId(), role, text }].slice(-60),
      })),
    clearAssistantChat: () => setState((s) => ({ ...s, assistantMessages: [] })),
    addCommunityPost: (input) => {
      const id = newId();
      setState((s) => ({
        ...s,
        communityPosts: [{ ...input, id, createdAt: Date.now(), likes: 0 }, ...s.communityPosts],
      }));
      return id;
    },
    toggleCommunityLike: (postId) =>
      setState((s) => ({
        ...s,
        likedPostIds: s.likedPostIds.includes(postId)
          ? s.likedPostIds.filter((id) => id !== postId)
          : [...s.likedPostIds, postId],
      })),
    toggleVideoCompleted: (id) =>
      setState((s) => ({
        ...s,
        completedVideos: s.completedVideos.includes(id)
          ? s.completedVideos.filter((v) => v !== id)
          : [...s.completedVideos, id],
      })),
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      {saveFailed ? <SaveFailedBanner theme={theme} /> : null}
    </AppContext.Provider>
  );
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used within AppProvider');
  return value;
}
