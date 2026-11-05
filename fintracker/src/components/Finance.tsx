import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { FadeInDown, FadeOut, LinearTransition, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import type { Category, Transaction, Wallet } from '@/data/types';
import { timeLabel } from '@/lib/date';
import { formatTk } from '@/lib/format';
import { colors, radius, tones, type ToneKey } from '@/theme';

import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Txt } from './Txt';

export function Tile({ icon, tone, size = 44 }: { icon: IconName; tone: ToneKey; size?: number }) {
  const t = tones[tone];
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.32, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={Math.round(size * 0.45)} color={t.fg} />
    </View>
  );
}

export const WALLET_ICON: Record<Wallet['kind'], IconName> = { card: 'card', bank: 'bank', mobile: 'phone', cash: 'cash' };

export function txnVisual(t: Transaction, category?: Category): { icon: IconName; tone: ToneKey } {
  if (t.type === 'transfer') return { icon: 'swap', tone: 'teal' };
  if (category) return { icon: category.icon, tone: category.tone };
  return { icon: t.type === 'income' ? 'arrowUpRight' : 'grid', tone: 'mint' };
}

export function Card({ children, style, padded = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean }) {
  return <View style={[styles.card, padded ? { padding: 16 } : null, style]}>{children}</View>;
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionRow}>
      <Txt variant="title" accessibilityRole="header">
        {title}
      </Txt>
      {action ? (
        <PressableScale accessibilityRole="button" accessibilityLabel={action} onPress={onAction} style={styles.sectionAction}>
          <Txt variant="label" color={colors.emerald} style={{ fontSize: 15 }}>
            {action}
          </Txt>
        </PressableScale>
      ) : null}
    </View>
  );
}

type RowProps = {
  txn: Transaction;
  category?: Category;
  walletName?: string;
  subtitle?: string;
  index?: number;
  first?: boolean;
  onDelete?: (t: Transaction) => void;
};

function DeleteAction({ progress, onPress }: { progress: SharedValue<number>; onPress: () => void }) {
  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, progress.value * 1.4),
    transform: [{ scale: 0.7 + Math.min(1, progress.value) * 0.3 }],
  }));
  return (
    <View style={styles.deleteWrap}>
      <Animated.View style={style}>
        <PressableScale accessibilityRole="button" accessibilityLabel="Delete transaction" onPress={onPress} haptic style={styles.deleteBtn}>
          <Icon name="trash" size={20} color={colors.onDark} />
          <Txt variant="caption" weight="semibold" color={colors.onDark}>
            Delete
          </Txt>
        </PressableScale>
      </Animated.View>
    </View>
  );
}

/** A transaction line. Tapping opens details; swiping left reveals Delete. */
export function TxnRow({ txn, category, walletName, subtitle, index = 0, first, onDelete }: RowProps) {
  const router = useRouter();
  const v = txnVisual(txn, category);
  const amount = txn.type === 'income' ? txn.amount : -txn.amount;
  const sub = subtitle ?? `${txn.type === 'transfer' ? 'Transfer' : category?.name ?? 'Uncategorised'} · ${timeLabel(new Date(txn.date))}`;
  const body = (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${txn.title}, ${formatTk(amount, { sign: txn.type !== 'transfer' })}, ${sub}`}
      accessibilityHint="Opens transaction details"
      onPress={() => router.push(`/transaction/${txn.id}`)}
      scaleTo={0.985}
      style={[styles.row, !first ? styles.rowBorder : null]}>
      <Tile icon={v.icon} tone={v.tone} />
      <View style={styles.rowText}>
        <Txt variant="bodyMedium" numberOfLines={1}>
          {txn.title}
        </Txt>
        <Txt variant="small" color={colors.muted} numberOfLines={1}>
          {sub}
        </Txt>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Txt variant="bodyMedium" weight="semibold" tabular color={txn.type === 'income' ? colors.emerald : colors.ink}>
          {txn.type === 'transfer' ? formatTk(txn.amount) : formatTk(amount, { sign: true })}
        </Txt>
        {walletName ? (
          <Txt variant="small" color={colors.muted}>
            {walletName}
          </Txt>
        ) : null}
      </View>
    </PressableScale>
  );

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 10) * 35).duration(320)}
      exiting={FadeOut.duration(180)}
      layout={LinearTransition.springify().damping(20)}>
      {onDelete ? (
        <ReanimatedSwipeable
          friction={1.8}
          rightThreshold={60}
          overshootRight={false}
          renderRightActions={(progress) => <DeleteAction progress={progress} onPress={() => onDelete(txn)} />}>
          <View style={{ backgroundColor: colors.surface }}>{body}</View>
        </ReanimatedSwipeable>
      ) : (
        body
      )}
    </Animated.View>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: IconName; title: string; body: string; action?: ReactNode }) {
  return (
    <Animated.View entering={FadeInDown.duration(300)} style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon name={icon} size={30} color={colors.emerald} />
      </View>
      <Txt variant="title" align="center">
        {title}
      </Txt>
      <Txt variant="body" color={colors.muted} align="center" style={{ fontSize: 15 }}>
        {body}
      </Txt>
      {action}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  sectionAction: { height: 44, justifyContent: 'center', paddingHorizontal: 4 },
  row: { height: 68, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, backgroundColor: colors.surface },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.divider },
  rowText: { flex: 1, minWidth: 0 },
  deleteWrap: { width: 96, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.dangerSoft },
  deleteBtn: { width: 72, height: 56, borderRadius: 16, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center', gap: 2 },
  empty: { alignItems: 'center', gap: 10, paddingVertical: 32, paddingHorizontal: 24 },
  emptyIcon: { width: 72, height: 72, borderRadius: 24, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
});
