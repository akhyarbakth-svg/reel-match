import { addDays, startOfDay, startOfMonth } from '@/lib/date';
import { formatTk } from '@/lib/format';

import type {
  AppNotification,
  Budget,
  Category,
  Goal,
  Transaction,
  Wallet,
  WalletKind,
} from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & drink', kind: 'expense', icon: 'coffee', tone: 'lime' },
  { id: 'groceries', name: 'Groceries', kind: 'expense', icon: 'cart', tone: 'mint' },
  { id: 'transport', name: 'Transport', kind: 'expense', icon: 'car', tone: 'teal' },
  { id: 'shopping', name: 'Shopping', kind: 'expense', icon: 'bag', tone: 'mint' },
  { id: 'bills', name: 'Bills', kind: 'expense', icon: 'zap', tone: 'lime' },
  { id: 'health', name: 'Health', kind: 'expense', icon: 'heart', tone: 'teal' },
  { id: 'fun', name: 'Entertainment', kind: 'expense', icon: 'play', tone: 'mint' },
  { id: 'education', name: 'Education', kind: 'expense', icon: 'book', tone: 'lime' },
  { id: 'salary', name: 'Salary', kind: 'income', icon: 'briefcase', tone: 'brand' },
  { id: 'freelance', name: 'Freelance', kind: 'income', icon: 'laptop', tone: 'teal' },
  { id: 'gifts', name: 'Gifts', kind: 'income', icon: 'gift', tone: 'lime' },
  { id: 'other-income', name: 'Other income', kind: 'income', icon: 'plus', tone: 'mint' },
];

export const WALLET_KIND_LABEL: Record<WalletKind, string> = {
  card: 'Card',
  bank: 'Bank account',
  mobile: 'Mobile wallet',
  cash: 'Cash',
};

