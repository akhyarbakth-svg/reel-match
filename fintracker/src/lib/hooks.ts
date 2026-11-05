import { useMemo } from 'react';

import { showToast } from '@/components/Feedback';
import type { Category, Transaction, Wallet } from '@/data/types';
import { useStore } from '@/store';

import { warning } from './haptics';

export function useCategoryMap(): Map<string, Category> {
  const categories = useStore((s) => s.categories);
  return useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
}

export function useWalletMap(): Map<string, Wallet> {
  const wallets = useStore((s) => s.wallets);
  return useMemo(() => new Map(wallets.map((w) => [w.id, w])), [wallets]);
}

/** Deletes a transaction and offers Undo in a toast. */
export function useDeleteTransaction(raised = true) {
  const del = useStore((s) => s.deleteTransaction);
  const restore = useStore((s) => s.restoreTransaction);
  return (t: Transaction) => {
    const removed = del(t.id);
    if (!removed) return;
    warning();
    showToast('Transaction deleted', { icon: 'trash', actionLabel: 'Undo', onAction: () => restore(removed), raised });
  };
}

export function walletShortName(w?: Wallet): string {
  if (!w) return '';
  if (w.kind === 'cash') return 'Cash';
  if (w.kind === 'bank') return 'Bank';
  if (w.kind === 'mobile') return 'Mobile';
  return 'Card';
}
