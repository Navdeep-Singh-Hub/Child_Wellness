/**
 * Lightning storm backdrop for Flash Cross (OT L4 S7 Game 5).
 */
import { FLASH_CROSS_THEME as T } from '@/components/game/occupational/level4/session7/flashCross/flashCrossTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  roundActive: boolean;
  showGuide: boolean;
  flashKey: number;
  showArrow: boolean;
};

export const FlashCrossPlayArea: React.FC<Props> = ({ roundActive, showGuide, flashKey, showArrow }) => {
  const boltPulse = useSharedValue(0.15);
  const stormFlash = useSharedValue(0);
  const guideScale = useSharedValue(1);
  const hitBurst = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    boltPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) }),
        withTiming(0.1, { duration: 600, easing: Easing.in(Easing.quad) }),
      ),
      -1,
      false,
    );
    stormFlash.value = withRepeat(
      withSequence(withTiming(0.8, { duration: 80 }), withTiming(0, { duration: 400 })),
      -1,
      false,
    );
  }, [roundActive, boltPulse, stormFlash]);

  useEffect(() => {
    if (!flashKey) return;
    hitBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 220 }),
      withTiming(0, { duration: 400 }),
    );
  }, [flashKey, hitBurst]);

  useEffect(() => {
    if (!showGuide || !roundActive) {
      guideScale.value = 1;
      return;
    }
    guideScale.value = withRepeat(
      withSequence(withTiming(1.1, { duration: 350 }), withTiming(1, { duration: 350 })),
      -1,
      true,
    );
  }, [showGuide, roundActive, guideScale]);

  const boltStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + boltPulse.value * 0.75,
    transform: [{ scale: 0.9 + boltPulse.value * 0.15 }],
  }));
  const stormStyle = useAnimatedStyle(() => ({
    opacity: stormFlash.value * 0.25,
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: hitBurst.value,
    transform: [{ scale: 0.85 + hitBurst.value * 0.4 }],
  }));
  const flashRingStyle = useAnimatedStyle(() => ({
    opacity: showArrow ? 0.35 + boltPulse.value * 0.45 : 0,
    transform: [{ scale: 0.95 + boltPulse.value * 0.08 }],
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={['#451A03', '#78350F', '#92400E']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.stormFlash, stormStyle]} />

      <Animated.View style={[styles.boltLeft, boltStyle]}>
        <Text style={styles.boltText}>⚡</Text>
      </Animated.View>
      <Animated.View style={[styles.boltRight, boltStyle]}>
        <Text style={styles.boltText}>⚡</Text>
      </Animated.View>

      <Animated.View style={[styles.flashRing, flashRingStyle]} />

      <View style={styles.reactZone}>
        <Text style={styles.reactLabel}>⚡ REACT ZONE</Text>
      </View>

      <Animated.View style={[styles.flashGuide, guideStyle]} pointerEvents="none">
        <Text style={styles.guideText}>⚡ FLASH → TAP</Text>
        <Text style={styles.guideSub}>Opposite hand, fast!</Text>
      </Animated.View>

      <Animated.View style={[styles.hitBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.burstText}>⚡ FLASH ⚡</Text>
      </Animated.View>

      <View style={styles.speedStreaks}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View key={i} style={[styles.streak, { opacity: 0.15 + (i % 3) * 0.12 }]} />
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  stormFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FEF3C7',
  },
  boltLeft: { position: 'absolute', left: '8%', top: '22%' },
  boltRight: { position: 'absolute', right: '8%', top: '28%' },
  boltText: { fontSize: 28, fontWeight: '900' },
  flashRing: {
    position: 'absolute',
    alignSelf: 'center',
    top: '32%',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: T.boltGlow,
  },
  reactZone: {
    position: 'absolute',
    alignSelf: 'center',
    top: '14%',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(69,26,3,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.4)',
  },
  reactLabel: { fontSize: 10, fontWeight: '900', color: T.accentDark, letterSpacing: 0.5 },
  flashGuide: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 130,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(69,26,3,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.45)',
  },
  guideText: { fontSize: 16, fontWeight: '900', color: '#FFFBEB' },
  guideSub: { fontSize: 11, fontWeight: '700', color: T.subtitleColor, marginTop: 2 },
  hitBurst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '40%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(251,191,36,0.4)',
  },
  burstText: { fontSize: 16, fontWeight: '900', color: '#FFFBEB', letterSpacing: 1 },
  speedStreaks: {
    position: 'absolute',
    bottom: 150,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  streak: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: T.accent,
  },
});
