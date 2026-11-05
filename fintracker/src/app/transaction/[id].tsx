import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Share, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { Button, IconButton } from '@/components/Button';
import { ConfirmDialog, showToast } from '@/components/Feedback';
import { Card, EmptyState, Tile, txnVisual } from '@/components/Finance';
import { Icon } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { Header, Screen } from '@/components/Screen';
import { Sheet } from '@/components/Sheet';
import { Txt } from '@/components/Txt';
import { fullDateTime } from '@/lib/date';
import { budgetSpent, budgetStatus } from '@/lib/finance';
import { formatTk } from '@/lib/format';
import { success, tap, warning } from '@/lib/haptics';
import { useStore } from '@/store';
import { colors, radius } from '@/theme';

function Row({ label, value, first }: { label: string; value: string; first?: boolean }) {
  return (
    <View style={[styles.row, !first ? styles.rowBorder : null]} accessible accessibilityLabel={`${label}: ${value}`}>
      <Txt variant="body" color={colors.muted} style={{ fontSize: 15 }}>
        {label}
      </Txt>
      <Txt variant="bodyMedium" style={{ fontSize: 15, flexShrink: 1, textAlign: 'right' }} numberOfLines={2}>
        {value}
      </Txt>
    </View>
  );
}

export default function TransactionDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const txn = useStore((s) => s.transactions.find((t) => t.id === id));
  const txns = useStore((s) => s.transactions);
  const category = useStore((s) => (txn?.categoryId ? s.categories.find((c) => c.id === txn.categoryId) : undefined));
  const wallets = useStore((s) => s.wallets);
  const budget = useStore((s) => (txn?.categoryId ? s.budgets.find((b) => b.categoryId === txn.categoryId) : undefined));
  const del = useStore((s) => s.deleteTransaction);
  const restore = useStore((s) => s.restoreTransaction);
  const update = useStore((s) => s.updateTransaction);
  const [confirm, setConfirm] = useState(false);
  const [splitOpen, setSplitOpen] = useState(false);
  const [people, setPeople] = useState(2);

  if (!txn) {
    return (
      <Screen header={<Header title="Transaction" />}>
        <EmptyState icon="search" title="Transaction not found" body="It may have been deleted." action={<Button label="Back to activity" size="md" onPress={() => router.back()} />} />
      </Screen>
    );
  }

  const wallet = wallets.find((w) => w.id === txn.walletId);
  const toWallet = wallets.find((w) => w.id === txn.toWalletId);
  const v = txnVisual(txn, category);
  const signed = txn.type === 'income' ? txn.amount : -txn.amount;
  const status = budget ? budgetStatus(budgetSpent(budget, txns), budget.limit) : null;

  const pickReceipt = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!res.canceled && res.assets[0]) {
      update(txn.id, { receiptUri: res.assets[0].uri, hasReceipt: true });
      success();
      showToast('Receipt attached');
    }
  };

  const share = () =>
    Share.share({
      message: `${txn.title}: ${txn.type === 'transfer' ? formatTk(txn.amount) : formatTk(signed, { sign: true })} on ${fullDateTime(new Date(txn.date))}${category ? ` (${category.name})` : ''}`,
    }).catch(() => {});

  const doDelete = () => {
    setConfirm(false);
    const removed = del(txn.id);
    warning();
    router.back();
    if (removed) showToast('Transaction deleted', { icon: 'trash', actionLabel: 'Undo', onAction: () => restore(removed), raised: true });
  };

  return (
    <Screen
      header={<Header title="Transaction" right={<IconButton icon="share" label="Share transaction" onPress={share} />} />}
      footer={
        <View style={styles.actions}>
          <Button label="Delete" icon="trash" variant="danger" onPress={() => setConfirm(true)} style={{ flex: 1 }} />
          <Button label="Edit transaction" icon="pencil" onPress={() => router.push({ pathname: '/add', params: { id: txn.id } })} style={{ flex: 2 }} />
        </View>
      }>
      <View style={styles.hero}>
        <Animated.View entering={ZoomIn.springify().damping(14)}>
          <Tile icon={v.icon} tone={v.tone} size={64} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(60).duration(320)} style={{ alignItems: 'center', gap: 4 }}>
          <Txt variant="title" weight="medium">
            {txn.title}
          </Txt>
          <Txt variant="h2" tabular style={{ fontSize: 36, lineHeight: 42 }} color={txn.type === 'income' ? colors.emerald : colors.ink}>
            {txn.type === 'transfer' ? formatTk(txn.amount) : formatTk(signed, { sign: true })}
          </Txt>
        </Animated.View>
        {status ? (
          <Animated.View entering={FadeInDown.delay(120).duration(320)} style={[styles.pill, { backgroundColor: status === 'ok' ? colors.mint : colors.dangerSoft }]}>
            <Icon name={status === 'ok' ? 'check' : 'alert'} size={14} color={status === 'ok' ? colors.emerald : status === 'over' ? colors.danger : colors.warning} strokeWidth={2.6} />
            <Txt variant="small" weight="medium" color={status === 'ok' ? colors.emerald : status === 'over' ? colors.danger : colors.warning}>
              {status === 'ok' ? `Within ${category?.name} budget` : status === 'over' ? `${category?.name} is over budget` : `${category?.name} is close to its limit`}
            </Txt>
          </Animated.View>
        ) : null}
      </View>

      <Animated.View entering={FadeInDown.delay(140).duration(320)}>
        <Card padded={false} style={{ paddingHorizontal: 16 }}>
          <Row first label={txn.type === 'transfer' ? 'Type' : 'Category'} value={txn.type === 'transfer' ? 'Transfer' : category?.name ?? 'Uncategorised'} />
          <Row label={txn.type === 'transfer' ? 'From' : 'Wallet'} value={wallet ? `${wallet.name}${wallet.last4 ? ` ••${wallet.last4}` : ''}` : 'Deleted wallet'} />
          {txn.type === 'transfer' ? <Row label="To" value={toWallet?.name ?? '—'} /> : null}
          <Row label="Date" value={fullDateTime(new Date(txn.date))} />
          {txn.note ? <Row label="Note" value={txn.note} /> : null}
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(320)}>
        <Card style={styles.receipt}>
          {txn.receiptUri ? (
            <Image source={{ uri: txn.receiptUri }} style={styles.thumb} accessibilityLabel="Receipt photo" />
          ) : (
            <View style={styles.thumbEmpty}>
              <Icon name="camera" size={22} color={colors.muted} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Txt variant="label" weight="semibold" style={{ fontSize: 15 }}>
              {txn.receiptUri ? 'Receipt attached' : txn.hasReceipt ? 'Paper receipt kept' : 'No receipt yet'}
            </Txt>
            <Txt variant="small" color={colors.muted}>
              {txn.receiptUri ? 'Photo saved on this device' : 'Add a photo to keep proof of purchase'}
            </Txt>
          </View>
          <Button label={txn.receiptUri ? 'Replace' : 'Add'} variant="soft" size="md" onPress={pickReceipt} />
        </Card>
      </Animated.View>

      {txn.type === 'expense' ? (
        <Animated.View entering={FadeInDown.delay(260).duration(320)}>
          <PressableScale accessibilityRole="button" accessibilityLabel="Split this expense" onPress={() => setSplitOpen(true)} scaleTo={0.985}>
            <Card style={styles.split}>
              <Icon name="split" size={20} color={colors.emerald} />
              <View style={{ flex: 1 }}>
                <Txt variant="label" weight="medium" style={{ fontSize: 15 }}>
                  Split this expense
                </Txt>
                <Txt variant="small" color={colors.muted}>
                  Keep only your share when friends chip in
                </Txt>
              </View>
              <Icon name="chevronRight" size={18} color={colors.muted} />
            </Card>
          </PressableScale>
        </Animated.View>
      ) : null}

      <Sheet
        visible={splitOpen}
        onClose={() => setSplitOpen(false)}
        title="Split expense"
        footer={
          <Button
            label={`Keep my share: ${formatTk(txn.amount / people)}`}
            onPress={() => {
              update(txn.id, { amount: Math.round((txn.amount / people) * 100) / 100, note: `${txn.note ? `${txn.note} · ` : ''}Split ${people} ways` });
              success();
              setSplitOpen(false);
              showToast(`Saved your share of ${formatTk(txn.amount / people)}`);
            }}
          />
        }>
        <Txt variant="body" color={colors.body}>
          Total {formatTk(txn.amount)}. How many people are sharing it, including you?
        </Txt>
        <View style={styles.stepper}>
          <IconButton icon="minus" label="Fewer people" variant="soft" onPress={() => { tap(); setPeople((p) => Math.max(2, p - 1)); }} />
          <View style={{ alignItems: 'center', minWidth: 120 }}>
            <Animated.View key={people} entering={ZoomIn.duration(180)}>
              <Txt variant="display" tabular>
                {people}
              </Txt>
            </Animated.View>
            <Txt variant="small" color={colors.muted}>
              people
            </Txt>
          </View>
          <IconButton icon="plus" label="More people" variant="soft" onPress={() => { tap(); setPeople((p) => Math.min(12, p + 1)); }} />
        </View>
        <Txt variant="subtitle" align="center" color={colors.emerald}>
          {formatTk(txn.amount / people)} each
        </Txt>
      </Sheet>

      <ConfirmDialog
        visible={confirm}
        title="Delete this transaction?"
        message={`${txn.title} (${formatTk(txn.amount)}) will be removed from your history and balances. You can undo right after.`}
        confirmLabel="Delete"
        destructive
        onCancel={() => setConfirm(false)}
        onConfirm={doDelete}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 10, paddingVertical: 4 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  row: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingVertical: 8 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.divider },
  receipt: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12 },
  thumb: { width: 56, height: 68, borderRadius: 10 },
  thumbEmpty: { width: 56, height: 68, borderRadius: 10, backgroundColor: colors.mist, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  split: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderRadius: radius.lg },
  actions: { flexDirection: 'row', gap: 10 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, paddingVertical: 8 },
});
