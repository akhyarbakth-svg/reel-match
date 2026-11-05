import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Segmented } from '@/components/Controls';
import { ConfirmDialog, showToast } from '@/components/Feedback';
import { TextField } from '@/components/Field';
import { Tile } from '@/components/Finance';
import { CATEGORY_ICONS, Icon, type IconName } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { Header, Screen } from '@/components/Screen';
import { Sheet } from '@/components/Sheet';
import { Txt } from '@/components/Txt';
import type { Category, CategoryKind } from '@/data/types';
import { inMonth } from '@/lib/finance';
import { error as hapticError, success, tap } from '@/lib/haptics';
import { useStore } from '@/store';
import { colors, radius, tones, type ToneKey } from '@/theme';

const TONE_KEYS: ToneKey[] = ['mint', 'lime', 'teal', 'brand'];

export default function Categories() {
  const categories = useStore((s) => s.categories);
  const txns = useStore((s) => s.transactions);
  const addCategory = useStore((s) => s.addCategory);
  const updateCategory = useStore((s) => s.updateCategory);
  const deleteCategory = useStore((s) => s.deleteCategory);
  const [tab, setTab] = useState<CategoryKind>('expense');
  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<IconName>('star');
  const [tone, setTone] = useState<ToneKey>('mint');
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [confirm, setConfirm] = useState(false);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of inMonth(txns, new Date())) if (t.categoryId) m.set(t.categoryId, (m.get(t.categoryId) ?? 0) + 1);
    return m;
  }, [txns]);
  const list = categories.filter((c) => c.kind === tab);
  const expenseCount = categories.filter((c) => c.kind === 'expense').length;

  const open = (c: Category | 'new') => {
    setEditing(c);
    setError(null);
    if (c === 'new') {
      setName('');
      setIcon('star');
      setTone('mint');
    } else {
      setName(c.name);
      setIcon(c.icon);
      setTone(c.tone);
    }
  };

  const save = () => {
    setAttempt((a) => a + 1);
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError('Name needs at least 2 characters.');
      hapticError();
      return;
    }
    const dupe = categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase() && (editing === 'new' || c.id !== editing?.id));
    if (dupe) {
      setError('You already have a category with that name.');
      hapticError();
      return;
    }
    if (editing === 'new') addCategory({ name: trimmed, kind: tab, icon, tone });
    else if (editing) updateCategory(editing.id, { name: trimmed, icon, tone });
    success();
    showToast(editing === 'new' ? 'Category added' : 'Category updated');
    setEditing(null);
  };

  return (
    <Screen header={<Header title="Categories" />}>
      <Segmented
        label="Category type"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'expense', label: `Expense · ${expenseCount}` },
          { value: 'income', label: `Income · ${categories.length - expenseCount}` },
        ]}
      />

      <Animated.View key={tab} entering={FadeInDown.duration(260)} style={styles.list}>
        {list.map((c, i) => {
          const n = counts.get(c.id) ?? 0;
          return (
            <Animated.View key={c.id} entering={FadeInDown.delay(i * 30).duration(240)} exiting={FadeOut.duration(160)} layout={LinearTransition.springify()}>
              <PressableScale accessibilityRole="button" accessibilityLabel={`Edit ${c.name}`} onPress={() => open(c)} scaleTo={0.985} style={[styles.row, i > 0 ? styles.rowBorder : null]}>
                <Tile icon={c.icon} tone={c.tone} size={40} />
                <View style={{ flex: 1 }}>
                  <Txt variant="bodyMedium">{c.name}</Txt>
                  <Txt variant="small" color={colors.muted}>
                    {n === 0 ? 'No transactions this month' : `${n} transaction${n === 1 ? '' : 's'} this month`}
                  </Txt>
                </View>
                <Icon name="pencil" size={18} color={colors.muted} />
              </PressableScale>
            </Animated.View>
          );
        })}
      </Animated.View>

      <PressableScale accessibilityRole="button" accessibilityLabel={`New ${tab} category`} onPress={() => open('new')} haptic style={styles.newBtn}>
        <Icon name="plus" size={18} color={colors.emerald} strokeWidth={2.4} />
        <Txt variant="subtitle" color={colors.emerald}>
          New {tab} category
        </Txt>
      </PressableScale>

      <Sheet
        visible={!!editing}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'New category' : 'Edit category'}
        footer={
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {editing && editing !== 'new' ? <Button label="Delete" variant="danger" icon="trash" onPress={() => setConfirm(true)} style={{ flex: 1 }} /> : null}
            <Button label="Save" onPress={save} style={{ flex: 2 }} />
          </View>
        }>
        <View style={{ alignItems: 'center' }}>
          <Tile icon={icon} tone={tone} size={64} />
        </View>
        <TextField label="Name" placeholder="e.g. Pets" value={name} onChangeText={setName} error={error} shakeKey={attempt} maxLength={24} />
        <View style={{ gap: 8 }}>
          <Txt variant="label">Icon</Txt>
          <View style={styles.wrap}>
            {CATEGORY_ICONS.map((ic) => (
              <PressableScale key={ic} accessibilityRole="radio" accessibilityState={{ checked: icon === ic }} accessibilityLabel={ic} onPress={() => { tap(); setIcon(ic); }} style={[styles.iconBtn, icon === ic ? styles.iconOn : null]}>
                <Icon name={ic} size={20} color={icon === ic ? colors.onDark : colors.emerald} />
              </PressableScale>
            ))}
          </View>
        </View>
        <View style={{ gap: 8 }}>
          <Txt variant="label">Colour</Txt>
          <View style={styles.wrap}>
            {TONE_KEYS.map((t) => (
              <PressableScale key={t} accessibilityRole="radio" accessibilityState={{ checked: tone === t }} accessibilityLabel={`${t} colour`} onPress={() => { tap(); setTone(t); }} style={[styles.swatch, { backgroundColor: tones[t].bg, borderColor: tone === t ? colors.emerald : colors.border }]}>
                {tone === t ? <Icon name="check" size={18} color={tones[t].fg} strokeWidth={2.6} /> : null}
              </PressableScale>
            ))}
          </View>
        </View>
      </Sheet>

      <ConfirmDialog
        visible={confirm}
        title="Delete this category?"
        message="Its transactions stay but become Uncategorised, and any budget for it is removed."
        confirmLabel="Delete"
        destructive
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          if (editing && editing !== 'new') deleteCategory(editing.id);
          setConfirm(false);
          setEditing(null);
          showToast('Category deleted', { icon: 'trash' });
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  row: { height: 64, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, backgroundColor: colors.surface },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.divider },
  newBtn: { height: 56, borderRadius: 18, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#8FA399', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconBtn: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  iconOn: { backgroundColor: colors.emerald },
  swatch: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
