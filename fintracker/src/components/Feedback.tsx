import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, FadeOutDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

import { colors, radius, shadow } from '@/theme';

import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Txt } from './Txt';

type ToastState = {
  id: number;
  message: string;
  icon: IconName;
  actionLabel?: string;
  onAction?: () => void;
  /** Lift the toast above the tab bar. */
  raised: boolean;
};

const useToastStore = create<{ toast: ToastState | null; show: (t: Omit<ToastState, 'id'>) => void; hide: () => void }>((set) => ({
  toast: null,
  show: (t) => set({ toast: { ...t, id: Date.now() } }),
  hide: () => set({ toast: null }),
}));

export function showToast(
  message: string,
  opts: { icon?: IconName; actionLabel?: string; onAction?: () => void; raised?: boolean } = {},
) {
  useToastStore.getState().show({ message, icon: opts.icon ?? 'check', actionLabel: opts.actionLabel, onAction: opts.onAction, raised: opts.raised ?? false });
}

/** Renders the current toast; mounted once in the root layout. */
export function ToastHost() {
  const toast = useToastStore((s) => s.toast);
  const hide = useToastStore((s) => s.hide);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(hide, toast.actionLabel ? 5000 : 2600);
    return () => clearTimeout(t);
  }, [toast, hide]);

  if (!toast) return null;
  return (
    <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, styles.toastWrap, { paddingBottom: Math.max(insets.bottom, 12) + (toast.raised ? 96 : 16) }]}>
      <Animated.View
        key={toast.id}
        entering={FadeInDown.springify().damping(18)}
        exiting={FadeOutDown.duration(180)}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        style={[styles.toast, shadow.card]}>
        <Animated.View entering={ZoomIn.delay(80).springify()} style={styles.toastIcon}>
          <Icon name={toast.icon} size={16} color={colors.forest} strokeWidth={2.6} />
        </Animated.View>
        <Txt variant="label" color={colors.onDark} style={{ flex: 1 }}>
          {toast.message}
        </Txt>
        {toast.actionLabel ? (
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={toast.actionLabel}
            onPress={() => {
              toast.onAction?.();
              hide();
            }}
            haptic
            style={styles.toastAction}>
            <Txt variant="label" weight="semibold" color={colors.lime}>
              {toast.actionLabel}
            </Txt>
          </PressableScale>
        ) : null}
      </Animated.View>
    </View>
  );
}

type ConfirmProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Small centred dialog for destructive confirmations. */
export function ConfirmDialog({ visible, title, message, confirmLabel, destructive, onConfirm, onCancel }: ConfirmProps) {
  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onCancel} statusBarTranslucent>
      {visible ? (
        <View style={styles.dialogRoot}>
          <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(150)} style={[StyleSheet.absoluteFill, styles.scrim]}>
            <Pressable accessible={false} importantForAccessibility="no" aria-hidden style={{ flex: 1 }} onPress={onCancel} />
          </Animated.View>
          <Animated.View entering={ZoomIn.springify().damping(16).stiffness(220)} style={[styles.dialog, shadow.card]} accessibilityViewIsModal>
            <Txt variant="title" accessibilityRole="header">
              {title}
            </Txt>
            <Txt variant="body" color={colors.body} style={{ fontSize: 15 }}>
              {message}
            </Txt>
            <View style={styles.dialogActions}>
              <Button label="Cancel" variant="secondary" size="md" onPress={onCancel} style={{ flex: 1 }} />
              <Button label={confirmLabel} variant={destructive ? 'danger' : 'primary'} size="md" onPress={onConfirm} style={{ flex: 1 }} />
            </View>
          </Animated.View>
        </View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  toastWrap: { justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 20, zIndex: 100 },
  toast: {
    width: '100%',
    maxWidth: 420,
    minHeight: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.forest,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 14,
    paddingRight: 6,
  },
  toastIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  toastAction: { height: 44, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  dialogRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  scrim: { backgroundColor: colors.scrim },
  dialog: { width: '100%', maxWidth: 360, backgroundColor: colors.surface, borderRadius: radius.xl, padding: 20, gap: 10 },
  dialogActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
