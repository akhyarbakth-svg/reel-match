import { Redirect, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Extrapolation,
  FadeIn,
  interpolate,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { Icon, type IconName } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { Txt } from '@/components/Txt';
import { impact } from '@/lib/haptics';
import { useStore } from '@/store';
import { colors, radius, shadow } from '@/theme';

const SLIDES = [
  {
    title: 'Every expense, tracked in seconds',
    body: 'Log spending as it happens, sort it by category, and always know how much is left to spend this month.',
  },
  {
    title: 'Budgets that keep you on track',
    body: 'Set a limit for each category. fintracker warns you before you overspend, not after.',
  },
  {
    title: 'See where your money goes',
    body: 'Clear monthly trends and category breakdowns show what changed and where you can save.',
  },
];

function FloatChip({ icon, iconBg, iconFg, title, value, valueColor, style }: { icon: IconName; iconBg: string; iconFg: string; title: string; value: string; valueColor?: string; style: object }) {
  return (
    <View style={[styles.chip, shadow.card, style]}>
      <View style={[styles.chipIcon, { backgroundColor: iconBg }]}>
        <Icon name={icon} size={18} color={iconFg} />
      </View>
      <View>
        <Txt variant="small" weight="semibold">
          {title}
        </Txt>
        <Txt variant="small" weight={valueColor ? 'semibold' : 'regular'} color={valueColor ?? colors.muted}>
          {value}
        </Txt>
      </View>
    </View>
  );
}

/** Each illustration drifts at a different speed from the page for a parallax effect. */
function Illustration({ index, x, width }: { index: number; x: SharedValue<number>; width: number }) {
  const back = useAnimatedStyle(() => {
    const d = (x.value - index * width) / Math.max(width, 1);
    return { transform: [{ translateX: d * 40 }, { scale: interpolate(Math.abs(d), [0, 1], [1, 0.9], Extrapolation.CLAMP) }] };
  });
  const front = useAnimatedStyle(() => {
    const d = (x.value - index * width) / Math.max(width, 1);
    return { transform: [{ translateX: d * -60 }], opacity: interpolate(Math.abs(d), [0, 0.7], [1, 0], Extrapolation.CLAMP) };
  });

  return (
    <View style={styles.art}>
      <Animated.View style={[styles.artCircle, back]} />
      <View style={[styles.dot, { top: 34, right: 56, width: 14, height: 14, backgroundColor: colors.lime }]} />
      {index === 0 ? (
        <>
          <Animated.View style={[styles.centerCard, shadow.card, back]}>
            <Txt variant="small" weight="medium" color={colors.muted}>
              This month’s budget
            </Txt>
            <View style={{ width: 120, height: 120 }}>
              <Svg width={120} height={120}>
                <Circle cx={60} cy={60} r={48} stroke={colors.border} strokeWidth={14} fill="none" />
                <Circle cx={60} cy={60} r={48} stroke={colors.emerald} strokeWidth={14} fill="none" strokeLinecap="round" strokeDasharray="214 302" transform="rotate(-90 60 60)" />
              </Svg>
              <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
                <Txt variant="title" style={{ fontSize: 26 }}>
                  71%
                </Txt>
                <Txt variant="caption" color={colors.muted}>
                  used
                </Txt>
              </View>
            </View>
            <Txt variant="label" weight="semibold">
              Tk 13,050 left
            </Txt>
          </Animated.View>
          <Animated.View style={[{ position: 'absolute', top: 36, left: 18 }, front]}>
            <FloatChip icon="cart" iconBg={colors.mint} iconFg={colors.emerald} title="Groceries" value="−Tk 1,250.00" style={{}} />
          </Animated.View>
          <Animated.View style={[{ position: 'absolute', bottom: 34, right: 16 }, front]}>
            <FloatChip icon="briefcase" iconBg={colors.lime} iconFg={colors.forest} title="Salary" value="+Tk 85,000.00" valueColor={colors.emerald} style={{}} />
          </Animated.View>
        </>
      ) : index === 1 ? (
        <Animated.View style={[styles.listCard, shadow.card, back]}>
          {[
            { n: 'Groceries', v: 0.79, c: colors.emerald, i: 'cart' as IconName, s: 'Tk 2,550 left' },
            { n: 'Food & drink', v: 0.87, c: colors.warning, i: 'coffee' as IconName, s: 'Close to limit' },
            { n: 'Transport', v: 1, c: colors.danger, i: 'car' as IconName, s: 'Tk 300 over' },
          ].map((r) => (
            <View key={r.n} style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.chipIcon, { backgroundColor: colors.mint }]}>
                  <Icon name={r.i} size={16} color={colors.emerald} />
                </View>
                <Txt variant="small" weight="semibold" style={{ flex: 1 }}>
                  {r.n}
                </Txt>
                <Txt variant="caption" weight="semibold" color={r.c === colors.emerald ? colors.body : r.c}>
                  {r.s}
                </Txt>
              </View>
              <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.border, overflow: 'hidden' }}>
                <View style={{ width: `${r.v * 100}%`, height: '100%', borderRadius: 4, backgroundColor: r.c }} />
              </View>
            </View>
          ))}
        </Animated.View>
      ) : (
        <Animated.View style={[styles.listCard, shadow.card, back, { paddingBottom: 14 }]}>
          <Txt variant="small" color={colors.muted}>
            Spent this month
          </Txt>
          <Txt variant="title" style={{ fontSize: 24 }}>
            Tk 31,950
          </Txt>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 110, gap: 10, marginTop: 6 }}>
            {[0.7, 0.92, 0.66, 0.8, 0.86, 0.6].map((h, i) => (
              <View key={i} style={{ flex: 1, height: `${h * 100}%`, borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: i === 5 ? colors.emerald : colors.mintStrong }} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="trendDown" size={16} color={colors.emerald} />
            <Txt variant="small" weight="semibold" color={colors.emerald}>
              12% less than last month
            </Txt>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

function Dot({ i, x, width }: { i: number; x: SharedValue<number>; width: number }) {
  const style = useAnimatedStyle(() => {
    const p = x.value / Math.max(width, 1);
    const d = Math.abs(p - i);
    return {
      width: interpolate(d, [0, 1], [24, 8], Extrapolation.CLAMP),
      backgroundColor: d < 0.5 ? colors.emerald : '#C5D3CB',
    };
  });
  return <Animated.View style={[styles.pageDot, style]} />;
}

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const seen = useStore((s) => s.onboardingSeen);
  const complete = useStore((s) => s.completeOnboarding);
  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(0);
  const x = useSharedValue(0);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const pageRef = useRef(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      x.value = e.contentOffset.x;
    },
  });

  if (seen) return <Redirect href="/log-in" />;

  const finish = () => {
    complete();
    router.replace('/sign-up');
  };

  const next = () => {
    impact();
    if (page >= SLIDES.length - 1) return finish();
    const target = page + 1;
    scrollRef.current?.scrollTo({ x: target * width, animated: true });
    setPage(target);
  };

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 12) + 8, paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
      <View style={styles.topRow}>
        <Txt variant="label" color={colors.muted}>
          Step {page + 1} of {SLIDES.length}
        </Txt>
        <PressableScale accessibilityRole="button" accessibilityLabel="Skip introduction" onPress={finish} style={styles.skip}>
          <Txt variant="bodyMedium" color={colors.emerald}>
            Skip
          </Txt>
        </PressableScale>
      </View>

      <View style={{ flex: 1 }} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 ? (
          <Animated.ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            onMomentumScrollEnd={(e) => {
              const p = Math.round(e.nativeEvent.contentOffset.x / width);
              pageRef.current = p;
              setPage(p);
            }}>
            {SLIDES.map((s, i) => (
              <View key={s.title} style={{ width, paddingHorizontal: 24 }}>
                <Animated.View entering={FadeIn.duration(400)}>
                  <Illustration index={i} x={x} width={width} />
                </Animated.View>
                <View style={{ marginTop: 32, gap: 12 }}>
                  <Txt variant="h1" accessibilityRole="header" style={{ fontSize: 32, lineHeight: 37 }}>
                    {s.title}
                  </Txt>
                  <Txt variant="body" color={colors.muted}>
                    {s.body}
                  </Txt>
                </View>
              </View>
            ))}
          </Animated.ScrollView>
        ) : null}
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {SLIDES.map((s, i) => (
            <Dot key={s.title} i={i} x={x} width={width} />
          ))}
        </View>
        <PressableScale accessibilityRole="button" accessibilityLabel={page === SLIDES.length - 1 ? 'Get started' : 'Next'} onPress={next} style={[styles.next, shadow.button]}>
          <Txt variant="subtitle" color={colors.onDark} style={{ fontSize: 17 }}>
            {page === SLIDES.length - 1 ? 'Get started' : 'Next'}
          </Txt>
          <Icon name="arrowRight" size={20} color={colors.onDark} strokeWidth={2.2} />
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  topRow: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24 },
  skip: { height: 44, justifyContent: 'center', paddingHorizontal: 8 },
  art: { marginTop: 16, height: 392, borderRadius: 32, backgroundColor: colors.mint, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  artCircle: { position: 'absolute', width: 290, height: 290, borderRadius: 145, backgroundColor: '#D2EEDD' },
  dot: { position: 'absolute', borderRadius: 999 },
  centerCard: { width: 200, padding: 20, borderRadius: 28, backgroundColor: colors.surface, alignItems: 'center', gap: 12 },
  listCard: { width: 280, padding: 18, borderRadius: 28, backgroundColor: colors.surface, gap: 16 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingLeft: 10, paddingRight: 16, borderRadius: 20, backgroundColor: colors.surface },
  chipIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginTop: 16 },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  pageDot: { height: 8, borderRadius: 4 },
  next: { height: 56, paddingHorizontal: 28, borderRadius: radius.xxl, backgroundColor: colors.emerald, flexDirection: 'row', alignItems: 'center', gap: 8 },
});
