import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { bookings as mockBookings, getListing, hostConversations, renterConversations, renterRequests } from '@/data/mock';
import { estimateCost } from '@/data/matching';
import type { Booking, Conversation, FacilityType, ProductCategory, RenterRequest, Role, Weekday } from '@/data/types';

// In-memory app state shared across screens. Resets on reload — swap for the
// real API + persistent storage later.

export type RenterPreferences = {
  businessName: string;
  /** Everything they make; several is common (a bakery that also bottles cold brew). */
  productCategories: ProductCategory[];
  /** Free text when they pick "Something else". */
  otherCategory: string;
  equipment: string[];
  certifications: string[];
  allergens: string[];
  days: Weekday[];
  timeOfDay: ('Early AM' | 'Daytime' | 'Evening' | 'Overnight')[];
  hoursPerWeek: number;
  maxDistanceMiles: number;
  budgetPerHour: number;
  zip: string;
};

export type HostSetup = {
  facilityName: string;
  facilityType: FacilityType | null;
  address: string;
  /** How the listing was created: uploaded docs or a voice description the LLM structures */
  listingSource: 'upload' | 'voice' | 'manual' | null;
  description: string;
  equipment: string[];
  certifications: string[];
  allergenPolicies: string[];
  days: Weekday[];
  hours: string;
  ratePerHour: number;
};

type AppState = {
  role: Role | null;
  onboarded: boolean;
  renterPrefs: RenterPreferences;
  hostSetup: HostSetup;

  /** False until the renter fills in equipment/schedule (onboarding is short; they refine later). */
  prefsRefined: boolean;

  // Swipe deck. Right = save to the shortlist, left = pass. Any kitchen can be
  // messaged or requested; the host approves booking requests.
  passed: string[]; // in swipe order, so the last one can be undone
  saved: string[];

  bookings: Booking[];

  conversations: { renter: Conversation[]; host: Conversation[] };
  requests: RenterRequest[];

  notifications: { matches: boolean; bookings: boolean; marketing: boolean };
};

type Actions = {
  setRole: (role: Role) => void;
  /** Flip between renter and host mode (sidebar "Switch to Host/Renter") */
  switchMode: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  updateRenterPrefs: (patch: Partial<RenterPreferences>) => void;
  /** Renter finished the "Sharpen your matches" flow. */
  markPrefsRefined: () => void;
  updateHostSetup: (patch: Partial<HostSetup>) => void;
  markPassed: (listingId: string) => void;
  resetPassed: () => void;
  /** Swipe right: add to Saved (no-op if already saved). */
  save: (listingId: string) => void;
  /** Un-pass the most recently passed listing; returns its id (or null). */
  undoPass: () => string | null;
  toggleSaved: (listingId: string) => void;
  /** Renter requests a slot; adds a pending booking (host confirms ~6s later in the demo). Returns the booking id. */
  requestBooking: (input: { listingId: string; date: string; time: string; hours: number; stations: string }) => string;
  /** Open (or create) the renter's thread with this listing's host; returns the conversation id. */
  startConversation: (listingId: string) => string;
  sendMessage: (side: Role, conversationId: string, text: string) => void;
  markRead: (side: Role, conversationId: string) => void;
  setRequestStatus: (requestId: string, status: RenterRequest['status']) => void;
  setNotification: (key: keyof AppState['notifications'], value: boolean) => void;
};

const defaultRenterPrefs: RenterPreferences = {
  businessName: 'Rise & Rye Bakehouse',
  productCategories: ['baked'],
  otherCategory: '',
  equipment: ['Commercial Mixer', 'Deck Oven', 'Walk-in Fridge', 'Stainless Prep'],
  certifications: ['ServSafe Manager'],
  allergens: ['Nut-Free'],
  days: ['Tue', 'Thu'],
  timeOfDay: ['Early AM'],
  hoursPerWeek: 12,
  maxDistanceMiles: 5,
  budgetPerHour: 50,
  zip: '11222',
};

const defaultHostSetup: HostSetup = {
  facilityName: 'Brooklyn Baking Co.',
  facilityType: 'bakery',
  address: '118 Franklin St, Brooklyn, NY 11222',
  listingSource: null,
  description: '',
  equipment: ['Deck Oven', 'Proofer', 'Walk-in Fridge', 'Commercial Mixer', 'Stainless Prep'],
  certifications: ['NYC DOH Grade A', 'ServSafe Manager'],
  allergenPolicies: ['Nut-Free'],
  days: ['Tue', 'Thu'],
  hours: '5:30 AM – 2:00 PM',
  ratePerHour: 45,
};

