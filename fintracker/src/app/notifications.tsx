import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { FadeInDown, FadeOut, LinearTransition, useAnimatedStyle, ZoomOut, type SharedValue } from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { showToast } from '@/components/Feedback';
import { Card, EmptyState } from '@/components/Finance';
import { Icon, type IconName } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { Header, Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import type { AppNotification, NotificationKind } from '@/data/types';
import { ago, isSameDay } from '@/lib/date';
import { formatTk } from '@/lib/format';
import { success, tap } from '@/lib/haptics';
import { useStore } from '@/store';
import { colors, radius, tones } from '@/theme';

const VISUAL: Record<NotificationKind, { icon: IconName; bg: string; fg: string; href?: '/budgets' | '/goals' | '/insights' | '/activity' | '/profile' }> = {
  budget: { icon: 'alert', bg: colors.dangerSoft, fg: colors.danger, href: '/budgets' },
  bill: { icon: 'calendar', bg: tones.lime.bg, fg: tones.lime.fg },
  goal: { icon: 'shield', bg: tones.mint.bg, fg: tones.mint.fg, href: '/goals' },
  summary: { icon: 'pie', bg: tones.teal.bg, fg: tones.teal.fg, href: '/insights' },
  income: { icon: 'briefcase', bg: tones.brand.bg, fg: tones.brand.fg, href: '/activity' },
  security: { icon: 'lock', bg: tones.mint.bg, fg: tones.mint.fg, href: '/profile' },
};

function DismissAction({ progress }: { progress: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({ opacity: Math.min(1, progress.value * 1.5) }));
  return (
    <Animated.View style={[styles.dismiss, style]}>
      <Icon name="trash" size={20} color={colors.danger} />
      <Txt variant="caption" weight="semibold" color={colors.danger}>
        Dismiss
      </Txt>
    </Animated.View>
  );
}

function Item({ n, index }: { n: AppNotification; index: number }) {
  const router = useRouter();
  const markRead = useStore((s) => s.markRead);
  const dismiss = useStore((s) => s.dismissNotification);
  const restore = useStore((s) => s.restoreNotification);
  const addTransaction = useStore((s) => s.addTransaction);
  const v = VISUAL[n.kind];

  const remove = () => {
    const removed = dismiss(n.id);
    if (removed) showToast('Notification dismissed', { icon: 'trash', actionLabel: 'Undo', onAction: () => restore(removed) });
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)} exiting={FadeOut.duration(180)} layout={LinearTransition.springify().damping(20)}>
      <ReanimatedSwipeable friction={1.6} rightThreshold={80} overshootRight={false} onSwipeableOpen={remove} renderRightActions={(p) => <DismissAction progress={p} />}>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`${n.read ? '' : 'Unread. '}${n.title}. ${n.body}`}
          accessibilityHint={v.href ? 'Opens related screen' : undefined}
          onPress={() => {
            tap();
            markRead(n.id);
            if (v.href) router.push(v.href);
          }}
          scaleTo={0.985}
          style={[styles.card, { borderColor: n.read ? colors.border : colors.mintStrong }]}>
          <View style={[styles.icon, { backgroundColor: v.bg }]}>
            <Icon name={v.icon} size={18} color={v.fg} strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <View style={styles.titleRow}>
              <Txt variant="label" weight={n.read ? 'medium' : 'semibold'} style={{ flex: 1, fontSize: 15 }}>
                {n.title}
              </Txt>
              <Txt variant="caption" color={colors.muted}>
                {ago(new Date(n.date))}
              </Txt>
              {!n.read ? <Animated.View exiting={ZoomOut.duration(200)} style={styles.dot} /> : null}
            </View>
            <Txt variant="label" color={n.read ? colors.muted : colors.body} style={{ fontFamily: 'Outfit_400Regular', lineHeight: 20 }}>
              {n.body}
            </Txt>
            {n.bill && !n.read ? (
              <View style={styles.actions}>
                <Button
                  label="Mark as paid"
                  size="md"
                  onPress={() => {
                    if (!n.bill) return;
                    addTransaction({ type: 'expense', amount: n.bill.amount, title: n.bill.title, categoryId: n.bill.categoryId, walletId: n.bill.walletId, date: new Date().toISOString() });
                    markRead(n.id);
                    success();
                    showToast(`${n.bill.title} paid · ${formatTk(n.bill.amount)}`);
                  }}
                />
                <Button label="Dismiss" variant="secondary" size="md" onPress={() => markRead(n.id)} />
              </View>
            ) : null}
          </View>
        </PressableScale>
      </ReanimatedSwipeable>
    </Animated.View>
  );
}

export default function Notifications() {
  const router = useRouter();
  const notifications = useStore((s) => s.notifications);
  const markAll = useStore((s) => s.markAllRead);
  const now = new Date();
  const today = notifications.filter((n) => isSameDay(new Date(n.date), now));
  const earlier = notifications.filter((n) => !isSameDay(new Date(n.date), now));
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Screen header={<Header title="Notifications" rightIcon="sliders" rightLabel="Notification settings" onRight={() => router.push('/profile')} />}>
      {notifications.length === 0 ? (
        <Card>
          <EmptyState icon="bell" title="You’re all caught up" body="Budget alerts, bill reminders and goal milestones will show up here." />
        </Card>
      ) : (
        <>
          <View style={styles.head}>
            <Txt variant="label" weight="semibold" color={colors.body} style={{ fontSize: 15 }}>
              {unread ? `${unread} unread` : 'All read'}
            </Txt>
            {unread ? (
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel="Mark all as read"
                onPress={() => {
                  success();
                  markAll();
                }}
                style={styles.markAll}>
                <Txt variant="label" color={colors.emerald}>
                  Mark all as read
                </Txt>
              </PressableScale>
            ) : null}
          </View>
          {today.length ? (
            <View style={{ gap: 10 }}>
              <Txt variant="label" color={colors.muted} accessibilityRole="header">
                Today
              </Txt>
              {today.map((n, i) => (
                <Item key={n.id} n={n} index={i} />
              ))}
            </View>
          ) : null}
          {earlier.length ? (
            <View style={{ gap: 10 }}>
              <Txt variant="label" color={colors.muted} accessibilityRole="header">
                Earlier
              </Txt>
              {earlier.map((n, i) => (
                <Item key={n.id} n={n} index={today.length + i} />
              ))}
            </View>
          ) : null}
          <Txt variant="small" color={colors.muted} align="center">
            Swipe left to dismiss a notification.
          </Txt>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  markAll: { height: 44, justifyContent: 'center' },
  card: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.emerald },
  actions: { flexDirection: 'row', gap: 8, marginTop: 6 },
  dismiss: { width: 100, alignItems: 'center', justifyContent: 'center', gap: 2, backgroundColor: colors.dangerSoft, borderRadius: radius.lg, marginLeft: 8 },
});