let counter = 0;
export function uid(prefix = 'id'): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function at(day: Date, hours: number, minutes: number): string {
  const d = new Date(day);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

type Row = [dayOffset: number, h: number, m: number, title: string, category: string, amount: number, wallet: string];

/** Sample spending for the current month, relative to today. */
const RECENT: Row[] = [
  [0, 9, 41, 'Fresh Market', 'groceries', 1250, 'w_card'],
  [0, 8, 15, 'Brew Lab Coffee', 'food', 280, 'w_cash'],
  [0, 7, 52, 'Metro card top-up', 'transport', 500, 'w_card'],
  [1, 11, 2, 'Electricity bill', 'bills', 2340, 'w_bank'],
  [1, 8, 5, 'Rickshaw ride', 'transport', 80, 'w_cash'],
  [2, 20, 45, 'Cinema night', 'fun', 600, 'w_card'],
  [2, 18, 20, 'Northside Pharmacy', 'health', 450, 'w_card'],
  [3, 19, 10, 'Weekly bazaar', 'groceries', 3200, 'w_cash'],
  [3, 13, 30, 'Kacchi lunch', 'food', 950, 'w_card'],
  [3, 9, 0, 'Ride share', 'transport', 420, 'w_mobile'],
  [4, 21, 0, 'Team dinner', 'food', 2400, 'w_card'],
  [5, 17, 30, 'Tea & snacks', 'food', 180, 'w_cash'],
  [5, 8, 30, 'Monthly bus pass', 'transport', 1200, 'w_mobile'],
  [6, 18, 0, 'Fish & vegetables', 'groceries', 2650, 'w_cash'],
  [6, 12, 15, 'New shirt', 'shopping', 1400, 'w_card'],
  [6, 9, 40, 'Ride share', 'transport', 380, 'w_mobile'],
  [7, 20, 30, 'Pizza night', 'food', 1650, 'w_card'],
  [7, 10, 0, 'Internet bill', 'bills', 1500, 'w_bank'],
  [8, 16, 0, 'Brew Lab Coffee', 'food', 260, 'w_cash'],
  [8, 8, 10, 'Fuel', 'transport', 2720, 'w_card'],
  [9, 19, 0, 'Supermarket run', 'groceries', 2350, 'w_card'],
  [9, 11, 0, 'Mobile recharge', 'bills', 500, 'w_mobile'],
  [9, 10, 0, 'Stationery', 'shopping', 600, 'w_cash'],
  [10, 18, 0, 'Bakery', 'food', 340, 'w_cash'],
  [10, 9, 0, 'Gas bill', 'bills', 1860, 'w_bank'],
  [11, 13, 0, 'Lunch with friends', 'food', 1740, 'w_card'],
  [11, 21, 0, 'Streaming subscription', 'fun', 600, 'w_card'],
];

/** Monthly spending totals for the five months before this one, newest first. */
const HISTORY_TOTALS = [36300, 35600, 33100, 38900, 34200];
const HISTORY_SPLIT: [string, number, string][] = [
  ['groceries', 0.28, 'Groceries'],
  ['food', 0.24, 'Eating out'],
  ['bills', 0.2, 'Utility bills'],
  ['transport', 0.16, 'Getting around'],
  ['shopping', 0.07, 'Shopping'],
  ['fun', 0.05, 'Going out'],
];

/** Builds a realistic, internally consistent demo data set around "now". */
export function buildSampleData(now = new Date()) {
  const today = startOfDay(now);
  const txns: Transaction[] = [];

  for (const [offset, h, m, title, categoryId, amount, walletId] of RECENT) {
    const day = addDays(today, -offset);
    const date = at(day, h, m);
    if (new Date(date) > now) {
      // Keep sample items in the past even early in the morning.
      continue;
    }
    txns.push({
      id: uid('t'),
      type: 'expense',
      amount,
      title,
      categoryId,
      walletId,
      date,
      hasReceipt: title === 'Fresh Market',
      note: title === 'Fresh Market' ? 'Weekly groceries' : undefined,
    });
  }

  txns.push({
    id: uid('t'),
    type: 'income',
    amount: 7000,
    title: 'Freelance payment',
    categoryId: 'freelance',
    walletId: 'w_bank',
    date: at(addDays(today, -1), 16, 30),
  });

  // Salary on the 1st of this and the previous five months.
  for (let i = 0; i <= 5; i += 1) {
    const first = startOfMonth(today, -i);
    txns.push({
      id: uid('t'),
      type: 'income',
      amount: 85000,
      title: 'Salary',
      categoryId: 'salary',
      walletId: 'w_card',
      date: at(first, 10, 0),
    });
  }

  // Older months, so Insights has a trend to show.
  HISTORY_TOTALS.forEach((total, idx) => {
    const month = startOfMonth(today, -(idx + 1));
    HISTORY_SPLIT.forEach(([categoryId, share, title], j) => {
      const part = Math.round((total * share) / 3);
      [4, 13, 22].forEach((day, k) => {
        const d = new Date(month);
        d.setDate(day + j);
        txns.push({
          id: uid('t'),
          type: 'expense',
          amount: k === 2 ? Math.round(total * share) - part * 2 : part,
          title,
          categoryId,
          walletId: k === 1 ? 'w_cash' : 'w_card',
          date: at(d, 12 + k, 15),
        });
      });
    });
    // A monthly move into savings.
    txns.push({
      id: uid('t'),
      type: 'transfer',
      amount: 15000,
      title: 'Move to savings',
      categoryId: null,
      walletId: 'w_card',
      toWalletId: 'w_bank',
      date: at(new Date(month.getFullYear(), month.getMonth(), 2), 9, 0),
    });
  });

  // Target balances from the design; opening balances are back-solved from them.
  const targets: Record<string, number> = {
    w_card: 18920.4,
    w_bank: 23610.1,
    w_mobile: 3000,
    w_cash: 2720,
  };
  const net: Record<string, number> = { w_card: 0, w_bank: 0, w_mobile: 0, w_cash: 0 };
  for (const t of txns) {
    if (t.type === 'income') net[t.walletId] += t.amount;
    else if (t.type === 'expense') net[t.walletId] -= t.amount;
    else {
      net[t.walletId] -= t.amount;
      if (t.toWalletId) net[t.toWalletId] += t.amount;
    }
  }

  const baseWallets: Wallet[] = [
    { id: 'w_card', name: 'Everyday card', kind: 'card', last4: '4821', openingBalance: 0, isDefault: true },
    { id: 'w_bank', name: 'Savings', kind: 'bank', last4: '0937', openingBalance: 0 },
    { id: 'w_mobile', name: 'Mobile wallet', kind: 'mobile', last4: '7716', openingBalance: 0 },
    { id: 'w_cash', name: 'Cash', kind: 'cash', openingBalance: 0 },
  ];
  const wallets: Wallet[] = baseWallets.map((w) => ({ ...w, openingBalance: Math.round((targets[w.id] - net[w.id]) * 100) / 100 }));

  const budgets: Budget[] = [
    ['groceries', 12000],
    ['food', 9000],
    ['bills', 8000],
    ['transport', 5000],
    ['shopping', 6000],
    ['fun', 5000],
  ].map(([categoryId, limit]) => ({
    id: uid('b'),
    categoryId: categoryId as string,
    limit: limit as number,
    period: 'monthly',
    warnAt80: true,
    notifyOver: true,
    rollover: false,
  }));

  const goals: Goal[] = [
    { id: uid('g'), name: 'Emergency fund', icon: 'shield', tone: 'mint', target: 150000, saved: 75000, targetDate: new Date(today.getFullYear() + 1, 11, 1).toISOString() },
    { id: uid('g'), name: 'New laptop', icon: 'laptop', tone: 'teal', target: 90000, saved: 28000, targetDate: new Date(today.getFullYear(), today.getMonth() + 7, 1).toISOString() },
    { id: uid('g'), name: 'Trip to Cox’s Bazar', icon: 'plane', tone: 'lime', target: 25000, saved: 9500, targetDate: new Date(today.getFullYear(), today.getMonth() + 4, 1).toISOString() },
  ];

  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600 * 1000).toISOString();

  // Budget alert reflects real spending so far this month.
  const monthStart = startOfMonth(today);
  const spentIn = (categoryId: string) =>
    txns.reduce((sum, t) => (t.type === 'expense' && t.categoryId === categoryId && new Date(t.date) >= monthStart ? sum + t.amount : sum), 0);
  const names: Record<string, string> = Object.fromEntries(DEFAULT_CATEGORIES.map((c) => [c.id, c.name]));
  const worst = budgets
    .map((b) => ({ b, ratio: spentIn(b.categoryId) / b.limit }))
    .sort((x, y) => y.ratio - x.ratio)[0];
  const budgetNote: AppNotification =
    worst && worst.ratio >= 0.8
      ? {
          id: uid('n'),
          kind: 'budget',
          title: `${names[worst.b.categoryId]} is ${worst.ratio > 1 ? 'over budget' : 'close to its limit'}`,
          body: `You’ve used ${Math.round(worst.ratio * 100)}% of your ${formatTk(worst.b.limit, { decimals: false })} limit this month.`,
          date: hoursAgo(2),
          read: false,
        }
      : {
          id: uid('n'),
          kind: 'budget',
          title: 'You’re on track this month',
          body: 'Every category budget is under 80% so far. Keep it up.',
          date: hoursAgo(2),
          read: false,
        };

  const notifications: AppNotification[] = [
    budgetNote,
    { id: uid('n'), kind: 'bill', title: 'Internet bill due soon', body: 'Tk 1,500 · due in 2 days · from Savings ••0937', date: hoursAgo(5), read: false, bill: { amount: 1500, title: 'Internet bill', walletId: 'w_bank', categoryId: 'bills' } },
    { id: uid('n'), kind: 'goal', title: 'Halfway to your Emergency fund', body: 'Tk 75,000 saved of Tk 1,50,000.', date: hoursAgo(50), read: true },
    { id: uid('n'), kind: 'summary', title: 'Your week in review', body: 'Tk 8,065 spent, 9% less than the week before.', date: hoursAgo(74), read: true },
    { id: uid('n'), kind: 'income', title: 'Salary received', body: '+Tk 85,000.00 added to Everyday card.', date: at(startOfMonth(today), 10, 0), read: true },
  ];

  return { transactions: txns, wallets, budgets, goals, notifications };
}

/** Starting point for someone who chose not to load sample data. */
export function buildEmptyData(walletKind: WalletKind, openingBalance: number) {
  const names: Record<WalletKind, string> = {
    card: 'Everyday card',
    bank: 'Bank account',
    mobile: 'Mobile wallet',
    cash: 'Cash',
  };
  const wallets: Wallet[] = [
    { id: uid('w'), name: names[walletKind], kind: walletKind, openingBalance, isDefault: true },
  ];
  return { transactions: [] as Transaction[], wallets, budgets: [] as Budget[], goals: [] as Goal[], notifications: [] as AppNotification[] };
}
