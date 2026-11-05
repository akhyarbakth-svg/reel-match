import { forwardRef, useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type StyleProp, type TextInputInstance, type TextInputProps, type ViewStyle } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOut,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useTimingValue } from '@/lib/anim';
import { colors, fonts, radius } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Txt } from './Txt';

type Props = Omit<TextInputProps, 'style'> & {
  label: string;
  icon?: IconName;
  /** Text shown before the input, e.g. "Tk". */
  prefix?: string;
  error?: string | null;
  hint?: string;
  /** Change this number to replay the shake animation (e.g. on a failed submit). */
  shakeKey?: number;
  /** Adds a show/hide button for passwords. */
  password?: boolean;
  labelRight?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  height?: number;
};

/** Labelled text field: border and glow ease in on focus, errors slide in and the field shakes. */
export const TextField = forwardRef<TextInputInstance, Props>(function TextField(
  { label, icon, prefix, error, hint, shakeKey = 0, password, labelRight, style, height = 56, onFocus, onBlur, ...input },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);
  const focus = useTimingValue(focused ? 1 : 0, 160);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (shakeKey > 0 && error) {
      shake.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 70 }),
        withTiming(-6, { duration: 60 }),
        withTiming(4, { duration: 50 }),
        withTiming(0, { duration: 40 }),
      );
    }
  }, [shakeKey, error, shake]);

  const errorActive = !!error;
  const box = useAnimatedStyle(() => ({
    borderColor: errorActive
      ? colors.danger
      : interpolateColor(focus.value, [0, 1], [colors.borderStrong, colors.emerald]),
    shadowOpacity: focus.value * 0.16,
    transform: [{ translateX: shake.value }],
  }));

  return (
    <View style={[{ gap: 8 }, style]}>
      <View style={styles.labelRow}>
        <Txt variant="label" nativeID={`${label}-label`}>
          {label}
        </Txt>
        {labelRight}
      </View>
      <Animated.View style={[styles.box, { height }, box]}>
        {icon ? <Icon name={icon} size={20} color={focused ? colors.emerald : colors.muted} /> : null}
        {prefix ? (
          <Txt variant="bodyMedium" color={colors.muted} style={{ fontSize: 15 }}>
            {prefix}
          </Txt>
        ) : null}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={password && !reveal}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={styles.input}
          {...input}
        />
        {password ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={reveal ? 'Hide password' : 'Show password'}
            onPress={() => setReveal((r) => !r)}
            style={styles.eye}>
            <Icon name={reveal ? 'eyeOff' : 'eye'} size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </Animated.View>
      {error ? (
        <Animated.View entering={FadeInDown.duration(180)} exiting={FadeOut.duration(120)} style={styles.msgRow}>
          <Icon name="alert" size={14} color={colors.danger} strokeWidth={2.4} />
          <Txt variant="small" color={colors.danger} accessibilityLiveRegion="polite">
            {error}
          </Txt>
        </Animated.View>
      ) : hint ? (
        <Txt variant="small" color={colors.muted}>
          {hint}
        </Txt>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  box: {
    borderWidth: 1.5,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 16,
    paddingRight: 4,
    shadowColor: colors.emerald,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  input: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
    height: '100%',
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.ink,
    paddingRight: 12,
    outlineStyle: 'none',
  } as object,
  eye: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  msgRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
