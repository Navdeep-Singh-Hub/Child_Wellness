import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from 'react-native';

type SuccessCelebrationProps = {
  title?: string;
  badgeEmoji?: string;
  subtitle?: string;
  variant?: 'indigo' | 'mint' | 'sunset' | 'ocean';
  children?: React.ReactNode;
};

const VARIANTS: Record<NonNullable<SuccessCelebrationProps['variant']>, { colors: string[]; ring: string }> = {
  indigo: { colors: ['#EEF2FF', '#DCFCE7', '#F3F4F6'], ring: 'rgba(79,70,229,0.20)' },
  mint: { colors: ['#ECFDF5', '#E0E7FF', '#F3F4F6'], ring: 'rgba(34,197,94,0.20)' },
  sunset: { colors: ['#FFF7ED', '#FDF2F8', '#F3F4F6'], ring: 'rgba(244,114,182,0.18)' },
  ocean: { colors: ['#ECFEFF', '#E0E7FF', '#F3F4F6'], ring: 'rgba(56,189,248,0.18)' },
};

export function SuccessCelebration({
  title = 'Great Job!',
  badgeEmoji = '⭐',
  subtitle = 'You did it!',
  variant = 'indigo',
  children,
}: SuccessCelebrationProps) {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sub as any)?.remove?.();
    };
  }, []);

  const pop = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  const confetti = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        key: `c${i}`,
        leftPct: (i * 9 + (i % 3) * 4) % 95,
        rot: (i % 2 === 0 ? 1 : -1) * (10 + (i % 5) * 6),
        color: i % 3 === 0 ? 'rgba(79,70,229,0.35)' : i % 3 === 1 ? 'rgba(34,197,94,0.30)' : 'rgba(250,204,21,0.28)',
        delay: i * 90,
      })),
    []
  );

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    pop.setValue(0);
    shimmer.setValue(0);
    Animated.spring(pop, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 10 }).start();
    if (reduceMotion) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ])
    ).start();
  }, [pop, shimmer, reduceMotion]);

  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] });
  const glow = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.35] });

  return (
    <View style={styles.root}>
      <LinearGradient colors={palette.colors} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={StyleSheet.absoluteFill} />
      {!reduceMotion ? (
        <View pointerEvents="none" style={styles.confettiLayer}>
          {confetti.map((c) => {
            const y = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-40, 520] });
            return (
              <Animated.View
                key={c.key}
                style={[
                  styles.confetti,
                  {
                    left: `${c.leftPct}%`,
                    backgroundColor: c.color,
                    transform: [{ translateY: y }, { rotate: `${c.rot}deg` }],
                    opacity: glow,
                  },
                ]}
              />
            );
          })}
        </View>
      ) : null}

      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <View style={[styles.ring, { borderColor: palette.ring }]} />
        <View style={styles.badge}>
          <Text style={styles.badgeEmoji}>{badgeEmoji}</Text>
        </View>
        {children ? <View style={styles.extra}>{children}</View> : null}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  confettiLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 22,
    borderRadius: 4,
    top: 0,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(79,70,229,0.16)',
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#111827',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 5,
    overflow: 'hidden',
  },
  ring: {
    position: 'absolute',
    width: 520,
    height: 520,
    borderRadius: 999,
    borderWidth: 24,
    top: -360,
    opacity: 0.75,
  },
  badge: {
    width: 86,
    height: 86,
    borderRadius: 999,
    backgroundColor: '#DCFCE7',
    borderWidth: 3,
    borderColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  badgeEmoji: {
    fontSize: 40,
  },
  extra: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#3730A3',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 18,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 26,
  },
});

