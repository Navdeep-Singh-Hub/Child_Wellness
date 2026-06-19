/**
 * Lightning arena backdrop for Quick Switch (OT L4 S8 Game 5).
 */
import { QUICK_SWITCH_THEME as T } from '@/components/game/occupational/level4/session8/session8Theme';
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

type Side = 'left' | 'right';

type Props = {
  roundActive: boolean;
  showGuide: boolean;
  fastKey: number;
  activeSide: Side | null;
  round: number;
  totalRounds: number;
};

export const QuickSwitchPlayArea: React.FC<Props> = ({
  roundActive,
  showGuide,
  fastKey,
  activeSide,
  round,
  totalRounds,
}) => {
  const boltPulse = useSharedValue(0.15);
  const stormFlash = useSharedValue(0);
  const guideScale = useSharedValue(1);
  const switchBurst = useSharedValue(0);

  const speedPct = Math.round((round / totalRounds) * 100);

  useEffect(() => {
    if (!roundActive) return;
    boltPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 350, easing: Easing.out(Easing.quad) }),
        withTiming(0.1, { duration: 450, easing: Easing.in(Easing.quad) }),
      ),
      -1,
      false,
    );
    stormFlash.value = withRepeat(
      withSequence(withTiming(0.7, { duration: 60 }), withTiming(0, { duration: 350 })),
      -1,
      false,
    );
  }, [roundActive, boltPulse, stormFlash]);

  useEffect(() => {
    if (!fastKey) return;
    switchBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 220 }),
      withTiming(0, { duration: 400 }),
    );
  }, [fastKey, switchBurst]);

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
    opacity: 0.25 + boltPulse.value * 0.7,
    transform: [{ scale: 0.85 + boltPulse.value * 0.2 }],
  }));
  const stormStyle = useAnimatedStyle(() => ({
    opacity: stormFlash.value * 0.2,
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: switchBurst.value,
    transform: [{ scale: 0.85 + switchBurst.value * 0.35 }],
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={['#1C1917', '#422006', '#1C1917']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.stormFlash, stormStyle]} pointerEvents="none" />

      <Animated.View style={[styles.leftBolt, boltStyle, activeSide === 'left' && styles.boltHot]}>
        <Text style={styles.boltEmoji}>⚡</Text>
      </Animated.View>
      <Animated.View style={[styles.rightBolt, boltStyle, activeSide === 'right' && styles.boltHot]}>
        <Text style={styles.boltEmoji}>⚡</Text>
      </Animated.View>

      <View style={styles.speedBox}>
        <Text style={styles.speedLabel}>SPEED</Text>
        <View style={styles.speedTrack}>
          <View style={[styles.speedFill, { width: `${speedPct}%` }]} />
        </View>
        <Text style={styles.speedPct}>{speedPct}%</Text>
      </View>

      <Animated.View style={[styles.switchGuide, guideStyle]} pointerEvents="none">
        <Text style={styles.guideText}>⚡ TAP THE FLASHING SIDE!</Text>
        <Text style={styles.guideSub}>Gets faster each round</Text>
      </Animated.View>

      <Animated.View style={[styles.switchBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.burstText}>⚡ SWITCH! ⚡</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  stormFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FBBF24',
  },
  leftBolt: {
    position: 'absolute',
    left: '8%',
    top: '20%',
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(66,32,6,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
  },
  rightBolt: {
    position: 'absolute',
    right: '8%',
    top: '20%',
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(66,32,6,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
  },
  boltHot: {
    borderColor: '#FBBF24',
    borderWidth: 2,
    backgroundColor: 'rgba(251,191,36,0.25)',
  },
  boltEmoji: { fontSize: 22 },
  speedBox: {
    position: 'absolute',
    alignSelf: 'center',
    top: '14%',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(28,25,23,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.4)',
  },
  speedLabel: { fontSize: 9, fontWeight: '900', color: T.accentDark, letterSpacing: 1 },
  speedTrack: {
    width: 100,
    height: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(66,32,6,0.8)',
    marginTop: 4,
    overflow: 'hidden',
  },
  speedFill: { height: '100%', borderRadius: 4, backgroundColor: T.accent },
  speedPct: { fontSize: 10, fontWeight: '800', color: T.accent, marginTop: 3 },
  switchGuide: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 24,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(28,25,23,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.45)',
  },
  guideText: { fontSize: 14, fontWeight: '900', color: '#FFFBEB' },
  guideSub: { fontSize: 11, fontWeight: '700', color: T.subtitleColor, marginTop: 2 },
  switchBurst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '56%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(251,191,36,0.35)',
  },
  burstText: { fontSize: 16, fontWeight: '900', color: '#FFFBEB', letterSpacing: 1 },
});
