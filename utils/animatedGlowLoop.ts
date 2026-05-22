import { Animated, Easing } from 'react-native';

export type GlowLoopOptions = {
  min?: number;
  max?: number;
  duration?: number;
  useNativeDriver?: boolean;
};

export type GlowLoopHandle = {
  start: () => void;
  stop: () => void;
};

/** Avoid crashing when React Compiler freezes Animated.Value (immutable _value). */
function trySetAnimatedValue(value: Animated.Value, next: number) {
  try {
    value.setValue(next);
  } catch {
    // Timing animations still drive the value when setValue is blocked.
  }
}

/**
 * Safe repeating pulse — chained sequences, no Animated.loop / stopAnimation
 * (both can throw "Cannot add new property '_tracking'" on Android).
 */
export function createGlowLoop(
  animatedValue: Animated.Value,
  options: GlowLoopOptions = {},
): GlowLoopHandle {
  const min = options.min ?? 0.5;
  const max = options.max ?? 1;
  const duration = options.duration ?? 1500;
  const useNativeDriver = options.useNativeDriver ?? false;

  let active = false;
  let currentAnim: Animated.CompositeAnimation | null = null;

  const stop = () => {
    active = false;
    currentAnim?.stop();
    currentAnim = null;
  };

  const runPulse = () => {
    if (!active) return;

    currentAnim = Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: max,
        duration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver,
      }),
      Animated.timing(animatedValue, {
        toValue: min,
        duration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver,
      }),
    ]);

    currentAnim.start(({ finished }) => {
      currentAnim = null;
      if (finished && active) runPulse();
    });
  };

  const start = () => {
    stop();
    active = true;
    trySetAnimatedValue(animatedValue, min);
    runPulse();
  };

  return { start, stop };
}
