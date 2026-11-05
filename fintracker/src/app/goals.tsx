import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition, ZoomIn } from 'react-native-reanimated';

import { Button, IconButton } from '@/components/Button';
import { ConfirmDialog, showToast } from '@/components/Feedback';
import { TextField } from '@/components/Field';
import { Card, EmptyState, Tile } from '@/components/Finance';
import { CATEGORY_ICONS, Icon, type IconName } from '@/components/Icon';
import { ProgressBar, ProgressRing } from '@/components/Progress';
import { PressableScale } from '@/components/PressableScale';
import { Header, Screen } from '@/components/Screen';
import { Sheet } from '@/components/Sheet';
import { Txt } from '@/components/Txt';
import type { Goal } from '@/data/types';
import { monthsUntil, monthYear } from '@/lib/date';
import { formatTk, parseAmount, percent, sanitizeAmountInput } from '@/lib/format';
import { error as hapticError, success, tap } from '@/lib/haptics';
import { useStore } from '@/store';
import { colors, radius, type ToneKey } from '@/theme';

const QUICK = [500, 1000, 5000];
const TONES: ToneKey[] = ['mint', 'teal', 'lime'];

function GoalCard({ goal, index, onAdd, onDelete }: { goal: Goal; index: number; onAdd: () => void; onDelete: () => void }) {
  const pct = percent(goal.saved, goal.target);
  const done = goal.saved >= goal.target;
  const remaining = goal.target - goal.saved;
  const perMonth = remaining / monthsUntil(new Date(goal.targetDate));
  return (
    <Animated.View entering={FadeInDown.delay(80 + index * 60).duration(340)} layout={LinearTransition.springify()}>
      <Card style={{ gap: 12 }}>
        <View style={styles.row}>
          <Tile icon={goal.icon} tone={goal.tone} />
          <View style={{ flex: 1 }}>
            <Txt variant="subtitle">{goal.name}</Txt>
            <Txt variant="small" color={colors.muted}>
              Target: {monthYear(new Date(goal.targetDate))}
            </Txt>
          </View>
          {done ? (
            <Animated.View entering={ZoomIn.springify()} style={styles.donePill}>
              <Icon name="check" size={14} color={colors.forest} strokeWidth={2.8} />
              <Txt variant="small" weight="semibold" color={colors.forest}>
                Reached
              </Txt>
            </Animated.View>
          ) : (
            <Txt variant="label" weight="semibold" tabular style={{ fontSize: 15 }}>
              {pct}%
            </Txt>
          )}
          <IconButton icon="trash" label={`Delete ${goal.name}`} variant="ghost" onPress={onDelete} />
        </View>
        <ProgressBar value={goal.saved / goal.target} color={done ? colors.lime : colors.emerald} />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Txt variant="label" weight="semibold" tabular style={{ fontSize: 15 }}>
              {formatTk(goal.saved, { decimals: false })}{' '}
              <Txt variant="label" color={colors.muted} style={{ fontFamily: 'Outfit_400Regular', fontSize: 15 }}>
                of {formatTk(goal.target, { decimals: false })}
              </Txt>
            </Txt>
            <Txt variant="small" color={colors.muted}>
              {done ? 'Goal reached. Nice work!' : `Save ${formatTk(perMonth, { decimals: false })} a month to stay on track`}
            </Txt>
          </View>
          {!done ? <Button label="Add money" variant="soft" size="md" onPress={onAdd} accessibilityHint={`Adds savings to ${goal.name}`} /> : null}
        </View>
      </Card>
    </Animated.View>
  );
}

