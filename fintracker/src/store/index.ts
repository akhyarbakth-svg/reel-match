import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { buildEmptyData, buildSampleData, DEFAULT_CATEGORIES, uid } from '@/data/seed';
import type {
  ActivityFilters,
  AppNotification,
  Budget,
  Category,
  Goal,
  Settings,
  Transaction,
  User,
  Wallet,
  WalletKind,
} from '@/data/types';

export const DEFAULT_FILTERS: ActivityFilters = { range: 'month', categoryIds: [], walletIds: [], min: '', max: '' };

const DEFAULT_SETTINGS: Settings = {
  budgetAlerts: true,
  billReminders: true,
  biometric: true,
  monthlyBudget: 45000,
  balanceHidden: false,
};

type SetupInput = {
  walletKind: WalletKind;
  openingBalance: number;
  monthlyBudget: number;
  budgetAlerts: boolean;
  sampleData: boolean;
};

type State = {
  hydrated: boolean;
  onboardingSeen: boolean;
  signedIn: boolean;
  /** Set between sign up and finishing setup. */
  pendingUser: User | null;
  /** Where the verify screen should go next. */
  verifyIntent: 'signup' | 'reset';
  user: User | null;
  transactions: Transaction[];
  categories: Category[];
  wallets: Wallet[];
  budgets: Budget[];
  goals: Goal[];
  notifications: AppNotification[];
  settings: Settings;
  filters: ActivityFilters;
};

type Actions = {
  setHydrated: () => void;
  completeOnboarding: () => void;
  startSignUp: (user: User) => void;
  startReset: (email: string) => void;
  finishSetup: (input: SetupInput) => void;
  logIn: (email: string) => void;
  logOut: () => void;

  addTransaction: (t: Omit<Transaction, 'id'>) => Transaction;
  updateTransaction: (id: string, patch: Partial<Omit<Transaction, 'id'>>) => void;
  deleteTransaction: (id: string) => Transaction | undefined;
  restoreTransaction: (t: Transaction) => void;

  saveBudget: (b: Omit<Budget, 'id'> & { id?: string }) => void;
  deleteBudget: (id: string) => void;

  addGoal: (g: Omit<Goal, 'id' | 'saved'>) => void;
  addToGoal: (id: string, amount: number) => void;
  deleteGoal: (id: string) => void;

  markRead: (id: string) => void;
  markAllRead: () => void;
  dismissNotification: (id: string) => AppNotification | undefined;
  restoreNotification: (n: AppNotification) => void;

  addWallet: (w: Omit<Wallet, 'id'>) => void;
  setDefaultWallet: (id: string) => void;

  addCategory: (c: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, patch: Partial<Omit<Category, 'id'>>) => void;
  deleteCategory: (id: string) => void;

  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  setFilters: (patch: Partial<ActivityFilters>) => void;
  resetFilters: () => void;
  loadSampleData: () => void;
  clearData: () => void;
  updateUser: (u: User) => void;
};

export type Store = State & Actions;

