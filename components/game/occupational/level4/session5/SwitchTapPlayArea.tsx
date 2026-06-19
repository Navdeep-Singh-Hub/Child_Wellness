/**
 * Relay switch track for Switch Tap (OT L4 S5 Game 1).
 */
import { SWITCH_TAP_THEME as T } from '@/components/game/occupational/level4/session5/session5Theme';
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
  switchKey: number;
};

export const SwitchTapPlayArea: React.FC<Props> = ({
  roundActive,
  showGuide,
  activeHand,
  stepDisplay,
  stepsTotal,
  switchKey,
}) => {
  const arrowPulse = useSharedValue(0.4);
  const guideScale = useSharedValue(1);
  const burst = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    arrowPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.35, { duration: 600, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [roundActive, arrowPulse]);

  useEffect(() => {
    arrowPulse.value = withSequence(withSpring(1.2, { damping: 6 }), withTiming(0.4, { duration: 400 }));
  }, [activeHand, arrowPulse]);

  useEffect(() => {
    if (!switchKey) return;
    burst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 200 }),
      withTiming(0, { duration: 450 }),
    );
  }, [switchKey, burst]);

  useEffect(() => {
    if (!showGuide || !roundActive) {
      guideScale.value = 1;
      return;
    }
    guideScale.value = withRepeat(
      withSequence(withTiming(1.1, { duration: 500 }), withTiming(1, { duration: 500 })),
      -1,
      true,
    );
  }, [showGuide, roundActive, guideScale]);

  const arrowStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + arrowPulse.value * 0.55,
    transform: [{ scale: 0.9 + arrowPulse.value * 0.15 }],
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: burst.value,
    transform: [{ scale: 0.85 + burst.value * 0.3 }],
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={[T.trackDark, '#1E1B4B', '#312E81']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.relayTrack} />
      <View style={[styles.laneMarker, styles.leftLane, activeHand === 'left' && styles.laneActive]} />
      <View style={[styles.laneMarker, styles.rightLane, activeHand === 'right' && styles.laneActive]} />

      <Animated.View style={[styles.switchArrow, arrowStyle]}>
        <Text style={styles.switchArrowText}>
          {activeHand === 'left' ? '👈 NEXT' : '👉 NEXT'}
        </Text>
      </Animated.View>

      <View style={styles.stepDots}>
        {Array.from({ length: stepsTotal }).map((_, i) => (
          <View
            key={`dot-${i}`}
            style={[styles.stepDot, i < stepDisplay - 1 && styles.stepDotDone, i === stepDisplay - 1 && styles.stepDotCurrent]}
          />
        ))}
      </View>

      <Animated.View style={[styles.switchBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.switchBurstText}>↔️ SWITCH!</Text>
      </Animated.View>

      <Animated.View style={[styles.guideBadge, guideStyle]}>
        <Text style={styles.guideText}>👈 → 👉 Alternate!</Text>
      </Animated.View>

      <View style={styles.trackLabel}>
        <Text style={styles.trackLabelText}>RELAY SWITCH</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  relayTrack: {
    position: 'absolute',
    alignSelf: 'center',
    top: '48%',
    width: '72%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(129,140,248,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(129,140,248,0.35)',
  },
  laneMarker: {
    position: 'absolute',
    top: '42%',
    width: '20%',
    height: '18%',
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'rgba(15,23,42,0.5)',
  },
  leftLane: { left: '10%', borderColor: 'rgba(59,130,246,0.3)' },
  rightLane: { right: '10%', borderColor: 'rgba(244,63,94,0.3)' },
  laneActive: {
    backgroundColor: 'rgba(129,140,248,0.15)',
    borderColor: T.switchGlow,
  },
  switchArrow: {
    position: 'absolute',
    alignSelf: 'center',
    top: '28%',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderWidth: 1,
    borderColor: T.switchGlow,
  },
  switchArrowText: { fontSize: 16, fontWeight: '900', color: T.accentDark },
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
    backgroundColor: 'rgba(129,140,248,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(129,140,248,0.35)',
  },
  stepDotDone: { backgroundColor: T.accentBlue },
  stepDotCurrent: { backgroundColor: T.switchGlow, transform: [{ scale: 1.2 }] },
  switchBurst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '36%',
  },
  switchBurstText: { fontSize: 20, fontWeight: '900', color: T.switchGlow },
  guideBadge: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: '28%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(15,23,42,0.88)',
    borderWidth: 1,
    borderColor: T.switchGlow,
  },
  guideText: { fontSize: 14, fontWeight: '900', color: T.accentDark },
  trackLabel: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(129,140,248,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(129,140,248,0.35)',
  },
  trackLabelText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: T.switchGlow,
  },
});
