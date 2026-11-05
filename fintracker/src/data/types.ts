import type { IconName } from '@/components/Icon';
import type { ToneKey } from '@/theme';

export type TxnType = 'expense' | 'income' | 'transfer';

export type Transaction = {
  id: string;
  type: TxnType;
  /** Always positive; the type decides the sign. */
  amount: number;
  title: string;
  categoryId: string | null;
  walletId: string;
  /** Destination wallet for transfers. */
  toWalletId?: string;
  note?: string;
  /** ISO timestamp. */
  date: string;
  hasReceipt?: boolean;
  /** Local URI of a receipt photo. */
  receiptUri?: string;
};

export type CategoryKind = 'expense' | 'income';

export type Category = {
  id: string;
  name: string;
  kind: CategoryKind;
  icon: IconName;
  tone: ToneKey;
};

export type WalletKind = 'card' | 'bank' | 'mobile' | 'cash';

export type Wallet = {
  id: string;
  name: string;
  kind: WalletKind;
  last4?: string;
  /** Balance before any recorded transaction. */
  openingBalance: number;
  isDefault?: boolean;
};

export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

export type Budget = {
  id: string;
  categoryId: string;
  limit: number;
  period: BudgetPeriod;
  warnAt80: boolean;
  notifyOver: boolean;
  rollover: boolean;
};

export type Goal = {
  id: string;
  name: string;
  icon: IconName;
  tone: ToneKey;
  target: number;
  saved: number;
  /** ISO date of the target month. */
  targetDate: string;
};

export type NotificationKind = 'budget' | 'bill' | 'goal' | 'summary' | 'income' | 'security';

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  date: string;
  read: boolean;
  /** Optional bill details for "Mark as paid". */
  bill?: { amount: number; title: string; walletId: string; categoryId: string };
};

export type Settings = {
  budgetAlerts: boolean;
  billReminders: boolean;
  biometric: boolean;
  monthlyBudget: number;
  balanceHidden: boolean;
};

export type DateRange = 'month' | 'last' | 'three' | 'all';

export type ActivityFilters = {
  range: DateRange;
  categoryIds: string[];
  walletIds: string[];
  min: string;
  max: string;
};

export type User = { name: string; email: string };
