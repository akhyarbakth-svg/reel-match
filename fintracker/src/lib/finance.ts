import type { ActivityFilters, Budget, Category, Transaction, Wallet } from '@/data/types';

import { addDays, isSameMonth, monthShort, startOfDay, startOfMonth } from './date';
import { parseAmount } from './format';

/** Signed effect of a transaction on its own wallet. */
export function signedAmount(t: Transaction): number {
  return t.type === 'income' ? t.amount : -t.amount;
}

export function walletBalance(wallet: Wallet, txns: Transaction[]): number {
  let total = wallet.openingBalance;
  for (const t of txns) {
    if (t.walletId === wallet.id) total += signedAmount(t);
    if (t.type === 'transfer' && t.toWalletId === wallet.id) total += t.amount;
  }
  return Math.round(total * 100) / 100;
}

export function totalBalance(wallets: Wallet[], txns: Transaction[]): number {
  return wallets.reduce((sum, w) => sum + walletBalance(w, txns), 0);
}

export function inMonth(txns: Transaction[], month: Date): Transaction[] {
  return txns.filter((t) => isSameMonth(new Date(t.date), month));
}

export function sumBy(txns: Transaction[], type: 'income' | 'expense'): number {
  return txns.reduce((s, t) => (t.type === type ? s + t.amount : s), 0);
}

export function spendByCategory(txns: Transaction[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const t of txns) {
    if (t.type !== 'expense' || !t.categoryId) continue;
    map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount);
  }
  return map;
}

export type BudgetStatus = 'ok' | 'close' | 'over';

export function budgetStatus(spent: number, limit: number): BudgetStatus {
  if (limit <= 0) return 'ok';
  const ratio = spent / limit;
  if (ratio > 1) return 'over';
  if (ratio >= 0.85) return 'close';
  return 'ok';
}

/** Spend within a budget's current period. */
export function budgetSpent(budget: Budget, txns: Transaction[], now = new Date()): number {
  let from: Date;
  if (budget.period === 'weekly') from = addDays(startOfDay(now), -now.getDay());
  else if (budget.period === 'yearly') from = new Date(now.getFullYear(), 0, 1);
  else from = startOfMonth(now);
  return txns.reduce((s, t) => {
    if (t.type !== 'expense' || t.categoryId !== budget.categoryId) return s;
    const d = new Date(t.date);
    return d >= from && d <= now ? s + t.amount : s;
  }, 0);
}

export function rangeStart(range: ActivityFilters['range'], now = new Date()): Date | null {
  switch (range) {
    case 'month':
      return startOfMonth(now);
    case 'last':
      return startOfMonth(now, -1);
    case 'three':
      return startOfMonth(now, -2);
    default:
      return null;
  }
}

export type TypeFilter = 'all' | 'expense' | 'income' | 'transfer';

export function applyFilters(
  txns: Transaction[],
  filters: ActivityFilters,
  typeFilter: TypeFilter,
  query: string,
  categories: Category[],
  now = new Date(),
): Transaction[] {
  const start = rangeStart(filters.range, now);
  const end = filters.range === 'last' ? startOfMonth(now) : null;
  const min = filters.min ? parseAmount(filters.min) : null;
  const max = filters.max ? parseAmount(filters.max) : null;
  const q = query.trim().toLowerCase();
  const catName = new Map(categories.map((c) => [c.id, c.name.toLowerCase()]));

  return txns.filter((t) => {
    const d = new Date(t.date);
    if (start && d < start) return false;
    if (end && d >= end) return false;
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (filters.categoryIds.length && (!t.categoryId || !filters.categoryIds.includes(t.categoryId))) return false;
    if (filters.walletIds.length && !filters.walletIds.includes(t.walletId) && !(t.toWalletId && filters.walletIds.includes(t.toWalletId))) return false;
    if (min !== null && t.amount < min) return false;
    if (max !== null && max > 0 && t.amount > max) return false;
    if (q) {
      const hay = `${t.title} ${t.note ?? ''} ${t.categoryId ? catName.get(t.categoryId) ?? '' : ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function activeFilterCount(f: ActivityFilters): number {
  let n = 0;
  if (f.range !== 'month') n += 1;
  if (f.categoryIds.length) n += 1;
  if (f.walletIds.length) n += 1;
  if (f.min || f.max) n += 1;
  return n;
}

/** Groups by calendar day, newest first. */
export function groupByDay(txns: Transaction[]): { key: string; date: Date; items: Transaction[]; net: number }[] {
  const groups: { key: string; date: Date; items: Transaction[]; net: number }[] = [];
  const index = new Map<string, number>();
  for (const t of txns) {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    let i = index.get(key);
    if (i === undefined) {
      i = groups.length;
      index.set(key, i);
      groups.push({ key, date: startOfDay(d), items: [], net: 0 });
    }
    groups[i].items.push(t);
    if (t.type !== 'transfer') groups[i].net += signedAmount(t);
  }
  return groups;
}

export type TrendPeriod = 'week' | 'month' | 'year';

/**
 * Spending in the previous period up to the same point in time
 * (e.g. Oct 1–5 when today is Nov 5), for a fair "vs last month" comparison.
 */
export function previousToDate(txns: Transaction[], period: TrendPeriod, now = new Date()): number {
  let from: Date;
  let to: Date;
  if (period === 'week') {
    from = addDays(startOfDay(now), -now.getDay() - 7);
    to = addDays(now, -7);
  } else if (period === 'month') {
    from = startOfMonth(now, -1);
    const last = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    to = new Date(now.getFullYear(), now.getMonth() - 1, Math.min(now.getDate(), last), now.getHours(), now.getMinutes());
  } else {
    from = new Date(now.getFullYear() - 1, 0, 1);
    to = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
  }
  return txns.reduce((s, t) => {
    if (t.type !== 'expense') return s;
    const d = new Date(t.date);
    return d >= from && d <= to ? s + t.amount : s;
  }, 0);
}

export type TrendBar = { label: string; value: number; current: boolean };

/** Six buckets of expense totals, oldest first, ending with the current one. */
export function spendTrend(txns: Transaction[], period: TrendPeriod, now = new Date()): TrendBar[] {
  const bars: TrendBar[] = [];
  const expenses = txns.filter((t) => t.type === 'expense');
  for (let i = 5; i >= 0; i -= 1) {
    let from: Date;
    let to: Date;
    let label: string;
    if (period === 'week') {
      const weekStart = addDays(startOfDay(now), -now.getDay() - i * 7);
      from = weekStart;
      to = addDays(weekStart, 7);
      label = i === 0 ? 'This wk' : `${monthShort(weekStart)} ${weekStart.getDate()}`;
    } else if (period === 'month') {
      from = startOfMonth(now, -i);
      to = startOfMonth(now, -i + 1);
      label = monthShort(from);
    } else {
      from = new Date(now.getFullYear() - i, 0, 1);
      to = new Date(now.getFullYear() - i + 1, 0, 1);
      label = String(now.getFullYear() - i);
    }
    const value = expenses.reduce((s, t) => {
      const d = new Date(t.date);
      return d >= from && d < to ? s + t.amount : s;
    }, 0);
    bars.push({ label, value, current: i === 0 });
  }
  return bars;
}
