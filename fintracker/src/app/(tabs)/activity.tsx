import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Controls';
import { EmptyState, TxnRow } from '@/components/Finance';
import { FiltersSheet } from '@/components/FiltersSheet';
import { Icon } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { Txt } from '@/components/Txt';
import { dayLabel, shortDate } from '@/lib/date';
import { activeFilterCount, applyFilters, groupByDay, type TypeFilter } from '@/lib/finance';
import { formatTk } from '@/lib/format';
import { useCategoryMap, useDeleteTransaction, useWalletMap, walletShortName } from '@/lib/hooks';
import { useStore } from '@/store';
import { colors, fonts, radius } from '@/theme';

const TYPES: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'expense', label: 'Expenses' },
  { value: 'income', label: 'Income' },
  { value: 'transfer', label: 'Transfers' },
];

const RANGE_LABEL = { month: 'This month', last: 'Last month', three: 'Last 3 months', all: 'All time' } as const;

export default function Activity() {
  const insets = useSafeAreaInsets();
  const txns = useStore((s) => s.transactions);
  const filters = useStore((s) => s.filters);
  const categories = useStore((s) => s.categories);
  const resetFilters = useStore((s) => s.resetFilters);
  const cats = useCategoryMap();
  const wallets = useWalletMap();
  const onDelete = useDeleteTransaction();
  const [type, setType] = useState<TypeFilter>('all');
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersKey, setFiltersKey] = useState(0);

  const filtered = useMemo(() => applyFilters(txns, filters, type, query, categories), [txns, filters, type, query, categories]);
  const groups = useMemo(() => groupByDay(filtered), [filtered]);
  const extra = activeFilterCount(filters);
  let rowIndex = 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.mist }}>
      <View style={{ paddingTop: Math.max(insets.top, 12) + 8, paddingHorizontal: 20, gap: 14, paddingBottom: 6 }}>
        <View style={styles.header}>
          <Txt variant="h2" accessibilityRole="header">
            Activity
          </Txt>
          <View style={styles.rangePill}>
            <Icon name="calendar" size={16} color={colors.ink} />
            <Txt variant="label">{RANGE_LABEL[filters.range]}</Txt>
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={[styles.search, focused ? styles.searchFocused : null]}>
            <Icon name="search" size={20} color={focused ? colors.emerald : colors.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search transactions"
              placeholderTextColor={colors.placeholder}
              accessibilityLabel="Search transactions"
              returnKeyType="search"
              style={styles.searchInput}
            />
            {query ? (
              <Animated.View entering={ZoomIn.duration(150)} exiting={ZoomOut.duration(120)}>
                <PressableScale accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} style={styles.clear}>
                  <Icon name="close" size={16} color={colors.muted} />
                </PressableScale>
              </Animated.View>
            ) : null}
          </View>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={extra ? `Filters, ${extra} active` : 'Filters'}
            onPress={() => {
              setFiltersKey((k) => k + 1);
              setFiltersOpen(true);
            }}
            haptic
            scaleTo={0.92}
            style={styles.filterBtn}>
            <Icon name="sliders" size={20} color={colors.onDark} />
            {extra ? (
              <Animated.View entering={ZoomIn.springify()} style={styles.filterBadge}>
                <Txt variant="caption" weight="semibold" color={colors.forest}>
                  {extra}
                </Txt>
              </Animated.View>
            ) : null}
          </PressableScale>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} accessibilityRole="tablist">
          {TYPES.map((t) => (
            <Chip key={t.value} label={t.label} selected={type === t.value} onPress={() => setType(t.value)} />
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40, gap: 16 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        {groups.length === 0 ? (
          <EmptyState
            icon="search"
            title={type === 'transfer' && !query ? 'No transfers yet' : 'No matching transactions'}
            body="Try a different filter or search term, or add a new transaction."
            action={
              <Button
                label="Clear filters"
                variant="outline"
                size="md"
                onPress={() => {
                  setQuery('');
                  setType('all');
                  resetFilters();
                }}
              />
            }
          />
        ) : (
          groups.map((g) => (
            <Animated.View key={g.key} entering={FadeIn.duration(250)} layout={LinearTransition.springify().damping(20)} style={{ gap: 6 }}>
              <View style={styles.groupHead}>
                <Txt variant="label" weight="semibold" color={colors.body}>
                  {dayLabel(g.date) === shortDate(g.date) ? shortDate(g.date) : `${dayLabel(g.date)} · ${shortDate(g.date)}`}
                </Txt>
                <Txt variant="label" color={colors.muted} tabular style={{ fontFamily: fonts.regular }}>
                  {formatTk(g.net, { sign: g.net !== 0 })}
                </Txt>
              </View>
              <View style={styles.list}>
                {g.items.map((t, i) => (
                  <TxnRow
                    key={t.id}
                    txn={t}
                    first={i === 0}
                    index={rowIndex++}
                    category={t.categoryId ? cats.get(t.categoryId) : undefined}
                    walletName={walletShortName(wallets.get(t.walletId))}
                    onDelete={onDelete}
                  />
                ))}
              </View>
            </Animated.View>
          ))
        )}
        {groups.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(200)}>
            <Txt variant="small" color={colors.muted} align="center">
              Swipe a transaction left to delete it.
            </Txt>
          </Animated.View>
        ) : null}
      </ScrollView>
      <FiltersSheet key={filtersKey} visible={filtersOpen} onClose={() => setFiltersOpen(false)} typeFilter={type} query={query} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  rangePill: { height: 44, paddingHorizontal: 14, borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 6 },
  searchRow: { flexDirection: 'row', gap: 10 },
  search: { flex: 1, minWidth: 0, overflow: 'hidden', height: 52, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.borderStrong, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 14, paddingRight: 4 },
  searchFocused: { borderColor: colors.emerald },
  searchInput: { flex: 1, flexBasis: 0, minWidth: 0, height: '100%', fontFamily: fonts.regular, fontSize: 16, color: colors.ink, outlineStyle: 'none' } as object,
  clear: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  filterBtn: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
  filterBadge: { position: 'absolute', top: -4, right: -4, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, borderWidth: 2, borderColor: colors.mist },
  groupHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 28, paddingHorizontal: 4 },
  list: { borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
});
