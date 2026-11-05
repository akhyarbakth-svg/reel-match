import { Platform, Share } from 'react-native';

import type { Category, Transaction, Wallet } from '@/data/types';

function cell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function transactionsCsv(txns: Transaction[], cats: Map<string, Category>, wallets: Map<string, Wallet>): string {
  const head = ['Date', 'Type', 'Title', 'Category', 'Wallet', 'To wallet', 'Amount (BDT)', 'Note'];
  const rows = txns.map((t) => [
    t.date.slice(0, 10),
    t.type,
    t.title,
    t.categoryId ? cats.get(t.categoryId)?.name ?? '' : '',
    wallets.get(t.walletId)?.name ?? '',
    t.toWalletId ? wallets.get(t.toWalletId)?.name ?? '' : '',
    (t.type === 'income' ? t.amount : -t.amount).toFixed(2),
    t.note ?? '',
  ]);
  return [head, ...rows].map((r) => r.map(cell).join(',')).join('\n');
}

/** Opens the share sheet with a CSV (native) or downloads the file (web). */
export async function shareCsv(csv: string, filename = 'fintracker-transactions.csv'): Promise<void> {
  if (Platform.OS === 'web') {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  await Share.share({ title: filename, message: csv });
}
