import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { impact, tap } from '@/lib/haptics';
import { colors, fonts, shadow, springs } from '@/theme';

import { Icon, type IconName } from './Icon';

const TABS: { name: string; label: string; icon: IconName }[] = [
  { name: 'home', label: 'Home', icon: 'home' },
  { name: 'activity', label: 'Activity', icon: 'list' },
  { name: 'insights', label: 'Insights', icon: 'pie' },
  { name: 'budgets', label: 'Budgets', icon: 'target' },
];

/** Slot order on screen: two tabs, the add button, two tabs. */
const SLOTS = [0, 1, -1, 2, 3];

function TabItem({ label, icon, focused, onPress }: { label: string; icon: IconName; focused: boolean; onPress: () => void }) {
  const lift = useSharedValue(1);
  useEffect(() => {
    lift.value = focused
      ? withSequence(withSpring(1.18, springs.bouncy), withSpring(1, springs.snappy))
      : withTiming(1, { duration: 150 });
  }, [focused, lift]);
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: lift.value }] }));
  const color = focused ? colors.emerald : colors.muted;
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      style={styles.item}>
      <Animated.View style={iconStyle}>
        <Icon name={icon} size={22} color={color} />
      </Animated.View>
      <Animated.Text style={[styles.label, { color, fontFamily: focused ? fonts.semibold : fonts.medium }]}>{label}</Animated.Text>
    </Pressable>
  );
}

/** Bottom navigation with a sliding indicator and a raised add button in the middle. */
export function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [width, setWidth] = useState(0);
  const activeName = state.routes[state.index]?.name;
  const activeTab = Math.max(0, TABS.findIndex((t) => t.name === activeName));
  const slot = SLOTS.indexOf(activeTab);

  const x = useSharedValue(slot);
  useEffect(() => {
    x.value = withSpring(slot, springs.snappy);
  }, [slot, x]);

  const slotW = (width - 16) / 5;
  const indicator = useAnimatedStyle(() => ({ transform: [{ translateX: 8 + x.value * slotW + slotW / 2 - 14 }] }));

  const fab = useSharedValue(1);
  const fabStyle = useAnimatedStyle(() => ({ transform: [{ scale: fab.value }] }));

  return (
    <View
      accessibilityRole="tablist"
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) + 4 }]}>
      {width > 0 ? <Animated.View style={[styles.indicator, indicator]} /> : null}
      {SLOTS.map((tabIndex, i) => {
        if (tabIndex === -1) {
          return (
            <View key="add" style={styles.item}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add transaction"
                onPressIn={() => {
                  fab.value = withSpring(0.88, springs.snappy);
                }}
                onPressOut={() => {
                  fab.value = withSpring(1, springs.bouncy);
                }}
                onPress={() => {
                  impact('medium');
                  router.push('/add');
                }}>
                <Animated.View style={[styles.fab, shadow.button, fabStyle]}>
                  <Icon name="plus" size={26} color={colors.onDark} strokeWidth={2.4} />
                </Animated.View>
              </Pressable>
            </View>
          );
        }
        const tab = TABS[tabIndex];
        const route = state.routes.find((r) => r.name === tab.name);
        const focused = activeName === tab.name;
        return (
          <TabItem
            key={`${tab.name}-${i}`}
            label={tab.label}
            icon={tab.icon}
            focused={focused}
            onPress={() => {
              if (!route) return;
              const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) {
                tap();
                navigateToTab(route.key);
              }
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 52 },
  label: { fontSize: 12, lineHeight: 16 },
  indicator: { position: 'absolute', top: 0, left: 0, width: 28, height: 3, borderRadius: 2, backgroundColor: colors.emerald },
  fab: {
    width: 60,
    height: 60,
    marginTop: -30,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: colors.mist,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
