import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { showToast } from '@/components/Feedback';
import { TextField } from '@/components/Field';
import { Tile, WALLET_ICON } from '@/components/Finance';
import { Icon } from '@/components/Icon';
import { AnimatedNumber } from '@/components/Progress';
import { PressableScale } from '@/components/PressableScale';
import { Header, Screen } from '@/components/Screen';
import { Sheet } from '@/components/Sheet';
import { Txt } from '@/components/Txt';
import { WALLET_KIND_LABEL } from '@/data/seed';
import type { Wallet, WalletKind } from '@/data/types';
import { walletBalance } from '@/lib/finance';
import { formatNumber, formatTk, parseAmount, sanitizeAmountInput } from '@/lib/format';
import { error as hapticError, success, tap } from '@/lib/haptics';
import { useStore } from '@/store';
import { colors, radius, shadow } from '@/theme';

const KINDS: WalletKind[] = ['cash', 'bank', 'card', 'mobile'];

export default function Wallets() {
  const router = useRouter();
  const wallets = useStore((s) => s.wallets);
  const txns = useStore((s) => s.transactions);
  const addWallet = useStore((s) => s.addWallet);
  const setDefault = useStore((s) => s.setDefaultWallet);
  const [open, setOpen] = useState<Wallet | null>(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<WalletKind>('bank');
  const [last4, setLast4] = useState('');
  const [opening, setOpening] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const balances = useMemo(() => new Map(wallets.map((w) => [w.id, walletBalance(w, txns)])), [wallets, txns]);
  const total = [...balances.values()].reduce((a, b) => a + b, 0);
  const main = wallets.find((w) => w.isDefault) ?? wallets[0];
  const others = wallets.filter((w) => w.id !== main?.id);

  const create = () => {
    setAttempt((a) => a + 1);
    if (name.trim().length < 2) {
      setNameError('Give the wallet a name.');
      hapticError();
      return;
    }
    addWallet({ name: name.trim(), kind, last4: last4 || undefined, openingBalance: parseAmount(opening) });
    success();
    setAdding(false);
    setName('');
    setLast4('');
    setOpening('');
    setNameError(null);
    showToast('Wallet added');
  };

  return (
    <Screen header={<Header title="Wallets" rightIcon="plus" rightLabel="Add wallet" onRight={() => setAdding(true)} />} footer={wallets.length > 1 ? <Button label="Move money between wallets" icon="swap" variant="outline" onPress={() => router.push({ pathname: '/add', params: { type: 'transfer' } })} /> : undefined}>
      <Animated.View entering={FadeInDown.duration(300)} style={{ paddingHorizontal: 4 }}>
        <Txt variant="label" color={colors.muted} style={{ fontFamily: 'Outfit_400Regular' }}>
          Total across {wallets.length} wallet{wallets.length === 1 ? '' : 's'}
        </Txt>
        <AnimatedNumber value={total} format={(n) => `Tk ${formatNumber(n, true)}`} variant="h2" style={{ fontSize: 32 }} accessibilityLabel={formatTk(total)} />
      </Animated.View>

      {main ? (
        <Animated.View entering={FadeInDown.delay(60).duration(380)}>
          <PressableScale accessibilityRole="button" accessibilityLabel={`${main.name}, default wallet, balance ${formatTk(balances.get(main.id) ?? 0)}`} onPress={() => setOpen(main)} scaleTo={0.98} style={[styles.hero, shadow.card]}>
            <View style={styles.heroBlob} />
            <View style={styles.heroRing} />
            <View style={styles.rowBetween}>
              <View>
                <Txt variant="subtitle" color={colors.onDark}>
                  {main.name}
                </Txt>
                <Txt variant="small" color={colors.onDarkMuted}>
                  {WALLET_KIND_LABEL[main.kind]}
                </Txt>
              </View>
              <View style={styles.defaultPill}>
                <Txt variant="caption" weight="semibold" color={colors.forest}>
                  Default
                </Txt>
              </View>
            </View>
            <View style={styles.chipArt}>
              <Icon name={WALLET_ICON[main.kind]} size={18} color={colors.forest} />
            </View>
            <View style={[styles.rowBetween, { alignItems: 'flex-end' }]}>
              <Txt variant="h2" color={colors.onDark} tabular style={{ fontSize: 26 }}>
                {formatTk(balances.get(main.id) ?? 0)}
              </Txt>
              {main.last4 ? (
                <Txt variant="body" color={colors.onDarkMuted} style={{ letterSpacing: 1.5, fontSize: 15 }}>
                  •• {main.last4}
                </Txt>
              ) : null}
            </View>
          </PressableScale>
        </Animated.View>
      ) : null}

      {others.length ? (
        <View style={styles.list}>
          {others.map((w, i) => (
            <Animated.View key={w.id} entering={FadeInDown.delay(120 + i * 50).duration(300)} layout={LinearTransition.springify()}>
              <PressableScale accessibilityRole="button" accessibilityLabel={`${w.name}, ${formatTk(balances.get(w.id) ?? 0)}`} onPress={() => setOpen(w)} scaleTo={0.985} style={[styles.row, i > 0 ? styles.rowBorder : null]}>
                <Tile icon={WALLET_ICON[w.kind]} tone={w.kind === 'bank' ? 'mint' : w.kind === 'mobile' ? 'teal' : 'lime'} />
                <View style={{ flex: 1 }}>
                  <Txt variant="bodyMedium">{w.name}</Txt>
                  <Txt variant="small" color={colors.muted}>
                    {WALLET_KIND_LABEL[w.kind]}
                    {w.last4 ? ` ••${w.last4}` : ''}
                  </Txt>
                </View>
                <Txt variant="bodyMedium" weight="semibold" tabular>
                  {formatTk(balances.get(w.id) ?? 0)}
                </Txt>
              </PressableScale>
            </Animated.View>
          ))}
        </View>
      ) : null}

      <Sheet visible={!!open} onClose={() => setOpen(null)} title={open?.name ?? 'Wallet'}>
        {open ? (
          <View style={{ gap: 16 }}>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Tile icon={WALLET_ICON[open.kind]} tone="brand" size={56} />
              <Txt variant="h2" tabular>
                {formatTk(balances.get(open.id) ?? 0)}
              </Txt>
              <Txt variant="small" color={colors.muted}>
                {txns.filter((t) => t.walletId === open.id || t.toWalletId === open.id).length} transactions recorded
              </Txt>
            </View>
            {open.isDefault ? (
              <View style={styles.note}>
                <Icon name="check" size={16} color={colors.emerald} strokeWidth={2.6} />
                <Txt variant="label" color={colors.body} style={{ flex: 1 }}>
                  New transactions use this wallet unless you pick another.
                </Txt>
              </View>
            ) : (
              <Button
                label="Make default wallet"
                variant="soft"
                onPress={() => {
                  setDefault(open.id);
                  success();
                  showToast(`${open.name} is now your default wallet`);
                  setOpen(null);
                }}
              />
            )}
          </View>
        ) : null}
      </Sheet>

      <Sheet visible={adding} onClose={() => setAdding(false)} title="Add wallet" footer={<Button label="Add wallet" onPress={create} />}>
        <TextField label="Name" placeholder="e.g. Salary account" value={name} onChangeText={setName} error={nameError} shakeKey={attempt} />
        <View style={{ gap: 8 }}>
          <Txt variant="label">Type</Txt>
          <View style={styles.kinds} accessibilityRole="radiogroup">
            {KINDS.map((k) => (
              <PressableScale key={k} accessibilityRole="radio" accessibilityState={{ checked: kind === k }} accessibilityLabel={WALLET_KIND_LABEL[k]} onPress={() => { tap(); setKind(k); }} style={[styles.kind, kind === k ? styles.kindOn : null]}>
                <Icon name={WALLET_ICON[k]} size={18} color={colors.emerald} />
                <Txt variant="label">{WALLET_KIND_LABEL[k]}</Txt>
              </PressableScale>
            ))}
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TextField label="Last 4 digits" placeholder="Optional" keyboardType="number-pad" maxLength={4} value={last4} onChangeText={(t) => setLast4(t.replace(/\D/g, ''))} style={{ flex: 1 }} />
          <TextField label="Balance now" prefix="Tk" placeholder="0" keyboardType="decimal-pad" value={opening} onChangeText={(t) => setOpening(sanitizeAmountInput(t))} style={{ flex: 1 }} />
        </View>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { height: 188, borderRadius: radius.xl, backgroundColor: colors.forest, padding: 20, justifyContent: 'space-between', overflow: 'hidden' },
  heroBlob: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: colors.forestDeep, right: -70, bottom: -110 },
  heroRing: { position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 1, borderColor: 'rgba(212, 240, 106, 0.2)', right: 40, top: -60 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  defaultPill: { backgroundColor: colors.lime, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  chipArt: { width: 40, height: 30, borderRadius: 6, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  list: { borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  row: { height: 68, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, backgroundColor: colors.surface },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.divider },
  note: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: 16, backgroundColor: colors.mint },
  kinds: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kind: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1.5, borderColor: colors.borderStrong, backgroundColor: colors.surface },
  kindOn: { borderColor: colors.emerald, backgroundColor: colors.mint },
});
