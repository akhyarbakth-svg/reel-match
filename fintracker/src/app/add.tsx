import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, TextInput, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  interpolateColor,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Segmented } from '@/components/Controls';
import { showToast } from '@/components/Feedback';
import { Icon, type IconName } from '@/components/Icon';
import { CategorySheet, DateSheet, WalletSheet } from '@/components/Pickers';
import { PressableScale } from '@/components/PressableScale';
import { Header, Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import type { Category, TxnType } from '@/data/types';
import { useTimingValue } from '@/lib/anim';
import { dayLabel, shortDate } from '@/lib/date';
import { walletBalance } from '@/lib/finance';
import { formatTk, parseAmount, sanitizeAmountInput } from '@/lib/format';
import { error as hapticError, success, tap } from '@/lib/haptics';
import { useStore } from '@/store';
import { colors, fonts, radius, springs, tones } from '@/theme';

function CategoryButton({ cat, selected, onPress }: { cat: { name: string; icon: IconName }; selected: boolean; onPress: () => void }) {
  const p = useTimingValue(selected ? 1 : 0, 180);
  const pop = useSharedValue(1);
  useEffect(() => {
    if (selected) pop.value = withSequence(withTiming(0.88, { duration: 80 }), withSpring(1, springs.bouncy));
  }, [selected, pop]);
  const tile = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(p.value, [0, 1], [colors.surface, colors.emerald]),
    borderColor: interpolateColor(p.value, [0, 1], [colors.border, colors.emerald]),
    transform: [{ scale: pop.value }],
  }));
  return (
    <PressableScale
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={cat.name}
      onPress={onPress}
      haptic
      scaleTo={0.92}
      style={styles.catBtn}>
      <Animated.View style={[styles.catTile, tile]}>
        <Icon name={cat.icon} size={22} color={selected ? colors.onDark : colors.emerald} />
      </Animated.View>
      <Txt variant="caption" weight={selected ? 'semibold' : 'medium'} color={selected ? colors.ink : colors.muted} numberOfLines={1}>
        {cat.name}
      </Txt>
    </PressableScale>
  );
}

function DetailRow({ icon, label, value, onPress, first }: { icon: IconName; label: string; value: string; onPress: () => void; first?: boolean }) {
  return (
    <PressableScale accessibilityRole="button" accessibilityLabel={`${label}: ${value}. Change`} onPress={onPress} scaleTo={0.985} style={[styles.detail, !first ? styles.detailBorder : null]}>
      <Icon name={icon} size={20} color={colors.emerald} />
      <Txt variant="body" color={colors.muted} style={{ flex: 1, fontSize: 15 }}>
        {label}
      </Txt>
      <Txt variant="bodyMedium" style={{ fontSize: 15 }} numberOfLines={1}>
        {value}
      </Txt>
      <Icon name="chevronRight" size={18} color={colors.muted} />
    </PressableScale>
  );
}

