/**
 * Red archery lane for Aim Pass (OT L4 S6 Game 3).
 */
import { AIM_PASS_THEME as T } from '@/components/game/occupational/level4/session6/session6Theme';
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
  midlineCrossed: boolean;
  aimKey: number;
};

export const AimPassPlayArea: React.FC<Props> = ({ roundActive, showGuide, midlineCrossed, aimKey }) => {
  const lanePulse = useSharedValue(0.35);
  const bullseyePulse = useSharedValue(0.4);
  const guideScale = useSharedValue(1);
  const hitBurst = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    lanePulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.3, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    bullseyePulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 500 }), withTiming(0.45, { duration: 500 })),
      -1,
      true,
    );
  }, [roundActive, bullseyePulse, lanePulse]);

  useEffect(() => {
    if (!aimKey) return;
    hitBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 220 }),
      withTiming(0, { duration: 450 }),
    );
  }, [aimKey, hitBurst]);

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
    opacity: 0.2 + lanePulse.value * 0.35,
  }));
  const bullStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + bullseyePulse.value * 0.45,
    transform: [{ scale: 0.95 + bullseyePulse.value * 0.08 }],
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: hitBurst.value,
    transform: [{ scale: 0.85 + hitBurst.value * 0.35 }],
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={[T.laneDark, '#7F1D1D', '#991B1B']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.laneTrack, laneStyle]} />
      <View style={styles.laneDashes}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={`dash-${i}`} style={[styles.laneDash, { left: `${12 + i * 18}%` }]} />
        ))}
      </View>

      <View style={[styles.midlineGlow, midlineCrossed && styles.midlineCrossed]} />

      <Animated.View style={[styles.bullseyeRings, bullStyle]} pointerEvents="none">
        <View style={styles.ringOuter} />
        <View style={styles.ringMid} />
        <View style={styles.ringInner} />
      </Animated.View>

      <View style={[styles.phaseCue, midlineCrossed && styles.phaseCueAim]}>
        <Text style={styles.phaseCueText}>
          {midlineCrossed ? '🎯 AIM FOR BULLSEYE!' : '↔ CROSS MIDLINE'}
        </Text>
      </View>

      <Animated.View style={[styles.hitBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.hitBurstText}>🎯 BULLSEYE!</Text>
      </Animated.View>

      <Animated.View style={[styles.guideBadge, guideStyle]}>
        <Text style={styles.guideText}>Drag across — hit the bullseye!</Text>
      </Animated.View>

      <View style={styles.laneLabel}>
        <Text style={styles.laneLabelText}>ARCHERY LANE</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  laneTrack: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    top: '58%',
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(239,68,68,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
  },
  laneDashes: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    top: '61%',
    height: 2,
  },
  laneDash: {
    position: 'absolute',
    width: '8%',
    height: 2,
    backgroundColor: 'rgba(254,202,202,0.25)',
    borderRadius: 1,
  },
  midlineGlow: {
    position: 'absolute',
    alignSelf: 'center',
    top: '12%',
    bottom: '12%',
    width: 4,
    borderRadius: 2,
    backgroundColor: T.midlineColor,
    opacity: 0.5,
  },
  midlineCrossed: {
    backgroundColor: T.bullseyeGlow,
    shadowColor: T.bullseyeGlow,
    shadowOpacity: 0.7,
    shadowRadius: 12,
    opacity: 1,
  },
  bullseyeRings: {
    position: 'absolute',
    right: '12%',
    top: '52%',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuter: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(251,191,36,0.35)',
  },
  ringMid: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: 'rgba(239,68,68,0.45)',
  },
  ringInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: T.bullseyeGlow,
  },
  phaseCue: {
    position: 'absolute',
    alignSelf: 'center',
    top: '14%',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(69,10,10,0.88)',
    borderWidth: 1,
    borderColor: T.accent,
  },
  phaseCueAim: { borderColor: T.bullseyeGlow },
  phaseCueText: { fontSize: 13, fontWeight: '900', color: T.accentDark },
  hitBurst: { position: 'absolute', alignSelf: 'center', top: '42%' },
  hitBurstText: { fontSize: 22, fontWeight: '900', color: T.bullseyeGlow },
  guideBadge: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: '22%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(69,10,10,0.88)',
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
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
  },
  laneLabelText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: T.accent,
  },
});
