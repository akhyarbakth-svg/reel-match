import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { colors } from '@/theme';

import { Icon } from './Icon';
import { Txt } from './Txt';

/**
 * In-app animated splash (screen 01): the logo springs in, the wordmark rises,
 * a progress bar fills, then the whole layer fades away to reveal the app.
 */
export function SplashOverlay() {
  const reduce = useReducedMotion();
  const [done, setDone] = useState(false);
  const logo = useSharedValue(0);
  const word = useSharedValue(0);
  const bar = useSharedValue(0);
  const layer = useSharedValue(1);

  useEffect(() => {
    const slow = reduce ? 0.3 : 1;
    logo.value = withSpring(1, { damping: 12, stiffness: 160 });
    word.value = withDelay(180 * slow, withTiming(1, { duration: 420 * slow, easing: Easing.out(Easing.cubic) }));
    bar.value = withDelay(250 * slow, withTiming(1, { duration: 900 * slow, easing: Easing.inOut(Easing.quad) }));
    layer.value = withDelay(
      1250 * slow,
      withTiming(0, { duration: 380, easing: Easing.out(Easing.quad) }, (fin) => {
        if (fin) scheduleOnRN(setDone, true);
      }),
    );
  }, [bar, layer, logo, reduce, word]);

  const layerStyle = useAnimatedStyle(() => ({ opacity: layer.value, transform: [{ scale: 1 + (1 - layer.value) * 0.06 }] }));
  const logoStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, logo.value * 1.5), transform: [{ scale: 0.6 + logo.value * 0.4 }] }));
  const wordStyle = useAnimatedStyle(() => ({ opacity: word.value, transform: [{ translateY: (1 - word.value) * 14 }] }));
  const barStyle = useAnimatedStyle(() => ({ width: `${bar.value * 100}%` }));

  if (done) return null;
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.root, layerStyle]} accessibilityLabel="fintracker is loading">
      <View style={[styles.ring, { width: 460, height: 460, top: -150, right: -210 }]} />
      <View style={[styles.ring, { width: 300, height: 300, top: -70, right: -130 }]} />
      <View style={styles.blob} />
      <Animated.View style={[styles.logo, logoStyle]}>
        <Icon name="logo" size={48} color={colors.forest} strokeWidth={2.2} />
      </Animated.View>
      <Animated.View style={[styles.words, wordStyle]}>
        <Txt variant="display" color={colors.onDark}>
          fintracker
        </Txt>
        <Txt variant="body" color={colors.onDarkMuted} style={{ fontSize: 17 }}>
          Your Personal Money Management Tool.
        </Txt>
      </Animated.View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, barStyle]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', zIndex: 1000 },
  ring: { position: 'absolute', borderRadius: 999, borderWidth: 1, borderColor: 'rgba(212, 240, 106, 0.16)' },
  blob: { position: 'absolute', width: 360, height: 360, borderRadius: 180, backgroundColor: colors.forestDeep, bottom: -180, left: -150 },
  logo: { width: 88, height: 88, borderRadius: 26, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  words: { alignItems: 'center', gap: 10, marginTop: 24 },
  track: { position: 'absolute', bottom: 72, width: 72, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.14)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2, backgroundColor: colors.lime },
});
