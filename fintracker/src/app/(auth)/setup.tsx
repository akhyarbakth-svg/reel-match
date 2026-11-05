import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, interpolateColor, useAnimatedStyle } from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Switch } from '@/components/Controls';
import { TextField } from '@/components/Field';
import { WALLET_ICON } from '@/components/Finance';
import { Icon } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { WALLET_KIND_LABEL } from '@/data/seed';
import type { WalletKind } from '@/data/types';
import { useTimingValue } from '@/lib/anim';
import { parseAmount, sanitizeAmountInput } from '@/lib/format';
import { success } from '@/lib/haptics';
import { useStore } from '@/store';
import { colors, radius } from '@/theme';

function KindCard({ kind, selected, onPress }: { kind: WalletKind; selected: boolean; onPress: () => void }) {
  const p = useTimingValue(selected ? 1 : 0, 180);
  const anim = useAnimatedStyle(() => ({
    borderColor: interpolateColor(p.value, [0, 1], [colors.borderStrong, colors.emerald]),
    backgroundColor: interpolateColor(p.value, [0, 1], [colors.surface, colors.mint]),
  }));
  return (
    <PressableScale
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={WALLET_KIND_LABEL[kind]}
      onPress={onPress}
      haptic
      style={{ flex: 1 }}>
      <Animated.View style={[styles.kind, anim]}>
        <Icon name={WALLET_ICON[kind]} size={20} color={colors.emerald} />
        <Txt variant="bodyMedium" style={{ fontSize: 15 }}>
          {WALLET_KIND_LABEL[kind]}
        </Txt>
      </Animated.View>
    </PressableScale>
  );
}

export default function Setup() {
  const finishSetup = useStore((s) => s.finishSetup);
  const [kind, setKind] = useState<WalletKind>('cash');
  const [balance, setBalance] = useState('');
  const [budget, setBudget] = useState('');
  const [alerts, setAlerts] = useState(true);
  const [sample, setSample] = useState(true);
  const [busy, setBusy] = useState(false);

  const finish = (skip = false) => {
    setBusy(true);
    success();
    setTimeout(() => {
      finishSetup({
        walletKind: kind,
        openingBalance: skip ? 0 : parseAmount(balance),
        monthlyBudget: skip ? 0 : parseAmount(budget),
        budgetAlerts: alerts,
        sampleData: skip ? true : sample,
      });
    }, 300);
  };

  return (
    <Screen footer={<Button label="Finish setup" onPress={() => finish()} loading={busy} />}>
      <View style={styles.topRow}>
        <View style={{ gap: 6 }}>
          <Txt variant="label" color={colors.muted}>
            Step 2 of 2
          </Txt>
          <View style={styles.stepTrack}>
            <View style={styles.stepFill} />
          </View>
        </View>
        <PressableScale accessibilityRole="button" accessibilityLabel="Skip for now" onPress={() => finish(true)} style={styles.skip}>
          <Txt variant="bodyMedium" color={colors.emerald}>
            Skip for now
          </Txt>
        </PressableScale>
      </View>

      <Animated.View entering={FadeInDown.duration(320)} style={{ gap: 8 }}>
        <Txt variant="h1" accessibilityRole="header">
          Set up your money
        </Txt>
        <Txt variant="body" color={colors.muted}>
          A few quick choices. You can change any of them later in Settings.
        </Txt>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60).duration(320)} style={{ gap: 8 }}>
        <Txt variant="label">Currency</Txt>
        <View style={styles.currency} accessible accessibilityLabel="Currency: Bangladeshi Taka, shown as Tk">
          <View style={styles.tk}>
            <Txt variant="label" weight="semibold" color={colors.forest}>
              Tk
            </Txt>
          </View>
          <View style={{ flex: 1 }}>
            <Txt variant="bodyMedium">Bangladeshi Taka</Txt>
            <Txt variant="small" color={colors.muted}>
              BDT · shown as Tk 1,250.00
            </Txt>
          </View>
          <Icon name="check" size={18} color={colors.emerald} strokeWidth={2.6} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(320)} style={{ gap: 8 }}>
        <Txt variant="label">Your first wallet</Txt>
        <View accessibilityRole="radiogroup" style={{ gap: 10 }}>
          <View style={styles.kindRow}>
            <KindCard kind="cash" selected={kind === 'cash'} onPress={() => setKind('cash')} />
            <KindCard kind="bank" selected={kind === 'bank'} onPress={() => setKind('bank')} />
          </View>
          <View style={styles.kindRow}>
            <KindCard kind="card" selected={kind === 'card'} onPress={() => setKind('card')} />
            <KindCard kind="mobile" selected={kind === 'mobile'} onPress={() => setKind('mobile')} />
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(180).duration(320)} style={styles.kindRow}>
        <TextField
          label="Starting balance"
          prefix="Tk"
          placeholder="2,720"
          keyboardType="decimal-pad"
          value={balance}
          onChangeText={(t) => setBalance(sanitizeAmountInput(t))}
          style={{ flex: 1 }}
        />
        <TextField
          label="Monthly budget"
          prefix="Tk"
          placeholder="45,000"
          keyboardType="decimal-pad"
          value={budget}
          onChangeText={(t) => setBudget(sanitizeAmountInput(t))}
          style={{ flex: 1 }}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(240).duration(320)} style={{ gap: 4 }}>
        <View style={styles.switchRow}>
          <Txt variant="body" color={colors.body} style={{ flex: 1, fontSize: 15 }}>
            Warn me when I reach 80% of my budget
          </Txt>
          <Switch value={alerts} onChange={setAlerts} label="Warn me at 80% of my budget" />
        </View>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Txt variant="body" color={colors.body} style={{ fontSize: 15 }}>
              Start with sample data
            </Txt>
            <Txt variant="small" color={colors.muted}>
              Explore with a realistic month of spending. Clear it anytime in Settings.
            </Txt>
          </View>
          <Switch value={sample} onChange={setSample} label="Start with sample data" />
        </View>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  stepTrack: { width: 120, height: 6, borderRadius: 3, backgroundColor: '#DCE5E0', overflow: 'hidden' },
  stepFill: { width: '100%', height: '100%', backgroundColor: colors.emerald },
  skip: { height: 44, justifyContent: 'center', paddingHorizontal: 8 },
  currency: { height: 64, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.borderStrong, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 },
  tk: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  kindRow: { flexDirection: 'row', gap: 10 },
  kind: { height: 56, borderRadius: radius.md, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56 },
});
