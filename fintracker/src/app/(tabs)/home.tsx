import { Link, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

import { Button, IconButton } from '@/components/Button';
import { Card, EmptyState, SectionTitle, TxnRow } from '@/components/Finance';
import { Icon } from '@/components/Icon';
import { AnimatedNumber, ProgressBar } from '@/components/Progress';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { dayLabel, daysInMonth, greeting, monthName, monthYear } from '@/lib/date';
import { budgetStatus, inMonth, sumBy, totalBalance } from '@/lib/finance';
import { formatNumber, formatTk, initials, percent } from '@/lib/format';
import { tap } from '@/lib/haptics';
import { useCategoryMap, useDeleteTransaction, useWalletMap, walletShortName } from '@/lib/hooks';
import { useStore } from '@/store';
import { colors, radius } from '@/theme';

export default function Home() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const txns = useStore((s) => s.transactions);
  const wallets = useStore((s) => s.wallets);
  const settings = useStore((s) => s.settings);
  const setSetting = useStore((s) => s.setSetting);
  const unread = useStore((s) => s.notifications.filter((n) => !n.read).length);
  const cats = useCategoryMap();
  const walletMap = useWalletMap();
  const onDelete = useDeleteTransaction();

  const now = new Date();
  const stats = useMemo(() => {
    const month = inMonth(txns, now);
    const spent = sumBy(month, 'expense');
    return { balance: totalBalance(wallets, txns), income: sumBy(month, 'income'), spent };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txns, wallets]);

  const limit = settings.monthlyBudget;
  const left = limit - stats.spent;
  const daysLeft = daysInMonth(now) - now.getDate() + 1;
  const status = budgetStatus(stats.spent, limit);
  const hidden = settings.balanceHidden;
  const recent = txns.slice(0, 5);

  return (
    <Screen bottomInset={24}>
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <View style={styles.headerLeft}>
          <Link href="/profile" asChild>
            <PressableScale accessibilityRole="button" accessibilityLabel="Profile and settings" style={styles.avatar} haptic>
              <Txt variant="subtitle" color={colors.forest}>
                {initials(user?.name ?? '')}
              </Txt>
            </PressableScale>
          </Link>
          <View>
            <Txt variant="small" color={colors.muted}>
              {greeting(now)}
            </Txt>
            <Txt variant="title" numberOfLines={1}>
              {user?.name ?? 'there'}
            </Txt>
          </View>
        </View>
        <IconButton icon="bell" label={unread ? `Notifications, ${unread} unread` : 'Notifications'} badge={unread > 0} onPress={() => router.push('/notifications')} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60).duration(420)} style={styles.balance}>
        <View style={styles.balanceRing} />
        <View style={styles.rowBetween}>
          <Txt variant="label" color={colors.onDarkMuted} style={{ fontFamily: 'Outfit_400Regular' }}>
            Total balance
          </Txt>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show balance' : 'Hide balance'}
            onPress={() => {
              tap();
              setSetting('balanceHidden', !hidden);
            }}
            style={styles.eyeBtn}>
            <Icon name={hidden ? 'eye' : 'eyeOff'} size={18} color={colors.onDark} />
            <Txt variant="label" color={colors.onDark}>
              {monthYear(now)}
            </Txt>
          </PressableScale>
        </View>
        <View style={{ height: 48, justifyContent: 'center' }}>
          {hidden ? (
            <Animated.View key="hidden" entering={FadeIn.duration(200)} exiting={FadeOut.duration(120)}>
              <Txt variant="display" color={colors.onDark} accessibilityLabel="Balance hidden">
                Tk ••••••
              </Txt>
            </Animated.View>
          ) : (
            <Animated.View key="shown" entering={FadeIn.duration(200)} exiting={FadeOut.duration(120)} style={styles.amountRow}>
              <Txt variant="title" color={colors.onDarkMuted} style={{ fontSize: 22, marginRight: 6 }}>
                Tk
              </Txt>
              <AnimatedNumber value={stats.balance} format={(n) => formatNumber(n, true)} color={colors.onDark} accessibilityLabel={formatTk(stats.balance)} />
            </Animated.View>
          )}
        </View>
        <View style={styles.tiles}>
          <View style={styles.tile}>
            <View style={[styles.tileIcon, { backgroundColor: colors.lime }]}>
              <Icon name="arrowUpRight" size={18} color={colors.forest} strokeWidth={2.2} />
            </View>
            <View style={{ flexShrink: 1 }}>
              <Txt variant="caption" color={colors.onDarkMuted}>
                Income
              </Txt>
              <Txt variant="bodyMedium" weight="semibold" color={colors.onDark} tabular numberOfLines={1}>
                {hidden ? 'Tk ••••' : formatTk(stats.income, { decimals: false })}
              </Txt>
            </View>
          </View>
          <View style={styles.tile}>
            <View style={[styles.tileIcon, { backgroundColor: 'rgba(255,255,255,0.14)' }]}>
              <Icon name="arrowDownLeft" size={18} color={colors.onDark} strokeWidth={2.2} />
            </View>
            <View style={{ flexShrink: 1 }}>
              <Txt variant="caption" color={colors.onDarkMuted}>
                Expenses
              </Txt>
              <Txt variant="bodyMedium" weight="semibold" color={colors.onDark} tabular numberOfLines={1}>
                {hidden ? 'Tk ••••' : formatTk(stats.spent, { decimals: false })}
              </Txt>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(420)}>
        <PressableScale accessibilityRole="button" accessibilityLabel="Monthly budget, open budgets" onPress={() => router.push('/budgets')} scaleTo={0.98}>
          <Card style={{ gap: 10 }}>
            <View style={styles.rowBetween}>
              <Txt variant="subtitle">Monthly budget</Txt>
              <View style={[styles.pill, { backgroundColor: status === 'ok' ? colors.mint : colors.dangerSoft }]}>
                {status !== 'ok' ? <Icon name="alert" size={13} color={status === 'over' ? colors.danger : colors.warning} strokeWidth={2.4} /> : null}
                <Txt variant="small" weight="semibold" color={status === 'ok' ? colors.emerald : status === 'over' ? colors.danger : colors.warning}>
                  {percent(stats.spent, limit)}% used
                </Txt>
              </View>
            </View>
            <Txt variant="label" color={colors.muted} style={{ fontFamily: 'Outfit_400Regular' }}>
              <Txt variant="label" weight="semibold">
                {formatTk(stats.spent, { decimals: false })}
              </Txt>{' '}
              spent of {formatTk(limit, { decimals: false })}
            </Txt>
            <ProgressBar value={limit ? stats.spent / limit : 0} height={10} color={status === 'over' ? colors.danger : status === 'close' ? colors.warning : colors.emerald} delay={250} />
            <Txt variant="small" color={colors.muted}>
              {left >= 0
                ? `${formatTk(left, { decimals: false })} left · ${daysLeft} days to go · about ${formatTk(left / daysLeft, { decimals: false })} a day`
                : `${formatTk(-left, { decimals: false })} over for ${monthName(now)}`}
            </Txt>
          </Card>
        </PressableScale>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(180).duration(420)} style={{ gap: 4 }}>
        <SectionTitle title="Recent transactions" action={recent.length ? 'See all' : undefined} onAction={() => router.push('/activity')} />
        {recent.length ? (
          <View style={styles.list}>
            {recent.map((t, i) => (
              <TxnRow
                key={t.id}
                txn={t}
                index={i}
                first={i === 0}
                category={t.categoryId ? cats.get(t.categoryId) : undefined}
                subtitle={`${t.type === 'transfer' ? 'Transfer' : (t.categoryId && cats.get(t.categoryId)?.name) || 'Uncategorised'} · ${dayLabel(new Date(t.date))}`}
                walletName={walletShortName(walletMap.get(t.walletId))}
                onDelete={onDelete}
              />
            ))}
          </View>
        ) : (
          <Card>
            <EmptyState
              icon="wallet"
              title="No transactions yet"
              body="Add your first expense or income and it will show up here."
              action={<Button label="Add transaction" icon="plus" size="md" onPress={() => router.push('/add')} />}
            />
          </Card>
        )}
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 48 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  balance: { borderRadius: radius.xxl, backgroundColor: colors.forest, padding: 20, paddingBottom: 16, gap: 12, overflow: 'hidden' },
  balanceRing: { position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 28, borderColor: 'rgba(212, 240, 106, 0.10)', top: -90, right: -70 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyeBtn: { height: 44, paddingHorizontal: 14, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.10)', flexDirection: 'row', alignItems: 'center', gap: 8 },
  amountRow: { flexDirection: 'row', alignItems: 'baseline' },
  tiles: { flexDirection: 'row', gap: 10 },
  tile: { flex: 1, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  tileIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  list: { borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
});