const sortByDateDesc = (a: Transaction, b: Transaction) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      hydrated: false,
      onboardingSeen: false,
      signedIn: false,
      pendingUser: null,
      verifyIntent: 'signup',
      user: null,
      transactions: [],
      categories: DEFAULT_CATEGORIES,
      wallets: [],
      budgets: [],
      goals: [],
      notifications: [],
      settings: DEFAULT_SETTINGS,
      filters: DEFAULT_FILTERS,

      setHydrated: () => set({ hydrated: true }),
      completeOnboarding: () => set({ onboardingSeen: true }),
      startSignUp: (user) => set({ pendingUser: user, verifyIntent: 'signup', onboardingSeen: true }),
      startReset: (email) =>
        set((s) => ({
          verifyIntent: 'reset',
          pendingUser: s.user && s.user.email.toLowerCase() === email.toLowerCase() ? s.user : { name: '', email },
        })),

      finishSetup: ({ walletKind, openingBalance, monthlyBudget, budgetAlerts, sampleData }) => {
        const user = get().pendingUser ?? get().user ?? { name: 'Mohammad Salman', email: 'salman@example.com' };
        const data = sampleData ? buildSampleData() : buildEmptyData(walletKind, openingBalance);
        set({
          ...data,
          transactions: data.transactions.sort(sortByDateDesc),
          categories: DEFAULT_CATEGORIES,
          user,
          pendingUser: null,
          signedIn: true,
          onboardingSeen: true,
          filters: DEFAULT_FILTERS,
          settings: {
            ...DEFAULT_SETTINGS,
            monthlyBudget: monthlyBudget > 0 ? monthlyBudget : DEFAULT_SETTINGS.monthlyBudget,
            budgetAlerts,
          },
        });
      },

      logIn: (email) => {
        const s = get();
        if (s.user && s.wallets.length > 0) {
          set({ signedIn: true, onboardingSeen: true });
          return;
        }
        // First login on this device: start with the sample data set so the app is explorable.
        const data = buildSampleData();
        set({
          ...data,
          transactions: data.transactions.sort(sortByDateDesc),
          user: s.user ?? { name: 'Mohammad Salman', email },
          signedIn: true,
          onboardingSeen: true,
        });
      },
      logOut: () => set({ signedIn: false, pendingUser: null }),

      addTransaction: (t) => {
        const txn: Transaction = { ...t, id: uid('t') };
        set((s) => ({ transactions: [txn, ...s.transactions].sort(sortByDateDesc) }));
        return txn;
      },
      updateTransaction: (id, patch) =>
        set((s) => ({
          transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)).sort(sortByDateDesc),
        })),
      deleteTransaction: (id) => {
        const found = get().transactions.find((t) => t.id === id);
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
        return found;
      },
      restoreTransaction: (t) => set((s) => ({ transactions: [t, ...s.transactions].sort(sortByDateDesc) })),

      saveBudget: (b) =>
        set((s) => {
          const existing = b.id ? s.budgets.find((x) => x.id === b.id) : s.budgets.find((x) => x.categoryId === b.categoryId);
          if (existing) {
            return { budgets: s.budgets.map((x) => (x.id === existing.id ? { ...existing, ...b, id: existing.id } : x)) };
          }
          return { budgets: [...s.budgets, { ...b, id: uid('b') }] };
        }),
      deleteBudget: (id) => set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) })),

      addGoal: (g) => set((s) => ({ goals: [...s.goals, { ...g, id: uid('g'), saved: 0 }] })),
      addToGoal: (id, amount) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, saved: Math.max(0, Math.min(g.target, g.saved + amount)) } : g)),
        })),
      deleteGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      markRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      dismissNotification: (id) => {
        const found = get().notifications.find((n) => n.id === id);
        set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
        return found;
      },
      restoreNotification: (n) =>
        set((s) => ({ notifications: [...s.notifications, n].sort((a, b) => (a.date < b.date ? 1 : -1)) })),

      addWallet: (w) =>
        set((s) => {
          const wallet = { ...w, id: uid('w') };
          const wallets = w.isDefault ? s.wallets.map((x) => ({ ...x, isDefault: false })) : s.wallets;
          return { wallets: [...wallets, wallet] };
        }),
      setDefaultWallet: (id) => set((s) => ({ wallets: s.wallets.map((w) => ({ ...w, isDefault: w.id === id })) })),

      addCategory: (c) => set((s) => ({ categories: [...s.categories, { ...c, id: uid('c') }] })),
      updateCategory: (id, patch) =>
        set((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          budgets: s.budgets.filter((b) => b.categoryId !== id),
          transactions: s.transactions.map((t) => (t.categoryId === id ? { ...t, categoryId: null } : t)),
        })),

      setSetting: (key, value) => set((s) => ({ settings: { ...s.settings, [key]: value } })),
      setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
      resetFilters: () => set({ filters: DEFAULT_FILTERS }),
      clearData: () =>
        set((s) => ({
          transactions: [],
          budgets: [],
          goals: [],
          notifications: [],
          filters: DEFAULT_FILTERS,
          wallets: s.wallets.map((w) => ({ ...w, openingBalance: 0 })),
        })),
      updateUser: (u) => set({ user: u }),
      loadSampleData: () => {
        const data = buildSampleData();
        set({ ...data, transactions: data.transactions.sort(sortByDateDesc), categories: DEFAULT_CATEGORIES });
      },
    }),
    {
      name: 'fintracker-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated: _hydrated, ...rest }) => rest,
      // Mark as ready even if storage is unavailable (e.g. a sandboxed browser frame),
      // so the app still runs, just without saving between visits.
      onRehydrateStorage: () => () => {
        setTimeout(() => useStore.getState().setHydrated(), 0);
      },
    },
  ),
);

// If nothing was stored yet, rehydration still finishes; make sure the flag flips.
if (useStore.persist.hasHydrated()) {
  useStore.getState().setHydrated();
}
