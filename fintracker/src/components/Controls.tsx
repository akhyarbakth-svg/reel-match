import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useSpringValue, useTimingValue } from '@/lib/anim';
import { tap } from '@/lib/haptics';
import { colors, radius, shadow, springs } from '@/theme';

import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Txt } from './Txt';

type Option<T extends string> = { value: T; label: string };

type SegmentedProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  style?: StyleProp<ViewStyle>;
};

/** Segmented control with a thumb that springs to the selected option. */
export function Segmented<T extends string>({ options, value, onChange, label, style }: SegmentedProps<T>) {
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const pos = useSharedValue(index);

  useEffect(() => {
    pos.value = withSpring(index, springs.snappy);
  }, [index, pos]);

  const segW = width > 0 ? (width - 8 - (options.length - 1) * 4) / options.length : 0;
  const thumb = useAnimatedStyle(() => ({
    width: segW,
    transform: [{ translateX: pos.value * (segW + 4) }],
  }));

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={label}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[styles.segTrack, style]}>
      {width > 0 ? <Animated.View style={[styles.segThumb, shadow.soft, thumb]} /> : null}
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={o.label}
            onPress={() => {
              if (!selected) {
                tap();
                onChange(o.value);
              }
            }}
            style={styles.segItem}>
            <Txt variant="label" weight="semibold" color={selected ? colors.ink : colors.muted} style={{ fontSize: 15 }}>
              {o.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

type SwitchProps = {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
};

/** Toggle switch: the thumb springs across and the track colour blends. */
export function Switch({ value, onChange, label }: SwitchProps) {
  const progress = useSpringValue(value ? 1 : 0);
  const track = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.switchOff, colors.emerald]),
  }));
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: progress.value * 20 }] }));
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      hitSlop={8}
      onPress={() => {
        tap();
        onChange(!value);
      }}>
      <Animated.View style={[styles.switchTrack, track]}>
        <Animated.View style={[styles.switchThumb, thumb]} />
      </Animated.View>
    </Pressable>
  );
}

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** "solid" = dark fill when selected (single choice). "check" = mint + tick (multi choice). */
  mode?: 'solid' | 'check';
};

export function Chip({ label, selected, onPress, mode = 'solid' }: ChipProps) {
  const p = useTimingValue(selected ? 1 : 0, 180);
  const solid = mode === 'solid';
  const anim = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(p.value, [0, 1], [colors.surface, solid ? colors.forest : colors.mint]),
    borderColor: interpolateColor(p.value, [0, 1], ['#DCE5E0', solid ? colors.forest : colors.emerald]),
  }));
  return (
    <PressableScale
      accessibilityRole={mode === 'check' ? 'checkbox' : 'button'}
      accessibilityState={mode === 'check' ? { checked: selected } : { selected }}
      accessibilityLabel={label}
      onPress={onPress}
      haptic
      scaleTo={0.95}>
      <Animated.View style={[styles.chip, anim]}>
        {mode === 'check' && selected ? <Icon name="check" size={16} color={colors.emerald} strokeWidth={2.6} /> : null}
        <Txt variant="label" color={solid && selected ? colors.onDark : colors.ink}>
          {label}
        </Txt>
      </Animated.View>
    </PressableScale>
  );
}

type CheckRowProps = { label: string; checked: boolean; onToggle: () => void };

export function CheckRow({ label, checked, onToggle }: CheckRowProps) {
  const p = useSpringValue(checked ? 1 : 0);
  const box = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(p.value, [0, 1], [colors.surface, colors.emerald]),
    borderColor: interpolateColor(p.value, [0, 1], [colors.borderStrong, colors.emerald]),
  }));
  const tick = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ scale: 0.5 + p.value * 0.5 }] }));
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      onPress={() => {
        tap();
        onToggle();
      }}
      style={styles.checkRow}>
      <Animated.View style={[styles.checkBox, box]}>
        <Animated.View style={tick}>
          <Icon name="check" size={14} color={colors.onDark} strokeWidth={3} />
        </Animated.View>
      </Animated.View>
      <Txt variant="body" style={{ fontSize: 15, flexShrink: 1 }}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  segTrack: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: radius.md,
    backgroundColor: colors.track,
  },
  segThumb: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  segItem: { flex: 1, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  switchTrack: { width: 52, height: 32, borderRadius: 16, padding: 3 },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surface,
    ...shadow.soft,
  },
  chip: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
  checkBox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});