export default function AddTransaction() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; type?: TxnType }>();
  const existing = useStore((s) => (params.id ? s.transactions.find((t) => t.id === params.id) : undefined));
  const categories = useStore((s) => s.categories);
  const wallets = useStore((s) => s.wallets);
  const txns = useStore((s) => s.transactions);
  const addTransaction = useStore((s) => s.addTransaction);
  const updateTransaction = useStore((s) => s.updateTransaction);

  const defaultWallet = wallets.find((w) => w.isDefault)?.id ?? wallets[0]?.id ?? '';
  const [type, setType] = useState<TxnType>(existing?.type ?? params.type ?? 'expense');
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const firstOf = (t: TxnType) => categories.find((c) => c.kind === (t === 'income' ? 'income' : 'expense'))?.id ?? null;
  const [categoryId, setCategoryId] = useState<string | null>(existing?.categoryId ?? firstOf(existing?.type ?? params.type ?? 'expense'));
  const [walletId, setWalletId] = useState(existing?.walletId ?? defaultWallet);
  const [toWalletId, setToWalletId] = useState(existing?.toWalletId ?? wallets.find((w) => w.id !== defaultWallet)?.id ?? '');
  const [date, setDate] = useState(existing ? new Date(existing.date) : new Date());
  const [note, setNote] = useState(existing ? existing.note ?? existing.title : '');
  const [receipt, setReceipt] = useState<string | undefined>(existing?.receiptUri);
  const [sheet, setSheet] = useState<null | 'wallet' | 'to' | 'date' | 'category'>(null);
  const [amountError, setAmountError] = useState(false);

  const kindCats = useMemo(() => categories.filter((c) => c.kind === (type === 'income' ? 'income' : 'expense')), [categories, type]);
  const shown = kindCats.slice(0, 7);
  const chosen = categoryId ? categories.find((c) => c.id === categoryId) : undefined;
  if (chosen && !shown.includes(chosen) && chosen.kind === (type === 'income' ? 'income' : 'expense')) shown[shown.length - 1] = chosen;

  const shake = useSharedValue(0);
  const bump = useSharedValue(1);
  const amountStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }, { scale: bump.value }] }));

  const wallet = wallets.find((w) => w.id === walletId);
  const toWallet = wallets.find((w) => w.id === toWalletId);
  const value = parseAmount(amount);

  const pickReceipt = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6, allowsEditing: false });
    if (!res.canceled && res.assets[0]) {
      setReceipt(res.assets[0].uri);
      tap();
    }
  };

  const save = () => {
    if (value <= 0) {
      setAmountError(true);
      hapticError();
      shake.set(withSequence(withTiming(-10, { duration: 50 }), withTiming(10, { duration: 70 }), withTiming(-6, { duration: 60 }), withTiming(0, { duration: 50 })));
      return;
    }
    if (type === 'transfer' && (!toWalletId || toWalletId === walletId)) {
      hapticError();
      showToast('Pick two different wallets for a transfer.', { icon: 'alert' });
      return;
    }
    const cat = type === 'transfer' ? null : categoryId;
    const catName = cat ? categories.find((c) => c.id === cat)?.name : undefined;
    const title = note.trim() || (type === 'transfer' ? `To ${toWallet?.name ?? 'wallet'}` : catName ?? 'Transaction');
    const payload = {
      type,
      amount: value,
      title,
      note: note.trim() || undefined,
      categoryId: cat,
      walletId,
      toWalletId: type === 'transfer' ? toWalletId : undefined,
      date: date.toISOString(),
      receiptUri: receipt,
      hasReceipt: !!receipt,
    };
    if (existing) updateTransaction(existing.id, payload);
    else addTransaction(payload);
    success();
    showToast(existing ? 'Changes saved' : `${type === 'income' ? 'Income' : type === 'transfer' ? 'Transfer' : 'Expense'} of ${formatTk(value)} saved`, { raised: true });
    router.back();
  };

  return (
    <Screen
      header={<Header back="close" title={existing ? 'Edit transaction' : 'Add transaction'} />}
      footer={<Button label={existing ? 'Save changes' : type === 'income' ? 'Save income' : type === 'transfer' ? 'Save transfer' : 'Save expense'} onPress={save} />}>
      <Segmented
        label="Transaction type"
        value={type}
        onChange={(t) => {
          setType(t);
          const kind = t === 'income' ? 'income' : 'expense';
          if (t !== 'transfer' && !categories.some((c) => c.id === categoryId && c.kind === kind)) setCategoryId(firstOf(t));
        }}
        options={[
          { value: 'expense', label: 'Expense' },
          { value: 'income', label: 'Income' },
          { value: 'transfer', label: 'Transfer' },
        ]}
      />

      <View style={styles.amountWrap}>
        <Txt variant="label" color={colors.muted} nativeID="amount-label">
          Amount
        </Txt>
        <Animated.View style={[styles.amountRow, amountStyle]}>
          <Txt variant="h2" color={colors.muted} style={{ fontFamily: fonts.medium }}>
            Tk
          </Txt>
          <TextInput
            value={amount}
            onChangeText={(t) => {
              const clean = sanitizeAmountInput(t);
              setAmount(clean);
              if (amountError && parseAmount(clean) > 0) setAmountError(false);
              bump.set(withSequence(withTiming(1.04, { duration: 60 }), withSpring(1, springs.snappy)));
            }}
            placeholder="0.00"
            placeholderTextColor="#B7C6BE"
            keyboardType="decimal-pad"
            accessibilityLabel="Amount in taka"
            autoFocus={!existing}
            style={[styles.amountInput, { color: type === 'income' ? colors.emerald : colors.ink }]}
          />
        </Animated.View>
        {amountError ? (
          <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(120)}>
            <Txt variant="small" color={colors.danger} accessibilityLiveRegion="polite">
              Enter an amount greater than zero.
            </Txt>
          </Animated.View>
        ) : wallet ? (
          <Txt variant="small" color={colors.muted}>
            {wallet.name} balance: {formatTk(walletBalance(wallet, txns))}
          </Txt>
        ) : null}
      </View>

      {type !== 'transfer' ? (
        <Animated.View key={`cats-${type}`} entering={FadeInDown.duration(280)} exiting={FadeOut.duration(120)} style={{ gap: 12 }}>
          <Txt variant="subtitle" accessibilityRole="header">
            {type === 'income' ? 'Source' : 'Category'}
          </Txt>
          <View style={styles.catGrid} accessibilityRole="radiogroup">
            {shown.map((c: Category) => (
              <CategoryButton key={c.id} cat={c} selected={categoryId === c.id} onPress={() => setCategoryId(c.id)} />
            ))}
            <CategoryButton cat={{ name: 'More', icon: 'grid' }} selected={false} onPress={() => setSheet('category')} />
          </View>
        </Animated.View>
      ) : (
        <Animated.View key="transfer" entering={FadeInDown.duration(280)} exiting={FadeOut.duration(120)} style={styles.card}>
          <PressableScale accessibilityRole="button" accessibilityLabel={`From ${wallet?.name}`} onPress={() => setSheet('wallet')} style={styles.transferRow} scaleTo={0.985}>
            <Txt variant="label" color={colors.muted} style={{ width: 44, fontFamily: fonts.regular }}>
              From
            </Txt>
            <View style={{ flex: 1 }}>
              <Txt variant="bodyMedium">{wallet?.name ?? 'Choose'}</Txt>
              <Txt variant="small" color={colors.muted}>
                {wallet ? formatTk(walletBalance(wallet, txns)) : ''}
              </Txt>
            </View>
          </PressableScale>
          <View style={styles.swapLine} />
          <PressableScale accessibilityRole="button" accessibilityLabel={`To ${toWallet?.name}`} onPress={() => setSheet('to')} style={styles.transferRow} scaleTo={0.985}>
            <Txt variant="label" color={colors.muted} style={{ width: 44, fontFamily: fonts.regular }}>
              To
            </Txt>
            <View style={{ flex: 1 }}>
              <Txt variant="bodyMedium">{toWallet?.name ?? 'Choose'}</Txt>
              <Txt variant="small" color={colors.muted}>
                {toWallet ? formatTk(walletBalance(toWallet, txns)) : 'Add a second wallet first'}
              </Txt>
            </View>
          </PressableScale>
          <SwapButton
            onPress={() => {
              setWalletId(toWalletId);
              setToWalletId(walletId);
            }}
          />
        </Animated.View>
      )}

      <Animated.View layout={LinearTransition.springify().damping(20)} style={styles.card}>
        {type !== 'transfer' ? <DetailRow first icon="wallet" label="Wallet" value={wallet ? `${wallet.name}${wallet.last4 ? ` ••${wallet.last4}` : ''}` : 'Choose'} onPress={() => setSheet('wallet')} /> : null}
        <DetailRow first={type === 'transfer'} icon="calendar" label="Date" value={dayLabel(date) === shortDate(date) ? shortDate(date) : `${dayLabel(date)}, ${shortDate(date).split(', ')[1]}`} onPress={() => setSheet('date')} />
        <View style={[styles.detail, styles.detailBorder, { paddingRight: 6 }]}>
          <Icon name="pencil" size={20} color={colors.emerald} />
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder={type === 'transfer' ? 'Add a note (optional)' : 'What was it for? (optional)'}
            placeholderTextColor={colors.placeholder}
            accessibilityLabel="Note"
            style={styles.noteInput}
            maxLength={60}
          />
          <PressableScale accessibilityRole="button" accessibilityLabel={receipt ? 'Change receipt photo' : 'Attach receipt photo'} onPress={pickReceipt} haptic style={[styles.camera, receipt ? { padding: 0, overflow: 'hidden' } : null]}>
            {receipt ? <Image source={{ uri: receipt }} style={{ width: 44, height: 44 }} accessibilityIgnoresInvertColors /> : <Icon name="camera" size={20} color={colors.emerald} />}
          </PressableScale>
        </View>
      </Animated.View>

      <WalletSheet visible={sheet === 'wallet'} onClose={() => setSheet(null)} wallets={wallets} txns={txns} selected={walletId} onSelect={setWalletId} title={type === 'transfer' ? 'Move money from' : 'Choose wallet'} />
      <WalletSheet visible={sheet === 'to'} onClose={() => setSheet(null)} wallets={wallets} txns={txns} selected={toWalletId} onSelect={setToWalletId} title="Move money to" exclude={walletId} />
      <DateSheet visible={sheet === 'date'} onClose={() => setSheet(null)} value={date} onSelect={setDate} />
      <CategorySheet visible={sheet === 'category'} onClose={() => setSheet(null)} categories={kindCats} selected={categoryId} onSelect={setCategoryId} />
    </Screen>
  );
}

