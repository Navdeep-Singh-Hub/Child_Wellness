/**
 * Tug-of-war arena backdrop for Tug Rope (OT L4 S9 Game 4).
 */
import { TUG_ROPE_THEME as T } from '@/components/game/occupational/level4/session9/session9Theme';
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
  tugKey: number;
  ropeY: number;
};

export const TugRopePlayArea: React.FC<Props> = ({ roundActive, showGuide, tugKey, ropeY }) => {
  const tensionPulse = useSharedValue(0.2);
  const guideScale = useSharedValue(1);
  const tugBurst = useSharedValue(0);
  const leftPull = useSharedValue(0);
  const rightPull = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    tensionPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.15, { duration: 600, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    leftPull.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0.2, { duration: 200 })),
      -1,
      false,
    );
    rightPull.value = withRepeat(
      withSequence(withTiming(0.2, { duration: 200 }), withTiming(1, { duration: 700 })),
      -1,
      false,
    );
  }, [roundActive, leftPull, rightPull, tensionPulse]);

  useEffect(() => {
    if (!tugKey) return;
    tugBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 200 }),
      withTiming(0, { duration: 450 }),
    );
  }, [tugKey, tugBurst]);

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

  const tensionStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + tensionPulse.value * 0.55,
    transform: [{ scaleX: 0.92 + tensionPulse.value * 0.08 }],
  }));
  const leftArrowStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + leftPull.value * 0.6,
    transform: [{ translateX: -leftPull.value * 6 }],
  }));
  const rightArrowStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + rightPull.value * 0.6,
    transform: [{ translateX: rightPull.value * 6 }],
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: tugBurst.value,
    transform: [{ scale: 0.85 + tugBurst.value * 0.35 }],
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={['#422006', '#78350F', '#422006']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.centerLine, { top: ropeY - 1 }]} />

      <Animated.View style={[styles.tensionGlow, { top: ropeY - 8 }, tensionStyle]} />

      <Animated.View style={[styles.leftArrow, leftArrowStyle]}>
        <Text style={styles.arrowText}>← PULL</Text>
      </Animated.View>
      <Animated.View style={[styles.rightArrow, rightArrowStyle]}>
        <Text style={styles.arrowText}>PULL →</Text>
      </Animated.View>

      <View style={styles.arenaBadge}>
        <Text style={styles.arenaText}>🪢 TUG ARENA</Text>
      </View>

      <Animated.View style={[styles.tugGuide, guideStyle]} pointerEvents="none">
        <Text style={styles.guideText}>🪢 PULL BOTH OUTWARD!</Text>
        <Text style={styles.guideSub}>Left and right at the same time</Text>
      </Animated.View>

      <Animated.View style={[styles.tugBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.burstText}>✦ TUG! ✦</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  centerLine: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    height: 2,
    backgroundColor: 'rgba(251,191,36,0.35)',
  },
  tensionGlow: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    height: 16,
    borderRadius: 8,
    backgroundColor: T.ropeGlow,
  },
  leftArrow: {
    position: 'absolute',
    left: '8%',
    top: '28%',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(66,32,6,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.4)',
  },
  rightArrow: {
    position: 'absolute',
    right: '8%',
    top: '28%',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(66,32,6,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
  },
  arrowText: { fontSize: 11, fontWeight: '900', color: T.accentDark, letterSpacing: 0.5 },
  arenaBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '12%',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(66,32,6,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.4)',
  },
  arenaText: { fontSize: 11, fontWeight: '900', color: T.accentDark, letterSpacing: 0.5 },
  tugGuide: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 24,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(66,32,6,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.45)',
  },
  guideText: { fontSize: 15, fontWeight: '900', color: '#FFFBEB' },
  guideSub: { fontSize: 11, fontWeight: '700', color: T.subtitleColor, marginTop: 2 },
  tugBurst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '48%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(251,191,36,0.35)',
  },
  burstText: { fontSize: 16, fontWeight: '900', color: '#FFFBEB', letterSpacing: 1 },
});
