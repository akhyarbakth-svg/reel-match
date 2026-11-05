import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Segmented, Switch } from '@/components/Controls';
import { ConfirmDialog, showToast } from '@/components/Feedback';
import { Card, Tile } from '@/components/Finance';
import { Icon } from '@/components/Icon';
import { CategorySheet } from '@/components/Pickers';
import { PressableScale } from '@/components/PressableScale';
import { Header, Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import type { BudgetPeriod } from '@/data/types';
import { startOfMonth } from '@/lib/date';
import { formatNumber, formatTk, parseAmount, sanitizeAmountInput } from '@/lib/format';
import { error as hapticError, success, tap } from '@/lib/haptics';
import { useStore } from '@/store';
import { colors, fonts, radius } from '@/theme';

export default function BudgetEdit() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const budgets = useStore((s) => s.budgets);
  const existing = id ? budgets.find((b) => b.id === id) : undefined;
  const categories = useStore((s) => s.categories);
  const txns = useStore((s) => s.transactions);
  const saveBudget = useStore((s) => s.saveBudget);
  const deleteBudget = useStore((s) => s.deleteBudget);

  const expenseCats = categories.filter((c) => c.kind === 'expense');
  const available = expenseCats.filter((c) => c.id === existing?.categoryId || !budgets.some((b) => b.categoryId === c.id));
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? available[0]?.id ?? expenseCats[0]?.id ?? '');
  const [amount, setAmount] = useState(existing ? String(existing.limit) : '');
  const [period, setPeriod] = useState<BudgetPeriod>(existing?.period ?? 'monthly');
  const [warn, setWarn] = useState(existing?.warnAt80 ?? true);
  const [over, setOver] = useState(existing?.notifyOver ?? true);
  const [roll, setRoll] = useState(existing?.rollover ?? false);
  const [pick, setPick] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const cat = categories.find((c) => c.id === categoryId);
  const suggestions = useMemo(() => {
    const now = new Date();
    const totals = [1, 2, 3].map((m) => {
      const from = startOfMonth(now, -m);
      const to = startOfMonth(now, -m + 1);
      return txns.reduce((s, t) => {
        const d = new Date(t.date);
        return t.type === 'expense' && t.categoryId === categoryId && d >= from && d < to ? s + t.amount : s;
      }, 0);
    });
    return { last: Math.round(totals[0]), avg: Math.round((totals[0] + totals[1] + totals[2]) / 3) };
  }, [txns, categoryId]);

  const save = () => {
    const limit = parseAmount(amount);
    if (limit <= 0 || !categoryId) {
      hapticError();
      shake.set(withSequence(withTiming(-10, { duration: 50 }), withTiming(10, { duration: 70 }), withTiming(0, { duration: 60 })));
      return;
    }
    saveBudget({ id: existing?.id, categoryId, limit, period, warnAt80: warn, notifyOver: over, rollover: roll });
    success();
    showToast(existing ? 'Budget updated' : `${cat?.name ?? 'Budget'} budget created`, { raised: true });
    router.back();
  };

  return (
    <Screen
      header={<Header back="close" title={existing ? 'Edit budget' : 'New budget'} />}
      footer={
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {existing ? <Button label="Delete" icon="trash" variant="danger" onPress={() => setConfirm(true)} style={{ flex: 1 }} /> : null}
          <Button label={existing ? 'Save budget' : 'Create budget'} onPress={save} style={{ flex: 2 }} />
        </View>
      }>
      <Animated.View entering={FadeInDown.duration(300)} style={{ gap: 8 }}>
        <Txt variant="label">Category</Txt>
        <PressableScale accessibilityRole="button" accessibilityLabel={`Category: ${cat?.name ?? 'none'}. Change`} onPress={() => setPick(true)} scaleTo={0.985} style={styles.catRow}>
          {cat ? <Tile icon={cat.icon} tone={cat.tone} size={36} /> : null}
          <Txt variant="bodyMedium" style={{ flex: 1 }}>
            {cat?.name ?? 'Choose a category'}
          </Txt>
          <Icon name="chevronRight" size={18} color={colors.muted} />
        </PressableScale>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60).duration(300)}>
        <Card style={styles.amountCard}>
          <Txt variant="label" color={colors.muted}>
            Spending limit
          </Txt>
          <Animated.View style={[styles.amountRow, shakeStyle]}>
            <Txt variant="h2" color={colors.muted} style={{ fontFamily: fonts.medium, fontSize: 26 }}>
              Tk
            </Txt>
            <TextInput
              value={amount}
              onChangeText={(t) => setAmount(sanitizeAmountInput(t))}
              placeholder="0"
              placeholderTextColor="#B7C6BE"
              keyboardType="decimal-pad"
              accessibilityLabel="Spending limit in taka"
              style={styles.amountInput}
            />
          </Animated.View>
          {suggestions.last > 0 || suggestions.avg > 0 ? (
            <Animated.View entering={FadeIn} style={styles.suggestRow}>
              <PressableScale accessibilityRole="button" accessibilityLabel={`Use last month: ${formatTk(suggestions.last, { decimals: false })}`} onPress={() => { tap(); setAmount(String(suggestions.last)); }} style={styles.suggest} haptic>
                <Txt variant="small" weight="medium" color={colors.body}>
                  Last month: Tk {formatNumber(suggestions.last)}
                </Txt>
              </PressableScale>
              <PressableScale accessibilityRole="button" accessibilityLabel={`Use 3-month average: ${formatTk(suggestions.avg, { decimals: false })}`} onPress={() => { tap(); setAmount(String(suggestions.avg)); }} style={styles.suggest} haptic>
                <Txt variant="small" weight="medium" color={colors.body}>
                  3-month avg: Tk {formatNumber(suggestions.avg)}
                </Txt>
              </PressableScale>
            </Animated.View>
          ) : null}
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(300)} style={{ gap: 8 }}>
        <Txt variant="label">Repeats</Txt>
        <Segmented
          label="Repeats"
          value={period}
          onChange={setPeriod}
          options={[
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'yearly', label: 'Yearly' },
          ]}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(180).duration(300)} style={{ gap: 8 }}>
        <Txt variant="label" accessibilityRole="header">
          Alerts
        </Txt>
        <Card padded={false} style={{ paddingHorizontal: 16 }}>
          {[
            { label: 'Warn me at 80%', hint: 'A heads-up before you hit the limit', v: warn, set: setWarn },
            { label: 'Tell me when I go over', hint: 'Notify the moment spending passes the limit', v: over, set: setOver },
            { label: 'Roll over what’s left', hint: 'Unspent money carries into the next period', v: roll, set: setRoll },
          ].map((t, i) => (
            <View key={t.label} style={[styles.toggle, i > 0 ? styles.toggleBorder : null]}>
              <View style={{ flex: 1 }}>
                <Txt variant="label" weight="medium" style={{ fontSize: 15 }}>
                  {t.label}
                </Txt>
                <Txt variant="small" color={colors.muted}>
                  {t.hint}
                </Txt>
              </View>
              <Switch value={t.v} onChange={t.set} label={t.label} />
            </View>
          ))}
        </Card>
      </Animated.View>

      <CategorySheet visible={pick} onClose={() => setPick(false)} categories={available} selected={categoryId} onSelect={setCategoryId} />
      <ConfirmDialog
        visible={confirm}
        title="Delete this budget?"
        message={`Your ${cat?.name ?? ''} transactions stay. Only the limit and its alerts are removed.`}
        confirmLabel="Delete"
        destructive
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          if (existing) deleteBudget(existing.id);
          setConfirm(false);
          showToast('Budget deleted', { icon: 'trash', raised: true });
          router.back();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  catRow: { height: 60, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.borderStrong, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14 },
  amountCard: { alignItems: 'center', gap: 2 },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  amountInput: { minWidth: 110, maxWidth: 220, height: 60, fontFamily: fonts.semibold, fontSize: 44, letterSpacing: -0.8, color: colors.ink, textAlign: 'center', outlineStyle: 'none' } as object,
  suggestRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 6 },
  suggest: { height: 44, paddingHorizontal: 12, borderRadius: 22, borderWidth: 1, borderColor: '#DCE5E0', backgroundColor: colors.mist, justifyContent: 'center' },
  toggle: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  toggleBorder: { borderTopWidth: 1, borderTopColor: colors.divider },
});
