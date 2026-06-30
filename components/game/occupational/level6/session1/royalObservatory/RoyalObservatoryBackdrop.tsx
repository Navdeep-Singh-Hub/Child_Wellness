/**
 * Royal Observatory — twilight dome, star field, telescope silhouette.
 */
import { RO } from './royalObservatoryTokens';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type Props = { reduceMotion?: boolean; steady?: boolean };

const STAR_POS = [
  [0.12, 0.14], [0.28, 0.08], [0.55, 0.11], [0.72, 0.06], [0.88, 0.15],
  [0.18, 0.28], [0.42, 0.22], [0.65, 0.26], [0.82, 0.32],
];

export function RoyalObservatoryBackdrop({ reduceMotion = false, steady = true }: Props) {
  const twinkle = useSharedValue(0);
  const domeGlow = useSharedValue(0);
  const drift = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      twinkle.value = 0.5;
      domeGlow.value = steady ? 0.6 : 0.35;
      return;
    }
    twinkle.value = withRepeat(
      withSequence(withTiming(1, { duration: 1400 }), withTiming(0.2, { duration: 1400 })),
      -1,
      true,
    );
    domeGlow.value = withRepeat(
      withTiming(1, { duration: steady ? 2200 : 900, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    drift.value = withRepeat(withTiming(1, { duration: 12000, easing: Easing.linear }), -1, false);
  }, [reduceMotion, steady, twinkle, domeGlow, drift]);

  const domeStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + domeGlow.value * (steady ? 0.2 : 0.35),
    transform: [{ scale: 1 + domeGlow.value * 0.04 }],
  }));

  const curtainStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + twinkle.value * 0.15,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...RO.bg]} style={StyleSheet.absoluteFillObject} />
      {/* Velvet curtains */}
      <Animated.View style={[styles.curtainL, curtainStyle]} />
      <Animated.View style={[styles.curtainR, curtainStyle]} />
      {/* Observatory dome */}
      <Animated.View style={[styles.dome, domeStyle]}>
        <View style={styles.domeInner} />
      </Animated.View>
      {/* Telescope */}
      <View style={styles.telescope}>
        <View style={styles.tube} />
        <View style={styles.tripod} />
      </View>
      {/* Stars */}
      {STAR_POS.map(([lx, ty], i) => (
        <TwinkleStar key={i} left={lx} top={ty} reduceMotion={reduceMotion} delay={i * 200} />
      ))}
      {!reduceMotion && (
        <>
          <Text style={[styles.moon, { top: '9%', right: '14%' }]}>🌙</Text>
          <Text style={[styles.spark, { top: '20%', left: '6%' }]}>✨</Text>
        </>
      )}
      <LinearGradient colors={['transparent', 'rgba(15,5,32,0.5)']} style={styles.vignette} />
    </View>
  );
}

function TwinkleStar({ left, top, reduceMotion, delay }: { left: number; top: number; reduceMotion: boolean; delay: number }) {
  const op = useSharedValue(0.4);
  useEffect(() => {
    if (reduceMotion) return;
    const t = setTimeout(() => {
      op.value = withRepeat(withSequence(withTiming(1, { duration: 800 }), withTiming(0.25, { duration: 800 })), -1, true);
    }, delay);
    return () => clearTimeout(t);
  }, [reduceMotion, delay, op]);
  const style = useAnimatedStyle(() => ({ opacity: reduceMotion ? 0.5 : op.value }));
  return (
    <Animated.View
      style={[styles.starDot, style, { left: `${left * 100}%`, top: `${top * 100}%` }]}
    />
  );
}

const styles = StyleSheet.create({
  curtainL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '18%',
    bottom: '25%',
    backgroundColor: 'rgba(88,28,135,0.45)',
    borderRightWidth: 1,
    borderColor: `${RO.accent}33`,
  },
  curtainR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '18%',
    bottom: '25%',
    backgroundColor: 'rgba(88,28,135,0.45)',
    borderLeftWidth: 1,
    borderColor: `${RO.accent}33`,
  },
  dome: {
    position: 'absolute',
    alignSelf: 'center',
    top: '4%',
    width: 120,
    height: 60,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    backgroundColor: RO.dome,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: `${RO.twilight}55`,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  domeInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${RO.roseGold}22`,
    marginBottom: -20,
    borderWidth: 1,
    borderColor: `${RO.roseGold}44`,
  },
  telescope: {
    position: 'absolute',
    bottom: '28%',
    right: '12%',
    alignItems: 'center',
  },
  tube: {
    width: 52,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(251,191,36,0.35)',
    transform: [{ rotate: '-28deg' }],
    borderWidth: 1,
    borderColor: `${RO.roseGold}66`,
  },
  tripod: {
    width: 2,
    height: 18,
    backgroundColor: `${RO.roseGold}55`,
    marginTop: 4,
  },
  starDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: RO.star,
  },
  moon: { position: 'absolute', fontSize: 22, opacity: 0.7 },
  spark: { position: 'absolute', fontSize: 16, opacity: 0.6 },
  vignette: { ...StyleSheet.absoluteFillObject },
});
