import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Segmented } from '@/components/Controls';
import { showToast } from '@/components/Feedback';
import { Card, EmptyState } from '@/components/Finance';
import { Icon } from '@/components/Icon';
import { ProgressBar } from '@/components/Progress';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { monthName } from '@/lib/date';
import { inMonth, previousToDate, spendByCategory, spendTrend, type TrendPeriod } from '@/lib/finance';
import { formatTk, percent } from '@/lib/format';
import { tap } from '@/lib/haptics';
import { shareCsv, transactionsCsv } from '@/lib/export';
import { useCategoryMap, useWalletMap } from '@/lib/hooks';
import { useStore } from '@/store';
import { colors, springs } from '@/theme';

const CHART_H = 112;

function Bar({ value, max, selected, current, label, onSelect }: { value: number; max: number; selected: boolean; current: boolean; label: string; onSelect: () => void }) {
  const h = useSharedValue(0);
  useEffect(() => {
    h.value = withSpring(max > 0 ? Math.max(4, (value / max) * (CHART_H - 8)) : 4, springs.gentle);
  }, [value, max, h]);
  const style = useAnimatedStyle(() => ({ height: h.value }));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${formatTk(value, { decimals: false })}`}
      accessibilityState={{ selected }}
      onPress={onSelect}
      onHoverIn={onSelect}
      style={styles.barHit}>
      <Animated.View style={[styles.bar, { backgroundColor: selected ? colors.emerald : current ? colors.emeraldSoft : colors.mintStrong }, style]} />
    </Pressable>
  );
}

export default function Insights() {
  const txns = useStore((s) => s.transactions);
  const cats = useCategoryMap();
  const wallets = useWalletMap();
  const [period, setPeriod] = useState<TrendPeriod>('month');
  const [selected, setSelected] = useState(5);
  const [showAll, setShowAll] = useState(false);
  const now = new Date();

  const bars = useMemo(() => spendTrend(txns, period), [txns, period]);
  const max = Math.max(...bars.map((b) => b.value), 1);
  const cur = bars[5]?.value ?? 0;
  const prev = useMemo(() => previousToDate(txns, period), [txns, period]);
  const delta = prev > 0 ? Math.round(((cur - prev) / prev) * 100) : 0;
  const less = delta <= 0;
  const caption = period === 'week' ? 'Spent this week' : period === 'month' ? `Spent in ${monthName(now)} so far` : `Spent in ${now.getFullYear()} so far`;
  const unit = period === 'week' ? 'this time last week' : period === 'month' ? 'this time last month' : 'this time last year';

  const breakdown = useMemo(() => {
    const map = spendByCategory(inMonth(txns, now));
    const total = [...map.values()].reduce((a, b) => a + b, 0);
    const rows = [...map.entries()]
      .map(([id, value]) => ({ id, value, name: cats.get(id)?.name ?? 'Other' }))
      .sort((a, b) => b.value - a.value);
    return { rows, total, top: rows[0]?.value ?? 1 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txns, cats]);

  const visible = showAll ? breakdown.rows : breakdown.rows.slice(0, 4);
  const sel = bars[selected] ?? bars[5];

  return (
    <Screen bottomInset={24}>
      <View style={styles.header}>
        <Txt variant="h2" accessibilityRole="header">
          Insights
        </Txt>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Export report"
          onPress={async () => {
            await shareCsv(transactionsCsv(inMonth(txns, now), cats, wallets));
            showToast(`${monthName(now)} exported as CSV`, { icon: 'download', raised: true });
          }}
          style={styles.export}>
          <Icon name="download" size={16} color={colors.ink} />
          <Txt variant="label">Export</Txt>
        </PressableScale>
      </View>

      <Segmented
        label="Period"
        value={period}
        onChange={(p) => {
          setPeriod(p);
          setSelected(5);
        }}
        options={[
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
          { value: 'year', label: 'Year' },
        ]}
      />

      <Animated.View entering={FadeInDown.duration(380)}>
        <Card style={{ gap: 14, paddingTop: 18 }}>
          <View style={{ gap: 2, paddingHorizontal: 4 }}>
            <Txt variant="label" color={colors.muted} style={{ fontFamily: 'Outfit_400Regular' }}>
              {caption}
            </Txt>
            <Animated.View key={`${period}-${cur}`} entering={FadeIn.duration(260)}>
              <Txt variant="h2" tabular style={{ fontSize: 30 }}>
                {formatTk(cur, { decimals: false })}
              </Txt>
            </Animated.View>
            {prev > 0 ? (
              <View style={styles.delta}>
                <Icon name={less ? 'trendDown' : 'trendUp'} size={16} color={less ? colors.emerald : colors.warning} strokeWidth={2.2} />
                <Txt variant="small" weight="semibold" color={less ? colors.emerald : colors.warning}>
                  {Math.abs(delta)}% {less ? 'less' : 'more'} than {unit}
                </Txt>
              </View>
            ) : null}
          </View>

          <View>
            <View style={styles.tipRow}>
              <Animated.View key={`${period}-${selected}`} entering={FadeIn.duration(160)} style={styles.tip}>
                <Txt variant="caption" weight="medium" color={colors.onDark} tabular>
                  {sel.label} · {formatTk(sel.value, { decimals: false })}
                </Txt>
              </Animated.View>
            </View>
            <View style={styles.chart}>
              {bars.map((b, i) => (
                <Bar
                  key={`${period}-${i}`}
                  value={b.value}
                  max={max}
                  label={b.label}
                  current={b.current}
                  selected={selected === i}
                  onSelect={() => {
                    if (selected !== i) tap();
                    setSelected(i);
                  }}
                />
              ))}
            </View>
            <View style={styles.labels} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              {bars.map((b, i) => (
                <Txt key={`${period}-l${i}`} variant="caption" align="center" color={selected === i ? colors.ink : colors.muted} weight={selected === i ? 'semibold' : 'regular'} style={{ flex: 1 }}>
                  {b.label}
                </Txt>
              ))}
            </View>
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(380)}>
        <Card style={{ gap: 12 }}>
          <View style={styles.rowBetween}>
            <Txt variant="subtitle" accessibilityRole="header">
              Where it went · {monthName(now)}
            </Txt>
            {breakdown.rows.length > 4 ? (
              <PressableScale accessibilityRole="button" accessibilityLabel={showAll ? 'Show top 4' : `Show all ${breakdown.rows.length}`} onPress={() => setShowAll((v) => !v)} style={styles.more}>
                <Txt variant="label" color={colors.emerald}>
                  {showAll ? 'Top 4' : `All ${breakdown.rows.length}`}
                </Txt>
              </PressableScale>
            ) : null}
          </View>
          {breakdown.rows.length === 0 ? (
            <EmptyState icon="pie" title="Nothing spent yet" body="Your category breakdown appears once you add expenses this month." />
          ) : (
            visible.map((r, i) => (
              <Animated.View key={r.id} entering={FadeInDown.delay(i * 40).duration(260)} layout={LinearTransition.springify().damping(20)} style={{ gap: 6 }}>
                <View style={styles.rowBetween}>
                  <Txt variant="label">{r.name}</Txt>
                  <Txt variant="label" tabular style={{ fontFamily: 'Outfit_400Regular' }}>
                    {formatTk(r.value, { decimals: false })}{' '}
                    <Txt variant="label" color={colors.muted} style={{ fontFamily: 'Outfit_400Regular' }}>
                      · {percent(r.value, breakdown.total)}%
                    </Txt>
                  </Txt>
                </View>
                <ProgressBar value={r.value / breakdown.top} track={colors.divider} delay={150 + i * 60} />
              </Animated.View>
            ))
          )}
        </Card>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  export: { height: 44, paddingHorizontal: 14, borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 6 },
  delta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tipRow: { height: 32, alignItems: 'center' },
  tip: { height: 26, paddingHorizontal: 10, borderRadius: 8, backgroundColor: colors.forest, justifyContent: 'center' },
  chart: { height: CHART_H, flexDirection: 'row', alignItems: 'flex-end', borderBottomWidth: 1, borderBottomColor: '#DCE5E0', gap: 2 },
  barHit: { flex: 1, height: CHART_H, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: 28, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  labels: { flexDirection: 'row', gap: 2, marginTop: 6 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  more: { height: 44, justifyContent: 'center', marginVertical: -10 },
});

