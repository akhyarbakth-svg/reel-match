import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, space } from '@/theme';

import { IconButton } from './Button';
import type { IconName } from './Icon';
import { Txt } from './Txt';

type ScreenProps = {
  children: ReactNode;
  /** Scrollable content (default) or a fixed column. */
  scroll?: boolean;
  /** Content pinned to the bottom (primary button), kept above the home indicator. */
  footer?: ReactNode;
  header?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  background?: string;
  scrollProps?: ScrollViewProps;
  /** Extra space at the bottom of scroll content (e.g. for the tab bar). */
  bottomInset?: number;
};

export function Screen({
  children,
  scroll = true,
  footer,
  header,
  contentStyle,
  background = colors.mist,
  scrollProps,
  bottomInset = 0,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const top = Math.max(insets.top, 12) + 8;
  const bottomPad = (footer ? 16 : Math.max(insets.bottom, 16) + 8) + bottomInset;

  return (
    <View style={[styles.root, { backgroundColor: background }]}>
      {header ? <View style={{ paddingTop: top, paddingHorizontal: space.xl }}>{header}</View> : null}
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          {...scrollProps}
          contentContainerStyle={[
            styles.content,
            { paddingTop: header ? space.lg : top, paddingBottom: bottomPad },
            contentStyle,
          ]}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.fill, { paddingTop: header ? space.lg : top, paddingBottom: bottomPad }, contentStyle]}>
          {children}
        </View>
      )}
      {footer ? (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>{footer}</View>
      ) : null}
    </View>
  );
}

type HeaderProps = {
  title?: string;
  back?: 'back' | 'close' | false;
  onBack?: () => void;
  right?: ReactNode;
  rightIcon?: IconName;
  rightLabel?: string;
  onRight?: () => void;
};

/** Centered title with a round back/close button, as on every pushed screen. */
export function Header({ title, back = 'back', onBack, right, rightIcon, rightLabel, onRight }: HeaderProps) {
  const router = useRouter();
  const goBack = () => {
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
    else router.replace('/');
  };
  return (
    <View style={styles.header}>
      {back ? (
        <IconButton icon={back === 'close' ? 'close' : 'back'} label={back === 'close' ? 'Close' : 'Back'} onPress={goBack} />
      ) : (
        <View style={styles.spacer} />
      )}
      {title ? (
        <Txt variant="title" accessibilityRole="header" numberOfLines={1} style={styles.title}>
          {title}
        </Txt>
      ) : (
        <View style={{ flex: 1 }} />
      )}
      {right ?? (rightIcon ? <IconButton icon={rightIcon} label={rightLabel ?? ''} onPress={onRight} variant="primary" /> : <View style={styles.spacer} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: space.xl, gap: space.lg },
  fill: { flex: 1 },
  footer: { paddingHorizontal: space.xl, paddingTop: 12, gap: 10 },
  header: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { flex: 1, textAlign: 'center' },
  spacer: { width: 44 },
});