export default function Goals() {
  const goals = useStore((s) => s.goals);
  const addToGoal = useStore((s) => s.addToGoal);
  const addGoal = useStore((s) => s.addGoal);
  const deleteGoal = useStore((s) => s.deleteGoal);
  const [adding, setAdding] = useState<Goal | null>(null);
  const [amount, setAmount] = useState('');
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [months, setMonths] = useState(12);
  const [icon, setIcon] = useState<IconName>('star');
  const [nameError, setNameError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [toDelete, setToDelete] = useState<Goal | null>(null);

  const saved = goals.reduce((a, g) => a + g.saved, 0);
  const total = goals.reduce((a, g) => a + g.target, 0);

  const confirmAdd = () => {
    const v = parseAmount(amount);
    if (!adding || v <= 0) {
      hapticError();
      return;
    }
    const willFinish = adding.saved + v >= adding.target;
    addToGoal(adding.id, v);
    success();
    showToast(willFinish ? `${adding.name} reached!` : `${formatTk(v, { decimals: false })} added to ${adding.name}`, { icon: willFinish ? 'star' : 'check' });
    setAdding(null);
    setAmount('');
  };

  const create = () => {
    setAttempt((a) => a + 1);
    const t = parseAmount(target);
    if (name.trim().length < 2) {
      setNameError('Give your goal a name.');
      hapticError();
      return;
    }
    if (t <= 0) {
      setNameError(null);
      hapticError();
      showToast('Enter a target amount.', { icon: 'alert' });
      return;
    }
    const d = new Date();
    d.setMonth(d.getMonth() + months, 1);
    addGoal({ name: name.trim(), icon, tone: TONES[goals.length % TONES.length], target: t, targetDate: d.toISOString() });
    success();
    setCreating(false);
    setName('');
    setTarget('');
    setNameError(null);
    showToast('Goal created');
  };

  return (
    <Screen header={<Header title="Savings goals" rightIcon="plus" rightLabel="New goal" onRight={() => setCreating(true)} />}>
      <Animated.View entering={FadeInDown.duration(320)} style={styles.summary}>
        <ProgressRing value={total ? saved / total : 0} size={72} stroke={9} color={colors.lime} track="rgba(255,255,255,0.14)">
          <Txt variant="subtitle" color={colors.onDark}>
            {percent(saved, total)}%
          </Txt>
        </ProgressRing>
        <View style={{ gap: 2, flex: 1 }}>
          <Txt variant="label" color={colors.onDarkMuted} style={{ fontFamily: 'Outfit_400Regular' }}>
            Saved across {goals.length} goal{goals.length === 1 ? '' : 's'}
          </Txt>
          <Txt variant="h2" color={colors.onDark} tabular>
            {formatTk(saved, { decimals: false })}
          </Txt>
          <Txt variant="small" color={colors.onDarkMuted}>
            of {formatTk(total, { decimals: false })} in total
          </Txt>
        </View>
      </Animated.View>

      {goals.length === 0 ? (
        <Card>
          <EmptyState icon="target" title="No goals yet" body="Saving for something? Set a target and fintracker will tell you how much to put aside each month." action={<Button label="Create a goal" icon="plus" size="md" onPress={() => setCreating(true)} />} />
        </Card>
      ) : (
        goals.map((g, i) => <GoalCard key={g.id} goal={g} index={i} onAdd={() => setAdding(g)} onDelete={() => setToDelete(g)} />)
      )}

      <Sheet
        visible={!!adding}
        onClose={() => setAdding(null)}
        title={adding ? `Add to ${adding.name}` : 'Add money'}
        footer={<Button label={parseAmount(amount) > 0 ? `Add ${formatTk(parseAmount(amount), { decimals: false })}` : 'Add money'} disabled={parseAmount(amount) <= 0} onPress={confirmAdd} />}>
        <TextField label="Amount" prefix="Tk" placeholder="1,000" keyboardType="decimal-pad" value={amount} onChangeText={(t) => setAmount(sanitizeAmountInput(t))} autoFocus />
        <View style={styles.quick}>
          {QUICK.map((q) => (
            <PressableScale key={q} accessibilityRole="button" accessibilityLabel={`Add ${formatTk(q, { decimals: false })}`} onPress={() => { tap(); setAmount(String(q)); }} style={styles.quickBtn} haptic>
              <Txt variant="label" weight="semibold">
                +{formatTk(q, { decimals: false })}
              </Txt>
            </PressableScale>
          ))}
        </View>
        {adding ? (
          <Txt variant="small" color={colors.muted}>
            {formatTk(adding.target - adding.saved, { decimals: false })} to go
          </Txt>
        ) : null}
      </Sheet>

      <Sheet visible={creating} onClose={() => setCreating(false)} title="New goal" footer={<Button label="Create goal" onPress={create} />}>
        <TextField label="Goal name" placeholder="e.g. Eid shopping" value={name} onChangeText={setName} error={nameError} shakeKey={attempt} />
        <TextField label="Target amount" prefix="Tk" placeholder="50,000" keyboardType="decimal-pad" value={target} onChangeText={(t) => setTarget(sanitizeAmountInput(t))} />
        <View style={{ gap: 8 }}>
          <Txt variant="label">Reach it in</Txt>
          <View style={styles.quick}>
            {[3, 6, 12, 24].map((m) => (
              <PressableScale key={m} accessibilityRole="radio" accessibilityState={{ checked: months === m }} accessibilityLabel={`${m} months`} onPress={() => { tap(); setMonths(m); }} style={[styles.quickBtn, months === m ? styles.quickOn : null]}>
                <Txt variant="label" weight="semibold" color={months === m ? colors.onDark : colors.ink}>
                  {m < 12 ? `${m} mo` : `${m / 12} yr`}
                </Txt>
              </PressableScale>
            ))}
          </View>
        </View>
        <View style={{ gap: 8 }}>
          <Txt variant="label">Icon</Txt>
          <View style={styles.icons}>
            {CATEGORY_ICONS.slice(0, 12).map((ic) => (
              <PressableScale key={ic} accessibilityRole="radio" accessibilityState={{ checked: icon === ic }} accessibilityLabel={ic} onPress={() => { tap(); setIcon(ic); }} style={[styles.iconBtn, icon === ic ? styles.iconOn : null]}>
                <Icon name={ic} size={20} color={icon === ic ? colors.onDark : colors.emerald} />
              </PressableScale>
            ))}
          </View>
        </View>
      </Sheet>

      <ConfirmDialog
        visible={!!toDelete}
        title="Delete this goal?"
        message={toDelete ? `${toDelete.name} and its progress (${formatTk(toDelete.saved, { decimals: false })} saved) will be removed. Your wallet balances don’t change.` : ''}
        confirmLabel="Delete"
        destructive
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) deleteGoal(toDelete.id);
          setToDelete(null);
          showToast('Goal deleted', { icon: 'trash' });
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { borderRadius: radius.xl, backgroundColor: colors.forest, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  donePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.lime, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickBtn: { height: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 1, borderColor: '#DCE5E0', backgroundColor: colors.mist, justifyContent: 'center' },
  quickOn: { backgroundColor: colors.forest, borderColor: colors.forest },
  icons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconBtn: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  iconOn: { backgroundColor: colors.emerald },
});
