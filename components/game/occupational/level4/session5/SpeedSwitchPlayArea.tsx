/**
 * Neon turbo lane for Speed Switch (OT L4 S5 Game 5).
 */
import { SPEED_SWITCH_THEME as T } from '@/components/game/occupational/level4/session5/session5Theme';
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

type Hand = 'left' | 'right';

type Props = {
  roundActive: boolean;
  showGuide: boolean;
  activeHand: Hand;
  stepDisplay: number;
  stepsTotal: number;
  speedKey: number;
  speedLabel: string;
  speedPct: number;
};

export const SpeedSwitchPlayArea: React.FC<Props> = ({
  roundActive,
  showGuide,
  activeHand,
  stepDisplay,
  stepsTotal,
  speedKey,
  speedLabel,
  speedPct,
}) => {
  const streakPulse = useSharedValue(0.2);
  const guideScale = useSharedValue(1);
  const zoomBurst = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    streakPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 320 - speedPct * 140, easing: Easing.linear }),
        withTiming(0.15, { duration: 80 }),
      ),
      -1,
      false,
    );
  }, [roundActive, speedPct, streakPulse]);

  useEffect(() => {
    if (!speedKey) return;
    zoomBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 220 }),
      withTiming(0, { duration: 400 }),
    );
  }, [speedKey, zoomBurst]);

  useEffect(() => {
    if (!showGuide || !roundActive) {
      guideScale.value = 1;
      return;
    }
    guideScale.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 420 }), withTiming(1, { duration: 420 })),
      -1,
      true,
    );
  }, [showGuide, roundActive, guideScale]);

  const streakStyle = useAnimatedStyle(() => ({
    opacity: 0.12 + streakPulse.value * 0.28,
    transform: [{ translateX: -20 + streakPulse.value * 40 }],
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: zoomBurst.value,
    transform: [{ scale: 0.85 + zoomBurst.value * 0.35 }],
  }));

  const meterPct = Math.min(100, Math.max(8, speedPct * 100));
  const laneColor = speedPct < 0.34 ? T.accentCyan : speedPct < 0.67 ? T.accent : T.accentMagenta;

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={[T.laneDark, '#312E81', '#4C1D95']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.streakLayer, streakStyle]}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <View
            key={`streak-${i}`}
            style={[
              styles.streak,
              {
                top: `${18 + (i % 4) * 18}%`,
                left: `${6 + i * 12}%`,
                width: 36 + (i % 3) * 18,
                opacity: 0.06 + (i % 2) * 0.05,
              },
            ]}
          />
        ))}
      </Animated.View>

      <View style={styles.laneEdges}>
        <View style={[styles.laneEdge, { borderColor: laneColor }]} />
        <View style={[styles.laneEdge, styles.laneEdgeRight, { borderColor: laneColor }]} />
      </View>

      <View style={styles.speedMeter}>
        <Text style={styles.speedMeterLabel}>TURBO</Text>
        <View style={styles.speedMeterTrack}>
          <View style={[styles.speedMeterFill, { width: `${meterPct}%`, backgroundColor: laneColor }]} />
        </View>
        <Text style={[styles.speedMeterTag, { color: laneColor }]}>{speedLabel}</Text>
      </View>

      <View style={styles.stepDots}>
        {Array.from({ length: stepsTotal }).map((_, i) => (
          <View
            key={`step-${i}`}
            style={[
              styles.stepDot,
              i < stepDisplay - 1 && styles.stepDotDone,
              i === stepDisplay - 1 && { backgroundColor: laneColor, transform: [{ scale: 1.15 }] },
            ]}
          />
        ))}
      </View>

      <View style={[styles.laneCue, { borderColor: laneColor }]}>
        <Text style={[styles.laneCueText, { color: laneColor }]}>
          {activeHand === 'left' ? '👈 LEFT LANE' : '👉 RIGHT LANE'}
        </Text>
      </View>

      <Animated.View style={[styles.zoomBurst, burstStyle]} pointerEvents="none">
        <Text style={[styles.zoomBurstText, { color: laneColor }]}>⚡ ZOOM!</Text>
      </Animated.View>

      <Animated.View style={[styles.guideBadge, guideStyle]}>
        <Text style={styles.guideText}>⚡ Alternate — speed up!</Text>
      </Animated.View>

      <View style={styles.laneLabel}>
        <Text style={styles.laneLabelText}>TURBO LANE</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  streakLayer: { ...StyleSheet.absoluteFillObject },
  streak: {
    position: 'absolute',
    height: 3,
    borderRadius: 2,
    backgroundColor: T.turboGlow,
  },
  laneEdges: {
    position: 'absolute',
    top: '28%',
    bottom: '28%',
    left: '8%',
    right: '8%',
  },
  laneEdge: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderLeftWidth: 2,
    opacity: 0.5,
  },
  laneEdgeRight: { left: undefined, right: 0, borderLeftWidth: 0, borderRightWidth: 2 },
  speedMeter: {
    position: 'absolute',
    alignSelf: 'center',
    top: '12%',
    width: '72%',
    alignItems: 'center',
  },
  speedMeterLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: T.accentDark,
    marginBottom: 4,
  },
  speedMeterTrack: {
    width: '100%',
    height: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(15,23,42,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.35)',
    overflow: 'hidden',
  },
  speedMeterFill: { height: '100%', borderRadius: 6 },
  speedMeterTag: { fontSize: 12, fontWeight: '900', marginTop: 4, letterSpacing: 1 },
  stepDots: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: '20%',
    flexDirection: 'row',
    gap: 8,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(139,92,246,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.35)',
  },
  stepDotDone: { backgroundColor: T.turboGlow },
  laneCue: {
    position: 'absolute',
    alignSelf: 'center',
    top: '36%',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(30,27,75,0.85)',
    borderWidth: 1,
  },
  laneCueText: { fontSize: 13, fontWeight: '900' },
  zoomBurst: { position: 'absolute', alignSelf: 'center', top: '48%' },
  zoomBurstText: { fontSize: 22, fontWeight: '900' },
  guideBadge: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: '26%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(30,27,75,0.88)',
    borderWidth: 1,
    borderColor: T.accent,
  },
  guideText: { fontSize: 14, fontWeight: '900', color: T.accentDark },
  laneLabel: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.35)',
  },
  laneLabelText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: T.accent,
  },
});
