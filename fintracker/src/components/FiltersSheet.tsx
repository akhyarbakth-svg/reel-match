import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { ActivityFilters, DateRange } from '@/data/types';
import { applyFilters, type TypeFilter } from '@/lib/finance';
import { sanitizeAmountInput } from '@/lib/format';
import { success, tap } from '@/lib/haptics';
import { DEFAULT_FILTERS, useStore } from '@/store';
import { colors } from '@/theme';

import { Button } from './Button';
import { CheckRow, Chip } from './Controls';
import { TextField } from './Field';
import { PressableScale } from './PressableScale';
import { Sheet } from './Sheet';
import { Txt } from './Txt';

const RANGES: { value: DateRange; label: string }[] = [
  { value: 'month', label: 'This month' },
  { value: 'last', label: 'Last month' },
  { value: 'three', label: 'Last 3 months' },
  { value: 'all', label: 'All time' },
];

type Props = { visible: boolean; onClose: () => void; typeFilter: TypeFilter; query: string };

/** Filters for Activity. Edits a draft and shows a live result count before applying. */
export function FiltersSheet({ visible, onClose, typeFilter, query }: Props) {
  const filters = useStore((s) => s.filters);
  const setFilters = useStore((s) => s.setFilters);
  const txns = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);
  const wallets = useStore((s) => s.wallets);
  // Mounted fresh each time it opens (see Activity), so the draft starts from the applied filters.
  const [draft, setDraft] = useState<ActivityFilters>(filters);

  const count = useMemo(() => applyFilters(txns, draft, typeFilter, query, categories).length, [txns, draft, typeFilter, query, categories]);
  const toggle = (key: 'categoryIds' | 'walletIds', id: string) =>
    setDraft((d) => ({ ...d, [key]: d[key].includes(id) ? d[key].filter((x) => x !== id) : [...d[key], id] }));

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Filters"
      headerRight={
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Reset filters"
          onPress={() => {
            tap();
            setDraft(DEFAULT_FILTERS);
          }}
          style={styles.reset}>
          <Txt variant="label" color={colors.emerald} style={{ fontSize: 15 }}>
            Reset
          </Txt>
        </PressableScale>
      }
      footer={
        <Button
          label={count === 0 ? 'No matching transactions' : `Show ${count} transaction${count === 1 ? '' : 's'}`}
          disabled={count === 0}
          onPress={() => {
            success();
            setFilters(draft);
            onClose();
          }}
        />
      }>
      <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 18, paddingBottom: 8 }} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Txt variant="label" weight="semibold" accessibilityRole="header" style={{ fontSize: 15 }}>
            Date range
          </Txt>
          <View style={styles.wrap}>
            {RANGES.map((r) => (
              <Chip key={r.value} label={r.label} selected={draft.range === r.value} onPress={() => setDraft((d) => ({ ...d, range: r.value }))} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Txt variant="label" weight="semibold" accessibilityRole="header" style={{ fontSize: 15 }}>
            Categories{' '}
            <Txt variant="label" color={colors.muted} style={{ fontFamily: 'Outfit_400Regular', fontSize: 15 }}>
              · {draft.categoryIds.length ? `${draft.categoryIds.length} selected` : 'all'}
            </Txt>
          </Txt>
          <View style={styles.wrap}>
            {categories.map((c) => (
              <Chip key={c.id} mode="check" label={c.name} selected={draft.categoryIds.includes(c.id)} onPress={() => toggle('categoryIds', c.id)} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Txt variant="label" weight="semibold" accessibilityRole="header" style={{ fontSize: 15 }}>
            Wallets{' '}
            <Txt variant="label" color={colors.muted} style={{ fontFamily: 'Outfit_400Regular', fontSize: 15 }}>
              · {draft.walletIds.length ? `${draft.walletIds.length} selected` : 'all'}
            </Txt>
          </Txt>
          <View style={styles.grid}>
            {wallets.map((w) => (
              <View key={w.id} style={{ width: '50%' }}>
                <CheckRow label={w.name} checked={draft.walletIds.includes(w.id)} onToggle={() => toggle('walletIds', w.id)} />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.amounts}>
          <TextField label="Min amount" prefix="Tk" placeholder="0" keyboardType="decimal-pad" height={48} value={draft.min} onChangeText={(t) => setDraft((d) => ({ ...d, min: sanitizeAmountInput(t) }))} style={{ flex: 1 }} />
          <TextField label="Max amount" prefix="Tk" placeholder="Any" keyboardType="decimal-pad" height={48} value={draft.max} onChangeText={(t) => setDraft((d) => ({ ...d, max: sanitizeAmountInput(t) }))} style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  reset: { height: 44, justifyContent: 'center', paddingHorizontal: 4 },
  section: { gap: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  amounts: { flexDirection: 'row', gap: 10 },
});
