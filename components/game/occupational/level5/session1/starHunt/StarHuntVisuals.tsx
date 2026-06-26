/** Star Hunt — cosmic night visual layer */
import { COSMOS, STAR_HUNT_COPY as COPY, STAR_HUNT_THEME as T } from '@/components/game/occupational/level5/session1/starHunt/starHuntTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const SKY_STARS = Array.from({ length: 48 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 7) % 96}%`,
  top: `${(i * 23 + 5) % 78}%`,
  size: 1 + (i % 3),
  delay: (i * 137) % 900,
}));

const CONSTELLATIONS = [
  { x: '18%', y: '22%', chars: ['✦', '·', '✦'] },
  { x: '72%', y: '18%', chars: ['✦', '·', '·', '✦'] },
  { x: '58%', y: '68%', chars: ['✦', '·', '✦'] },
] as const;

export function NightSkyBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.nebulaA} />
      <View style={styles.nebulaB} />
      <View style={styles.moon} />
      {SKY_STARS.map((s) => (
        <TwinkleStar key={s.id} left={s.left} top={s.top} size={s.size} delay={s.delay} />
      ))}
      {CONSTELLATIONS.map((c, i) => (
        <View key={i} style={[styles.constellation, { left: c.x, top: c.y }]}>
          {c.chars.map((ch, j) => (
            <Text key={j} style={styles.constChar}>
              {ch}
            </Text>
          ))}
        </View>
      ))}
      <View style={styles.horizonGlow} />
    </View>
  );
}

function TwinkleStar({ left, top, size, delay }: { left: string; top: string; size: number; delay: number }) {
  const tw = useSharedValue(0);
  useEffect(() => {
    const t = setTimeout(() => {
      tw.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1200 + delay, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1200 + delay, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
    }, delay);
    return () => clearTimeout(t);
  }, [delay, tw]);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(tw.value, [0, 1], [0.2, 0.95]),
    transform: [{ scale: interpolate(tw.value, [0, 1], [0.8, 1.3]) }],
  }));

  return (
    <Animated.View
      style={[styles.skyStar, { left, top, width: size, height: size, borderRadius: size / 2 }, style]}
    />
  );
}

export function CosmicIntroBackdrop() {
  return (
    <>
      <NightSkyBackdrop />
      <View style={styles.introVeil} />
    </>
  );
}

export function CometStar({ x, y, size, scaleStyle }: { x: number; y: number; size: number; scaleStyle: object }) {
  const spin = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(withTiming(1, { duration: 4000, easing: Easing.linear }), -1, false);
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [pulse, spin]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.2]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.4, 0.9]),
  }));

  const tailStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.55, 0.85]),
    transform: [{ rotate: `${interpolate(spin.value, [0, 1], [0, 360])}deg` }],
  }));

  const half = size / 2;
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.cometWrap, { left: x - half, top: y - half, width: size, height: size }, scaleStyle]}
    >
      <Animated.View style={[styles.cometTail, tailStyle]} />
      <Animated.View style={[styles.cometRing, { width: size + 20, height: size + 20, borderRadius: (size + 20) / 2 }, ringStyle]} />
      <LinearGradient colors={['#FEF08A', COSMOS.cometCore, '#F59E0B']} style={[styles.cometBody, { width: size, height: size, borderRadius: half }]}>
        <Text style={styles.cometEmoji}>⭐</Text>
        <View style={styles.cometBadge}>
          <Text style={styles.cometBadgeText}>CATCH</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

export function HuntToast({ text, visible }: { text: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <View style={styles.toastWrap} pointerEvents="none">
      <LinearGradient colors={['rgba(255,255,255,0.95)', 'rgba(254,243,199,0.9)']} style={styles.toastGrad}>
        <Text style={styles.toastText}>{text}</Text>
      </LinearGradient>
    </View>
  );
}

export function StreakHint() {
  return (
    <View style={styles.streakHint} pointerEvents="none">
      <Text style={styles.streakText}>✦ Tap the glowing comet ✦</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  nebulaA: {
    position: 'absolute',
    top: '12%',
    left: '-10%',
    width: '55%',
    height: '35%',
    borderRadius: 200,
    backgroundColor: COSMOS.nebula,
  },
  nebulaB: {
    position: 'absolute',
    bottom: '20%',
    right: '-8%',
    width: '48%',
    height: '30%',
    borderRadius: 180,
    backgroundColor: 'rgba(99,102,241,0.15)',
  },
  moon: {
    position: 'absolute',
    top: '8%',
    right: '12%',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COSMOS.moonGlow,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  skyStar: { position: 'absolute', backgroundColor: COSMOS.starBright },
  constellation: { position: 'absolute', flexDirection: 'row', gap: 6, opacity: 0.45 },
  constChar: { color: COSMOS.starBright, fontSize: 12 },
  horizonGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(129,140,248,0.12)',
  },
  introVeil: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11,16,38,0.15)' },
  cometWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  cometTail: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: COSMOS.cometTail,
    borderStyle: 'dashed',
  },
  cometRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: COSMOS.cometRing,
    backgroundColor: 'rgba(251,191,36,0.08)',
  },
  cometBody: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: T.accent,
    shadowOpacity: 0.65,
    shadowRadius: 16,
    elevation: 10,
  },
  cometEmoji: { fontSize: 30 },
  cometBadge: {
    position: 'absolute',
    bottom: -7,
    backgroundColor: '#B45309',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  cometBadgeText: { fontSize: 7, fontWeight: '900', color: '#FFFBEB', letterSpacing: 0.8 },
  toastWrap: { position: 'absolute', top: '36%', alignSelf: 'center', left: 0, right: 0, alignItems: 'center', zIndex: 25 },
  toastGrad: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.45)',
  },
  toastText: { fontSize: 15, fontWeight: '900', color: COPY.rootBg },
  streakHint: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 4,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(254,240,138,0.7)',
    letterSpacing: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
});
