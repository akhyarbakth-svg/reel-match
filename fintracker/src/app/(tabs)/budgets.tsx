import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { Button, IconButton } from '@/components/Button';
import { Card, EmptyState, Tile } from '@/components/Finance';
import { Icon } from '@/components/Icon';
import { AnimatedNumber, ProgressBar } from '@/components/Progress';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { daysInMonth, monthName } from '@/lib/date';
import { budgetSpent, budgetStatus, inMonth, sumBy } from '@/lib/finance';
import { formatNumber, formatTk, percent } from '@/lib/format';
import { useCategoryMap } from '@/lib/hooks';
import { useStore } from '@/store';
import { colors, radius } from '@/theme';

const PERIOD_LABEL = { weekly: 'this week', monthly: 'this month', yearly: 'this year' } as const;

export default function Budgets() {
  const router = useRouter();
  const txns = useStore((s) => s.transactions);
  const budgets = useStore((s) => s.budgets);
  const goals = useStore((s) => s.goals);
  const limit = useStore((s) => s.settings.monthlyBudget);
  const cats = useCategoryMap();
  const now = new Date();

  const spent = useMemo(() => sumBy(inMonth(txns, now), 'expense'), [txns]); // eslint-disable-line react-hooks/exhaustive-deps
  const rows = useMemo(
    () =>
      budgets
        .map((b) => {
          const s = budgetSpent(b, txns);
          return { b, spent: s, status: budgetStatus(s, b.limit), cat: cats.get(b.categoryId) };
        })
        .sort((a, z) => z.spent / z.b.limit - a.spent / a.b.limit),
    [budgets, txns, cats],
  );
  const saved = goals.reduce((a, g) => a + g.saved, 0);
  const left = limit - spent;
  const daysLeft = daysInMonth(now) - now.getDate() + 1;

  return (
    <Screen bottomInset={24}>
      <View style={styles.header}>
        <Txt variant="h2" accessibilityRole="header">
          Budgets
        </Txt>
        <IconButton icon="plus" label="Create budget" variant="primary" onPress={() => router.push('/budget-edit')} />
      </View>

      <Animated.View entering={FadeInDown.duration(380)} style={styles.overall}>
        <View style={styles.ring} />
        <Txt variant="label" color={colors.onDarkMuted} style={{ fontFamily: 'Outfit_400Regular' }}>
          {left >= 0 ? `Left to spend in ${monthName(now)}` : `Over budget in ${monthName(now)}`}
        </Txt>
        <View style={styles.amountRow}>
          <Txt variant="title" color={colors.onDarkMuted} style={{ fontSize: 20 }}>
            Tk
          </Txt>
          <AnimatedNumber value={Math.abs(left)} format={(n) => formatNumber(n)} color={colors.onDark} variant="h2" style={{ fontSize: 36 }} accessibilityLabel={formatTk(left, { decimals: false })} />
          <Txt variant="label" color={colors.onDarkMuted} style={{ fontFamily: 'Outfit_400Regular' }}>
            of {formatTk(limit, { decimals: false })}
          </Txt>
        </View>
        <ProgressBar value={limit ? spent / limit : 0} height={10} color={left < 0 ? '#F7A27A' : colors.lime} track="rgba(255,255,255,0.14)" delay={200} />
        <View style={styles.rowBetween}>
          <Txt variant="small" color={colors.onDarkMuted}>
            {formatTk(spent, { decimals: false })} spent · {percent(spent, limit)}%
          </Txt>
          <Txt variant="small" color={colors.onDarkMuted}>
            {daysLeft} days left
          </Txt>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60).duration(380)}>
        <PressableScale accessibilityRole="button" accessibilityLabel={`Savings goals, ${goals.length} goals`} onPress={() => router.push('/goals')} scaleTo={0.98}>
          <Card style={styles.goalLink}>
            <Tile icon="target" tone="brand" size={40} />
            <View style={{ flex: 1 }}>
              <Txt variant="label" weight="semibold" style={{ fontSize: 15 }}>
                Savings goals
              </Txt>
              <Txt variant="small" color={colors.muted}>
                {goals.length ? `${goals.length} goals · ${formatTk(saved, { decimals: false })} saved` : 'Set a target and track your progress'}
              </Txt>
            </View>
            <Icon name="chevronRight" size={18} color={colors.muted} />
          </Card>
        </PressableScale>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(380)} style={{ gap: 6 }}>
        <Txt variant="subtitle" accessibilityRole="header" style={{ height: 28 }}>
          By category
        </Txt>
        {rows.length === 0 ? (
          <Card>
            <EmptyState
              icon="target"
              title="No category budgets yet"
              body="Give a category a limit and fintracker will warn you before you overspend."
              action={<Button label="Create a budget" icon="plus" size="md" onPress={() => router.push('/budget-edit')} />}
            />
          </Card>
        ) : (
          <View style={styles.list}>
            {rows.map(({ b, spent: s, status, cat }, i) => {
              const ink = status === 'over' ? colors.danger : status === 'close' ? colors.warning : colors.body;
              const bar = status === 'over' ? colors.danger : status === 'close' ? colors.warning : colors.emerald;
              const label = status === 'over' ? `${formatTk(s - b.limit, { decimals: false })} over` : `${formatTk(b.limit - s, { decimals: false })} left`;
              return (
                <Animated.View key={b.id} entering={FadeInDown.delay(150 + i * 50).duration(300)} layout={LinearTransition.springify()}>
                  <PressableScale
                    accessibilityRole="button"
                    accessibilityLabel={`${cat?.name ?? 'Budget'}: ${formatTk(s, { decimals: false })} of ${formatTk(b.limit, { decimals: false })} ${PERIOD_LABEL[b.period]}, ${label}. Edit budget`}
                    onPress={() => router.push({ pathname: '/budget-edit', params: { id: b.id } })}
                    scaleTo={0.985}
                    style={[styles.row, i > 0 ? styles.rowBorder : null]}>
                    <View style={styles.rowTop}>
                      <Tile icon={cat?.icon ?? 'grid'} tone={cat?.tone ?? 'mint'} size={40} />
                      <View style={{ flex: 1 }}>
                        <Txt variant="bodyMedium" style={{ fontSize: 15 }}>
                          {cat?.name ?? 'Category'}
                        </Txt>
                        <Txt variant="small" color={colors.muted} tabular>
                          {formatTk(s, { decimals: false })} of {formatTk(b.limit, { decimals: false })}
                        </Txt>
                      </View>
                      <View style={styles.status}>
                        {status !== 'ok' ? <Icon name="alert" size={14} color={ink} strokeWidth={2.4} /> : null}
                        <Txt variant="small" weight="semibold" color={ink}>
                          {status === 'close' ? `Close · ${label}` : label}
                        </Txt>
                      </View>
                    </View>
                    <ProgressBar value={s / b.limit} color={bar} delay={300 + i * 60} />
                  </PressableScale>
                </Animated.View>
              );
            })}
          </View>
        )}
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  overall: { borderRadius: radius.xl, backgroundColor: colors.forest, padding: 20, gap: 12, overflow: 'hidden' },
  ring: { position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 26, borderColor: 'rgba(212, 240, 106, 0.10)', top: -80, right: -60 },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  goalLink: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  list: { borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  row: { paddingHorizontal: 16, paddingVertical: 14, gap: 10, backgroundColor: colors.surface },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.divider },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
