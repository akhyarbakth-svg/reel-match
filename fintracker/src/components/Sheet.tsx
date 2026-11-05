import { useEffect, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { GestureDetector, GestureHandlerRootView, usePanGesture } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { colors, radius, space } from '@/theme';

import { IconButton } from './Button';
import { Txt } from './Txt';

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Optional action at the top-right, e.g. "Reset". */
  headerRight?: ReactNode;
  footer?: ReactNode;
};

const OFFSCREEN = 900;

/** Bottom sheet: slides up on a spring, dims the screen, and can be dragged down to dismiss. */
export function Sheet({ visible, onClose, title, children, headerRight, footer }: Props) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  if (visible && !mounted) setMounted(true);
  const y = useSharedValue(OFFSCREEN);
  const fade = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      y.set(OFFSCREEN);
      y.set(withSpring(0, { damping: 22, stiffness: 220 }));
      fade.set(withTiming(1, { duration: 220 }));
    } else {
      fade.set(withTiming(0, { duration: 200 }));
      y.set(
        withTiming(OFFSCREEN, { duration: 240, easing: Easing.in(Easing.cubic) }, (done) => {
          if (done) scheduleOnRN(setMounted, false);
        }),
      );
    }
  }, [visible, y, fade]);

  const pan = usePanGesture({
    onUpdate: (e) => {
      'worklet';
      y.set(Math.max(0, e.translationY));
      fade.set(Math.max(0.2, 1 - e.translationY / 500));
    },
    onDeactivate: (e) => {
      'worklet';
      if (e.translationY > 110 || e.velocityY > 900) {
        scheduleOnRN(onClose);
      } else {
        y.set(withSpring(0, { damping: 22, stiffness: 240 }));
        fade.set(withTiming(1, { duration: 150 }));
      }
    },
  });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  if (!mounted) return null;

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <GestureHandlerRootView style={styles.fill}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill}>
          <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
            <Pressable accessible={false} importantForAccessibility="no" aria-hidden style={styles.fill} onPress={onClose} />
          </Animated.View>
          <View style={styles.anchor} pointerEvents="box-none">
            <Animated.View
              accessibilityViewIsModal
              style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }, sheetStyle]}>
              <GestureDetector gesture={pan}>
                <View style={styles.dragArea}>
                  <View style={styles.grabber} />
                  <View style={styles.header}>
                    <IconButton icon="close" label="Close" onPress={onClose} variant="soft" />
                    <Txt variant="title" accessibilityRole="header" style={styles.title}>
                      {title}
                    </Txt>
                    {headerRight ?? <View style={{ width: 44 }} />}
                  </View>
                </View>
              </GestureDetector>
              <View style={styles.body}>{children}</View>
              {footer ? <View style={{ paddingHorizontal: space.xl, paddingTop: space.md }}>{footer}</View> : null}
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  backdrop: { backgroundColor: colors.scrim },
  anchor: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    maxHeight: '92%',
  },
  dragArea: { paddingTop: 10, paddingHorizontal: space.xl, gap: 6 },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: '#C5D3CB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 52 },
  title: { flex: 1, textAlign: 'center' },
  body: { paddingHorizontal: space.xl, paddingTop: space.sm, gap: space.lg, flexShrink: 1 },
});
