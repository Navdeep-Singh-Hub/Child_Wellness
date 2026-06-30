/**
 * Harmony merge backdrop for Pair Match (OT L4 S9 Game 2).
 */
import { PAIR_MATCH_THEME as T } from '@/components/game/occupational/level4/session9/pairMatch/pairMatchTheme';
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

type Zone = { x: number; y: number };

type Props = {
  roundActive: boolean;
  showGuide: boolean;
  pairKey: number;
  centerZone: Zone;
};

export const PairMatchPlayArea: React.FC<Props> = ({ roundActive, showGuide, pairKey, centerZone }) => {
  const mergePulse = useSharedValue(0.2);
  const guideScale = useSharedValue(1);
  const pairBurst = useSharedValue(0);
  const leftStream = useSharedValue(0);
  const rightStream = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    mergePulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.2, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    leftStream.value = withRepeat(
      withSequence(withTiming(1, { duration: 900 }), withTiming(0.3, { duration: 100 })),
      -1,
      false,
    );
    rightStream.value = withRepeat(
      withSequence(withTiming(0.3, { duration: 100 }), withTiming(1, { duration: 900 })),
      -1,
      false,
    );
  }, [roundActive, leftStream, mergePulse, rightStream]);

  useEffect(() => {
    if (!pairKey) return;
    pairBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 200 }),
      withTiming(0, { duration: 450 }),
    );
  }, [pairKey, pairBurst]);

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

  const mergeStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + mergePulse.value * 0.55,
    transform: [{ scale: 0.9 + mergePulse.value * 0.15 }],
  }));
  const leftStreamStyle = useAnimatedStyle(() => ({
    opacity: leftStream.value * 0.5,
  }));
  const rightStreamStyle = useAnimatedStyle(() => ({
    opacity: rightStream.value * 0.5,
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: pairBurst.value,
    transform: [{ scale: 0.85 + pairBurst.value * 0.35 }],
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={['#052E16', '#14532D', '#052E16']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.leftStream, leftStreamStyle]} />
      <Animated.View style={[styles.rightStream, rightStreamStyle]} />

      <Animated.View
        style={[
          styles.mergeRing,
          { left: centerZone.x - 70, top: centerZone.y - 70 },
          mergeStyle,
        ]}
      />

      <View style={styles.leftArrow}>
        <Text style={styles.arrowText}>↘</Text>
      </View>
      <View style={styles.rightArrow}>
        <Text style={styles.arrowText}>↙</Text>
      </View>

      <Animated.View style={[styles.pairGuide, guideStyle]} pointerEvents="none">
        <Text style={styles.guideText}>🤝 BOTH → CENTER!</Text>
        <Text style={styles.guideSub}>Same shape, both hands</Text>
      </Animated.View>

      <Animated.View style={[styles.pairBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.burstText}>✦ MATCH! ✦</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  leftStream: {
    position: 'absolute',
    left: 0,
    top: '18%',
    width: '50%',
    height: '55%',
    backgroundColor: T.mergeGlow,
    borderBottomRightRadius: 80,
  },
  rightStream: {
    position: 'absolute',
    right: 0,
    top: '18%',
    width: '50%',
    height: '55%',
    backgroundColor: T.mergeGlow,
    borderBottomLeftRadius: 80,
  },
  mergeRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: T.accent,
    backgroundColor: 'rgba(74,222,128,0.12)',
  },
  leftArrow: {
    position: 'absolute',
    left: '18%',
    top: '32%',
  },
  rightArrow: {
    position: 'absolute',
    right: '18%',
    top: '32%',
  },
  arrowText: { fontSize: 28, fontWeight: '900', color: T.accent },
  pairGuide: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 24,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(5,46,22,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.45)',
  },
  guideText: { fontSize: 15, fontWeight: '900', color: '#F0FDF4' },
  guideSub: { fontSize: 11, fontWeight: '700', color: T.subtitleColor, marginTop: 2 },
  pairBurst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '48%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(74,222,128,0.35)',
  },
  burstText: { fontSize: 16, fontWeight: '900', color: '#F0FDF4', letterSpacing: 1 },
});
