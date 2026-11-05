import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '@/theme';

import { Txt } from './Txt';

type BarProps = {
  /** 0–1; values above 1 are clamped visually. */
  value: number;
  color?: string;
  track?: string;
  height?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

/** Progress bar that grows from empty on mount and eases to new values. */
export function ProgressBar({ value, color = colors.emerald, track = colors.border, height = 8, delay = 0, style }: BarProps) {
  const target = Math.max(0, Math.min(1, value));
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withDelay(delay, withTiming(target, { duration: 700, easing: Easing.out(Easing.cubic) }));
  }, [target, delay, w]);
  const fill = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={[{ height, borderRadius: height / 2, backgroundColor: track, overflow: 'hidden' }, style]}>
      <Animated.View style={[{ height: '100%', borderRadius: height / 2, backgroundColor: color }, fill]} />
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type RingProps = {
  value: number;
  size: number;
  stroke: number;
  color?: string;
  track?: string;
  children?: React.ReactNode;
};

/** Circular progress drawn with SVG; the arc sweeps in on mount. */
export function ProgressRing({ value, size, stroke, color = colors.emerald, track = colors.border, children }: RingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(Math.max(0, Math.min(1, value)), { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [value, p]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: c * (1 - p.value) }));
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} accessible={false}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          animatedProps={props}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

type NumberProps = {
  value: number;
  format: (n: number) => string;
  duration?: number;
  variant?: React.ComponentProps<typeof Txt>['variant'];
  color?: string;
  style?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
};

/** Text that counts from its previous value to the new one. */
export function AnimatedNumber({ value, format, duration = 750, variant = 'display', color, style, accessibilityLabel }: NumberProps) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = from.current;
    const t0 = Date.now();
    let raf = 0;
    const step = () => {
      const k = Math.min(1, (Date.now() - t0) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      setShown(start + (value - start) * eased);
      if (k < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      from.current = value;
    };
  }, [value, duration]);
  return (
    <Txt variant={variant} color={color} tabular style={style} accessibilityLabel={accessibilityLabel ?? format(value)}>
      {format(shown)}
    </Txt>
  );
}

const styles = StyleSheet.create({ center: { alignItems: 'center', justifyContent: 'center' } });
