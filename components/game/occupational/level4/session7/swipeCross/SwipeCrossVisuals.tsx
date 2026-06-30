/**
 * Wind tunnel backdrop for Swipe Cross (OT L4 S7 Game 2).
 */
import { SWIPE_CROSS_THEME as T } from '@/components/game/occupational/level4/session7/swipeCross/swipeCrossTheme';
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
  swipeKey: number;
};

export const SwipeCrossPlayArea: React.FC<Props> = ({ roundActive, showGuide, swipeKey }) => {
  const streakPulse = useSharedValue(0.25);
  const arcFlow = useSharedValue(0);
  const guideScale = useSharedValue(1);
  const swipeBurst = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    streakPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.2, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    arcFlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 150 })),
      -1,
      false,
    );
  }, [roundActive, arcFlow, streakPulse]);

  useEffect(() => {
    if (!swipeKey) return;
    swipeBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 200 }),
      withTiming(0, { duration: 450 }),
    );
  }, [swipeKey, swipeBurst]);

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

  const streakStyle = useAnimatedStyle(() => ({
    opacity: 0.15 + streakPulse.value * 0.55,
    transform: [{ scaleX: 0.85 + streakPulse.value * 0.2 }],
  }));
  const arcStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + arcFlow.value * 0.65,
    transform: [{ translateX: -30 + arcFlow.value * 60 }],
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: swipeBurst.value,
    transform: [{ scale: 0.85 + swipeBurst.value * 0.35 }],
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={['#450A0A', '#7F1D1D', '#991B1B']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.streakTop, streakStyle]} />
      <Animated.View style={[styles.streakMid, streakStyle]} />
      <Animated.View style={[styles.streakBot, streakStyle]} />

      <Animated.View style={[styles.arcLeft, arcStyle]}>
        <Text style={styles.arcText}>↙ SWIPE</Text>
      </Animated.View>
      <Animated.View style={[styles.arcRight, arcStyle]}>
        <Text style={styles.arcText}>SWIPE ↘</Text>
      </Animated.View>

      <View style={styles.tunnelRing} />
      <View style={[styles.tunnelRing, styles.tunnelRingInner]} />

      <Animated.View style={[styles.swipeGuide, guideStyle]} pointerEvents="none">
        <Text style={styles.guideText}>↔ SWIPE ACROSS</Text>
        <Text style={styles.guideSub}>Opposite direction!</Text>
      </Animated.View>

      <Animated.View style={[styles.swipeBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.burstText}>✦ SWIPE ✦</Text>
      </Animated.View>

      <Text style={styles.footerHint}>Swipe across your body ↕↔</Text>
    </>
  );
};

const styles = StyleSheet.create({
  streakTop: {
    position: 'absolute',
    top: '22%',
    left: '5%',
    right: '5%',
    height: 3,
    borderRadius: 2,
    backgroundColor: T.trailGlow,
  },
  streakMid: {
    position: 'absolute',
    top: '48%',
    left: '8%',
    right: '8%',
    height: 4,
    borderRadius: 2,
    backgroundColor: T.accent,
  },
  streakBot: {
    position: 'absolute',
    bottom: '28%',
    left: '5%',
    right: '5%',
    height: 3,
    borderRadius: 2,
    backgroundColor: T.trailGlow,
  },
  arcLeft: {
    position: 'absolute',
    left: '10%',
    top: '32%',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(127,29,29,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(252,165,165,0.35)',
  },
  arcRight: {
    position: 'absolute',
    right: '10%',
    top: '52%',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(127,29,29,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.35)',
  },
  arcText: { fontSize: 11, fontWeight: '900', color: T.accentDark, letterSpacing: 0.5 },
  tunnelRing: {
    position: 'absolute',
    alignSelf: 'center',
    top: '30%',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: 'rgba(248,113,113,0.25)',
  },
  tunnelRingInner: {
    top: '36%',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderColor: 'rgba(248,113,113,0.15)',
  },
  swipeGuide: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 56,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(69,10,10,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.45)',
  },
  guideText: { fontSize: 16, fontWeight: '900', color: '#FEE2E2' },
  guideSub: { fontSize: 11, fontWeight: '700', color: T.subtitleColor, marginTop: 2 },
  swipeBurst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '40%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(248,113,113,0.35)',
  },
  burstText: { fontSize: 16, fontWeight: '900', color: '#FEF2F2', letterSpacing: 1 },
  footerHint: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(254,202,202,0.65)',
  },
});
