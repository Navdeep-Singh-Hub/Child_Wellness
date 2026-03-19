import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, View } from 'react-native';

type MotionBackgroundProps = {
  /**
   * Subtle animated background behind games.
   * Keep sensory-friendly: low-contrast, slow motion, auto-disables for Reduce Motion.
   */
  variant?: 'indigo' | 'mint' | 'sunset' | 'ocean';
};

const VARIANTS: Record<NonNullable<MotionBackgroundProps['variant']>, { colors: string[]; blobs: string[] }> = {
  indigo: {
    colors: ['#EEF2FF', '#F3F4F6', '#ECFEFF'],
    blobs: ['rgba(79,70,229,0.18)', 'rgba(34,197,94,0.12)', 'rgba(250,204,21,0.10)'],
  },
  mint: {
    colors: ['#ECFDF5', '#F3F4F6', '#EFF6FF'],
    blobs: ['rgba(34,197,94,0.16)', 'rgba(59,130,246,0.12)', 'rgba(79,70,229,0.10)'],
  },
  sunset: {
    colors: ['#FFF7ED', '#F3F4F6', '#FDF2F8'],
    blobs: ['rgba(244,114,182,0.14)', 'rgba(250,204,21,0.12)', 'rgba(79,70,229,0.10)'],
  },
  ocean: {
    colors: ['#ECFEFF', '#F3F4F6', '#EFF6FF'],
    blobs: ['rgba(56,189,248,0.14)', 'rgba(34,197,94,0.10)', 'rgba(79,70,229,0.10)'],
  },
};

export function MotionBackground({ variant = 'indigo' }: MotionBackgroundProps) {
  const palette = VARIANTS[variant];
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => mounted && setReduceMotion(!!v))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (v) => setReduceMotion(!!v));
    return () => {
      mounted = false;
      // RN web / older RN types can vary
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sub as any)?.remove?.();
    };
  }, []);

  const t1 = useRef(new Animated.Value(0)).current;
  const t2 = useRef(new Animated.Value(0)).current;
  const t3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) return;

    const loop = (v: Animated.Value, duration: number, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(v, { toValue: 1, duration, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration, useNativeDriver: true }),
        ])
      );

    const a1 = loop(t1, 9000, 0);
    const a2 = loop(t2, 12000, 600);
    const a3 = loop(t3, 15000, 1200);
    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [reduceMotion, t1, t2, t3]);

  const blobs = useMemo(
    () => [
      {
        color: palette.blobs[0],
        size: 260,
        style: {
          top: -60,
          left: -70,
          transform: [
            {
              translateX: t1.interpolate({ inputRange: [0, 1], outputRange: [0, 34] }),
            },
            {
              translateY: t1.interpolate({ inputRange: [0, 1], outputRange: [0, 18] }),
            },
            { scale: t1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) },
          ],
        },
      },
      {
        color: palette.blobs[1],
        size: 220,
        style: {
          bottom: -70,
          right: -60,
          transform: [
            {
              translateX: t2.interpolate({ inputRange: [0, 1], outputRange: [0, -28] }),
            },
            {
              translateY: t2.interpolate({ inputRange: [0, 1], outputRange: [0, -16] }),
            },
            { scale: t2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) },
          ],
        },
      },
      {
        color: palette.blobs[2],
        size: 180,
        style: {
          top: 120,
          right: -40,
          transform: [
            {
              translateX: t3.interpolate({ inputRange: [0, 1], outputRange: [0, -22] }),
            },
            {
              translateY: t3.interpolate({ inputRange: [0, 1], outputRange: [0, 14] }),
            },
            { scale: t3.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) },
          ],
        },
      },
    ],
    [palette.blobs, t1, t2, t3]
  );

  return (
    <View pointerEvents="none" style={styles.root}>
      <LinearGradient colors={palette.colors} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={styles.noise} />
      {reduceMotion
        ? blobs.map((b, idx) => (
            <View
              key={idx}
              style={[
                styles.blob,
                { width: b.size, height: b.size, backgroundColor: b.color, opacity: 0.65 },
                b.style as any,
              ]}
            />
          ))
        : blobs.map((b, idx) => (
            <Animated.View
              key={idx}
              style={[
                styles.blob,
                { width: b.size, height: b.size, backgroundColor: b.color },
                b.style as any,
              ]}
            />
          ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.75,
  },
  // subtle grain (very light) to avoid flat look, still sensory-friendly
  noise: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
    backgroundColor: '#000',
  },
});