function SwapButton({ onPress }: { onPress: () => void }) {
  const r = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }));
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel="Swap wallets"
      haptic
      onPress={() => {
        r.set(withSpring(r.get() + 180, springs.snappy));
        onPress();
      }}
      style={styles.swap}>
      <Animated.View style={style}>
        <Icon name="swap" size={18} color={colors.emerald} />
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  amountWrap: { alignItems: 'center', gap: 2, paddingVertical: 4 },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  amountInput: { minWidth: 120, maxWidth: 260, height: 68, fontFamily: fonts.semibold, fontSize: 50, letterSpacing: -1, textAlign: 'center', outlineStyle: 'none' } as object,
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 14 },
  catBtn: { width: '25%', alignItems: 'center', gap: 6, paddingHorizontal: 2 },
  catTile: { width: 56, height: 56, borderRadius: 18, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  detail: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, backgroundColor: colors.surface },
  detailBorder: { borderTopWidth: 1, borderTopColor: colors.divider },
  noteInput: { flex: 1, flexBasis: 0, minWidth: 0, height: 44, fontFamily: fonts.regular, fontSize: 15, color: colors.ink, outlineStyle: 'none' } as object,
  camera: { width: 44, height: 44, borderRadius: 12, backgroundColor: tones.mint.bg, alignItems: 'center', justifyContent: 'center' },
  transferRow: { height: 64, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, backgroundColor: colors.surface },
  swapLine: { height: 1, backgroundColor: colors.divider, marginHorizontal: 16 },
  swap: { position: 'absolute', right: 20, top: 42, width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
});
