/**
 * Nebula drift backdrop for Drift Tap (OT L4 S7 Game 3).
 */
import { DRIFT_TAP_THEME as T } from '@/components/game/occupational/level4/session7/driftTap/driftTapTheme';
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
  driftKey: number;
};

export const DriftTapPlayArea: React.FC<Props> = ({ roundActive, showGuide, driftKey }) => {
  const lanePulse = useSharedValue(0.2);
  const cometFlow = useSharedValue(0);
  const nebulaShift = useSharedValue(0);
  const guideScale = useSharedValue(1);
  const catchBurst = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    lanePulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.15, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    cometFlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 1200 }), withTiming(0, { duration: 80 })),
      -1,
      false,
    );
    nebulaShift.value = withRepeat(
      withSequence(withTiming(1, { duration: 2000 }), withTiming(0, { duration: 2000 })),
      -1,
      true,
    );
  }, [roundActive, cometFlow, lanePulse, nebulaShift]);

  useEffect(() => {
    if (!driftKey) return;
    catchBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 200 }),
      withTiming(0, { duration: 450 }),
    );
  }, [driftKey, catchBurst]);

  useEffect(() => {
    if (!showGuide || !roundActive) {
      guideScale.value = 1;
      return;
    }
    guideScale.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 500 }), withTiming(1, { duration: 500 })),
      -1,
      true,
    );
  }, [showGuide, roundActive, guideScale]);

  const laneStyle = useAnimatedStyle(() => ({
    opacity: 0.12 + lanePulse.value * 0.45,
    transform: [{ translateX: -40 + cometFlow.value * 80 }],
  }));
  const nebulaStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + nebulaShift.value * 0.35,
    transform: [{ scale: 0.95 + nebulaShift.value * 0.08 }],
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: catchBurst.value,
    transform: [{ scale: 0.85 + catchBurst.value * 0.35 }],
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={['#2E1065', '#4C1D95', '#6D28D9']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.nebulaGlow, nebulaStyle]} />

      <Animated.View style={[styles.driftLane, styles.laneTop, laneStyle]} />
      <Animated.View style={[styles.driftLane, styles.laneMid, laneStyle]} />
      <Animated.View style={[styles.driftLane, styles.laneBot, laneStyle]} />

      <View style={styles.trackZone}>
        <Text style={styles.trackLabel}>🌠 TRACK ZONE</Text>
      </View>

      <Animated.View style={[styles.cometLeft, laneStyle]}>
        <Text style={styles.cometText}>✦ · · · ➡️</Text>
      </Animated.View>
      <Animated.View style={[styles.cometRight, laneStyle]}>
        <Text style={styles.cometText}>⬅️ · · · ✦</Text>
      </Animated.View>

      <Animated.View style={[styles.driftGuide, guideStyle]} pointerEvents="none">
        <Text style={styles.guideText}>🌠 TRACK → TAP</Text>
        <Text style={styles.guideSub}>Catch before it drifts!</Text>
      </Animated.View>

      <Animated.View style={[styles.catchBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.burstText}>✦ CAUGHT ✦</Text>
      </Animated.View>

      <View style={styles.starDots}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.starDot,
              { left: `${8 + i * 11}%`, top: `${18 + (i % 4) * 14}%`, opacity: 0.2 + (i % 3) * 0.2 },
            ]}
          />
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  nebulaGlow: {
    position: 'absolute',
    alignSelf: 'center',
    top: '20%',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(196,181,253,0.12)',
  },
  driftLane: {
    position: 'absolute',
    left: '4%',
    right: '4%',
    height: 3,
    borderRadius: 2,
    backgroundColor: T.driftGlow,
  },
  laneTop: { top: '30%' },
  laneMid: { top: '46%', height: 4, backgroundColor: T.accent },
  laneBot: { top: '62%' },
  trackZone: {
    position: 'absolute',
    alignSelf: 'center',
    top: '14%',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(76,29,149,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.35)',
  },
  trackLabel: { fontSize: 10, fontWeight: '900', color: T.accentDark, letterSpacing: 0.5 },
  cometLeft: { position: 'absolute', left: '6%', top: '38%' },
  cometRight: { position: 'absolute', right: '6%', top: '54%' },
  cometText: { fontSize: 13, fontWeight: '800', color: T.accentDark, letterSpacing: 1 },
  driftGuide: {
    position: 'absolute',
    alignSelf: 'center',
    top: '72%',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(46,16,101,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.45)',
  },
  guideText: { fontSize: 16, fontWeight: '900', color: '#F5F3FF' },
  guideSub: { fontSize: 11, fontWeight: '700', color: T.subtitleColor, marginTop: 2 },
  catchBurst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '42%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(167,139,250,0.35)',
  },
  burstText: { fontSize: 16, fontWeight: '900', color: '#F5F3FF', letterSpacing: 1 },
  starDots: { ...StyleSheet.absoluteFillObject },
  starDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.accent,
  },
});
