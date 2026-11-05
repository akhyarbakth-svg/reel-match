import { useEffect } from 'react';
import { Easing, useSharedValue, withSpring, withTiming, type WithSpringConfig } from 'react-native-reanimated';

import { springs } from '@/theme';

/** A shared value that springs to `target` whenever it changes. */
export function useSpringValue(target: number, config: WithSpringConfig = springs.snappy) {
  const sv = useSharedValue(target);
  useEffect(() => {
    sv.value = withSpring(target, config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return sv;
}

/** A shared value that eases to `target` whenever it changes, starting from `from` on mount. */
export function useTimingValue(target: number, duration = 220, from = target) {
  const sv = useSharedValue(from);
  useEffect(() => {
    sv.value = withTiming(target, { duration, easing: Easing.out(Easing.cubic) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return sv;
}