/** Make sure the renter has a conversation with this listing's host. */
function ensureConversation(s: AppState, listingId: string): Partial<AppState> {
  if (s.conversations.renter.some((c) => c.listingId === listingId)) return {};
  const listing = getListing(listingId);
  if (!listing) return {};
  const convo: Conversation = {
    id: `c-${listingId}`,
    withName: listing.name,
    withAvatar: listing.hostAvatar,
    listingId,
    online: true,
    unread: 0,
    messages: [],
  };
  return { conversations: { ...s.conversations, renter: [convo, ...s.conversations.renter] } };
}

const Ctx = createContext<(AppState & Actions) | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    role: null,
    onboarded: false,
    renterPrefs: defaultRenterPrefs,
    hostSetup: defaultHostSetup,
    prefsRefined: false,
    passed: [],
    saved: [],
    bookings: mockBookings,
    conversations: { renter: renterConversations, host: hostConversations },
    requests: renterRequests,
    notifications: { matches: true, bookings: true, marketing: false },
  });

  // Latest state for actions that need to return a value synchronously.
  const latest = useRef(state);
  latest.current = state;

  const patch = useCallback((fn: (s: AppState) => Partial<AppState>) => setState((s) => ({ ...s, ...fn(s) })), []);

  const actions = useMemo<Actions>(
    () => ({
      setRole: (role) => patch(() => ({ role })),
      switchMode: () => patch((s) => ({ role: s.role === 'host' ? 'renter' : 'host' })),
      completeOnboarding: () => patch(() => ({ onboarded: true })),
      resetOnboarding: () => patch(() => ({ onboarded: false, role: null })),
      updateRenterPrefs: (p) => patch((s) => ({ renterPrefs: { ...s.renterPrefs, ...p } })),
      markPrefsRefined: () => patch(() => ({ prefsRefined: true })),
      updateHostSetup: (p) => patch((s) => ({ hostSetup: { ...s.hostSetup, ...p } })),
      markPassed: (id) => patch((s) => ({ passed: [...s.passed, id] })),
      resetPassed: () => patch(() => ({ passed: [] })),
      save: (id) => patch((s) => (s.saved.includes(id) ? {} : { saved: [...s.saved, id] })),
      undoPass: () => {
        const undone = latest.current.passed[latest.current.passed.length - 1] ?? null;
        if (undone) patch((s) => ({ passed: s.passed.filter((x) => x !== undone) }));
        return undone;
      },
      toggleSaved: (id) =>
        patch((s) => ({ saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id] })),
      requestBooking: ({ listingId, date, time, hours, stations }) => {
        const listing = getListing(listingId);
        const bookingId = `b${Date.now()}`;
        if (!listing) return bookingId;
        patch((s) => {
          const cost = estimateCost(listing, s.renterPrefs, hours);
          const booking: Booking = {
            id: bookingId,
            listingId,
            facilityName: listing.name,
            photo: listing.photos[0],
            date,
            time,
            hours: cost.hours,
            stations,
            status: 'pending',
            hostName: listing.hostName,
            total: cost.total,
            ratePerHour: cost.ratePerHour,
            cleaningFee: cost.cleaningFee,
            deposit: cost.deposit,
          };
          return { bookings: [booking, ...s.bookings], ...ensureConversation(s, listingId) };
        });
        setTimeout(
          () =>
            patch((s) => ({
              bookings: s.bookings.map((b) =>
                b.id === bookingId && b.status === 'pending'
                  ? { ...b, status: 'confirmed', accessCode: `${listing.name.slice(0, 2).toUpperCase()}-${4000 + Math.floor(Math.random() * 5000)}`, accessNote: 'Enter at the side door keypad on arrival.' }
                  : b,
              ),
            })),
          6000,
        );
        return bookingId;
      },
      startConversation: (listingId) => {
        const existing = latest.current.conversations.renter.find((c) => c.listingId === listingId);
        if (existing) return existing.id;
        patch((s) => ensureConversation(s, listingId));
        return `c-${listingId}`;
      },
      sendMessage: (side, conversationId, text) =>
        patch((s) => ({
          conversations: {
            ...s.conversations,
            [side]: s.conversations[side].map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    messages: [
                      ...c.messages,
                      {
                        id: `m${Date.now()}`,
                        from: 'me' as const,
                        text,
                        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
                      },
                    ],
                  }
                : c,
            ),
          },
        })),
      markRead: (side, conversationId) =>
        patch((s) => ({
          conversations: {
            ...s.conversations,
            [side]: s.conversations[side].map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c)),
          },
        })),
      setRequestStatus: (id, status) =>
        patch((s) => ({ requests: s.requests.map((r) => (r.id === id ? { ...r, status } : r)) })),
      setNotification: (key, value) => patch((s) => ({ notifications: { ...s.notifications, [key]: value } })),
    }),
    [patch],
  );

  return <Ctx.Provider value={{ ...state, ...actions }}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppState must be used inside <AppStateProvider>');
  return ctx;
}
