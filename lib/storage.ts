import { supabase } from '@/lib/supabase';
import type { PersistedState } from '@/lib/types';

const WORKSPACE_KEY = 'baby-bliss-workspace-id';
const LEGACY_KEY = 'baby-bliss-state-v1';
const LOCAL_STATE_KEY = 'baby-bliss-state-v2';

let memoryWorkspaceId: string | null = null;

function browserStorage(): Storage | null {
  return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
}

function randomWorkspaceId() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function getWorkspaceId(): string {
  if (memoryWorkspaceId) return memoryWorkspaceId;
  const storage = browserStorage();
  const stored = storage?.getItem(WORKSPACE_KEY) ?? null;
  const id = stored ?? randomWorkspaceId();
  if (!stored) storage?.setItem(WORKSPACE_KEY, id);
  memoryWorkspaceId = id;
  return id;
}

export function loadLegacyState(): Partial<PersistedState> | null {
  const raw = browserStorage()?.getItem(LEGACY_KEY) ?? null;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Partial<PersistedState>;
  } catch {
    return null;
  }
}

export function loadLocalState(): Partial<PersistedState> | null {
  const raw = browserStorage()?.getItem(LOCAL_STATE_KEY) ?? null;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Partial<PersistedState>;
  } catch {
    return null;
  }
}

export function saveLocalState(state: PersistedState): void {
  browserStorage()?.setItem(LOCAL_STATE_KEY, JSON.stringify(state));
}

/** Demo profile used when cloud + local storage are empty / unavailable. */
export function createDemoState(): Partial<PersistedState> {
  const childId = 'demo-child-aria';
  const now = Date.now();
  return {
    onboarded: true,
    parent: { name: 'Priya', phone: '9876543210', city: 'Mumbai' },
    children: [
      {
        id: childId,
        name: 'Aria',
        ageGroup: '6-12 months',
        gender: 'female',
        birthDate: '2025-04-12',
      },
    ],
    activeChildId: childId,
    themeOverride: null,
    wishlist: ['dry-pants', 'romper-set'],
    cart: [{ key: 'gentle-wipes|Pack of 80', productId: 'gentle-wipes', variant: 'Pack of 80', qty: 1 }],
    coupon: null,
    addresses: [
      {
        id: 'demo-addr-home',
        label: 'Home',
        line: '12 Palm Grove, Bandra West',
        city: 'Mumbai',
        pincode: '400050',
      },
    ],
    orders: [],
    appointments: [],
    labBookings: [],
    sitterBookings: [],
    completedVideos: [],
    vaccinesGiven: [`${childId}|bcg`],
    assistantMessages: [
      {
        id: 'demo-msg-1',
        role: 'assistant',
        text: 'Hi Priya! Ask me anything about Aria’s care, sleep, or feeding.',
      },
    ],
    communityPosts: [],
    likedPostIds: [],
    insurancePolicies: [],
    membership: null,
    savingsGoals: [
      {
        id: 'demo-goal-1',
        createdAt: now,
        childId,
        name: 'Education fund',
        targetAmount: 100000,
        monthlyAmount: 2000,
        contributions: [{ id: 'demo-c1', createdAt: now - 86400000 * 7, amount: 2000 }],
      },
    ],
  };
}

export async function loadRemoteState(workspaceId: string): Promise<Partial<PersistedState> | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('get_workspace_state', { p_workspace_id: workspaceId });
  if (error) throw new Error(error.message);
  if (data === null) return null;
  if (typeof data !== 'object' || Array.isArray(data)) throw new Error('Saved data has an unexpected shape.');
  return data as Partial<PersistedState>;
}

export async function saveRemoteState(workspaceId: string, state: PersistedState): Promise<void> {
  saveLocalState(state);
  if (!supabase) return;
  const { error } = await supabase.rpc('save_workspace_state', {
    p_workspace_id: workspaceId,
    p_state: state,
  });
  // Best-effort cloud sync: local save already succeeded. Missing RPCs should not block the UI.
  if (error && !/Could not find the function|PGRST202|schema cache/i.test(error.message)) {
    throw new Error(error.message);
  }
}
