import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import type { Category, Transaction, Wallet } from '@/data/types';
import { addDays, shortDate, startOfDay } from '@/lib/date';
import { walletBalance } from '@/lib/finance';
import { formatTk } from '@/lib/format';
import { colors, radius } from '@/theme';

import { Tile, WALLET_ICON } from './Finance';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Sheet } from './Sheet';
import { Txt } from './Txt';

type WalletSheetProps = {
  visible: boolean;
  onClose: () => void;
  wallets: Wallet[];
  txns: Transaction[];
  selected: string;
  onSelect: (id: string) => void;
  title?: string;
  exclude?: string;
};

export function WalletSheet({ visible, onClose, wallets, txns, selected, onSelect, title = 'Choose wallet', exclude }: WalletSheetProps) {
  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <View style={styles.list}>
        {wallets
          .filter((w) => w.id !== exclude)
          .map((w, i) => {
            const on = w.id === selected;
            return (
              <Animated.View key={w.id} entering={FadeInDown.delay(i * 40).duration(240)}>
                <PressableScale
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={`${w.name}, ${formatTk(walletBalance(w, txns))}`}
                  onPress={() => {
                    onSelect(w.id);
                    onClose();
                  }}
                  haptic
                  style={[styles.option, on ? styles.optionOn : null]}>
                  <Tile icon={WALLET_ICON[w.kind]} tone={on ? 'brand' : 'mint'} size={40} />
                  <View style={{ flex: 1 }}>
                    <Txt variant="bodyMedium">{w.name}</Txt>
                    <Txt variant="small" color={colors.muted}>
                      {w.last4 ? `••${w.last4} · ` : ''}
                      {formatTk(walletBalance(w, txns))}
                    </Txt>
                  </View>
                  {on ? <Icon name="check" size={20} color={colors.emerald} strokeWidth={2.6} /> : null}
                </PressableScale>
              </Animated.View>
            );
          })}
      </View>
    </Sheet>
  );
}

type DateSheetProps = { visible: boolean; onClose: () => void; value: Date; onSelect: (d: Date) => void };

/** Quick date picker covering the last three weeks. */
export function DateSheet({ visible, onClose, value, onSelect }: DateSheetProps) {
  const today = startOfDay(new Date());
  const days = Array.from({ length: 21 }, (_, i) => addDays(today, -i));
  return (
    <Sheet visible={visible} onClose={onClose} title="Choose date">
      <View style={styles.grid}>
        {days.map((d, i) => {
          const on = startOfDay(value).getTime() === d.getTime();
          return (
            <Animated.View key={d.toISOString()} entering={FadeInDown.delay(i * 15).duration(200)} style={styles.dayCell}>
              <PressableScale
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                accessibilityLabel={shortDate(d)}
                onPress={() => {
                  const out = new Date(d);
                  const keep = new Date();
                  out.setHours(keep.getHours(), keep.getMinutes());
                  onSelect(out);
                  onClose();
                }}
                haptic
                style={[styles.day, on ? styles.dayOn : null]}>
                <Txt variant="caption" color={on ? colors.onDarkMuted : colors.muted}>
                  {i === 0 ? 'Today' : shortDate(d).split(',')[0]}
                </Txt>
                <Txt variant="subtitle" color={on ? colors.onDark : colors.ink}>
                  {d.getDate()}
                </Txt>
              </PressableScale>
            </Animated.View>
          );
        })}
      </View>
    </Sheet>
  );
}

type CategorySheetProps = {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  selected: string | null;
  onSelect: (id: string) => void;
};

export function CategorySheet({ visible, onClose, categories, selected, onSelect }: CategorySheetProps) {
  return (
    <Sheet visible={visible} onClose={onClose} title="All categories">
      <View style={styles.list}>
        {categories.map((c, i) => {
          const on = c.id === selected;
          return (
            <Animated.View key={c.id} entering={FadeInDown.delay(i * 30).duration(220)}>
              <PressableScale
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                accessibilityLabel={c.name}
                onPress={() => {
                  onSelect(c.id);
                  onClose();
                }}
                haptic
                style={[styles.option, on ? styles.optionOn : null]}>
                <Tile icon={c.icon} tone={c.tone} size={40} />
                <Txt variant="bodyMedium" style={{ flex: 1 }}>
                  {c.name}
                </Txt>
                {on ? <Icon name="check" size={20} color={colors.emerald} strokeWidth={2.6} /> : null}
              </PressableScale>
            </Animated.View>
          );
        })}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  option: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
  optionOn: { borderColor: colors.emerald, backgroundColor: colors.mint },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  dayCell: { width: `${100 / 7}%`, padding: 4 },
  day: { height: 60, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.mist },
  dayOn: { backgroundColor: colors.forest },
});
