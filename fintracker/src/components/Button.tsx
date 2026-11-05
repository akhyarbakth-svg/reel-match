import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadow } from '@/theme';

import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Txt } from './Txt';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'soft';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  size?: 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

const VARIANTS: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.emerald, fg: colors.onDark },
  secondary: { bg: colors.surface, fg: colors.ink, border: colors.borderStrong },
  outline: { bg: colors.surface, fg: colors.emerald, border: colors.emerald },
  danger: { bg: colors.surface, fg: colors.danger, border: colors.dangerBorder },
  soft: { bg: colors.mint, fg: colors.emerald },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  size = 'lg',
  style,
  accessibilityHint,
}: ButtonProps) {
  const v = VARIANTS[variant];
  const inactive = disabled || loading;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      haptic
      style={[
        styles.base,
        { height: size === 'lg' ? 56 : 44, borderRadius: size === 'lg' ? 18 : 14, backgroundColor: inactive && variant === 'primary' ? '#DCE5E0' : v.bg },
        v.border ? { borderWidth: 1.5, borderColor: v.border } : null,
        variant === 'primary' && !inactive ? shadow.button : null,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.muted : v.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={18} color={inactive && variant === 'primary' ? colors.muted : v.fg} /> : null}
          <Txt variant={size === 'lg' ? 'subtitle' : 'label'} weight="semibold" color={inactive && variant === 'primary' ? colors.muted : v.fg} style={size === 'lg' ? { fontSize: 17 } : null}>
            {label}
          </Txt>
        </View>
      )}
    </PressableScale>
  );
}

type IconButtonProps = {
  icon: IconName;
  label: string;
  onPress?: () => void;
  variant?: 'surface' | 'primary' | 'soft' | 'ghost';
  size?: number;
  badge?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** 44px round icon button with an accessible name. */
export function IconButton({ icon, label, onPress, variant = 'surface', size = 44, badge, style }: IconButtonProps) {
  const palette = {
    surface: { bg: colors.surface, fg: colors.ink, border: colors.border },
    primary: { bg: colors.emerald, fg: colors.onDark, border: colors.emerald },
    soft: { bg: colors.mint, fg: colors.emerald, border: colors.mint },
    ghost: { bg: 'transparent', fg: colors.ink, border: 'transparent' },
  }[variant];
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      haptic
      scaleTo={0.92}
      hitSlop={size < 44 ? (44 - size) / 2 : 0}
      style={[
        styles.iconBtn,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: palette.bg, borderColor: palette.border },
        style,
      ]}>
      <Icon name={icon} size={20} color={palette.fg} strokeWidth={variant === 'primary' ? 2.4 : 2} />
      {badge ? <View style={styles.badge} /> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  badge: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: colors.surface,
  },
});

export const buttonRadius = radius;
