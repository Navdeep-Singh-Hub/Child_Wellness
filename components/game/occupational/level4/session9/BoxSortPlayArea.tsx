/**
 * Warehouse bin backdrop for Box Sort (OT L4 S9 Game 3).
 */
import { BOX_SORT_THEME as T } from '@/components/game/occupational/level4/session9/session9Theme';
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
  sortKey: number;
  leftZone: Zone;
  rightZone: Zone;
};

export const BoxSortPlayArea: React.FC<Props> = ({ roundActive, showGuide, sortKey, leftZone, rightZone }) => {
  const shelfPulse = useSharedValue(0.2);
  const guideScale = useSharedValue(1);
  const sortBurst = useSharedValue(0);
  const circleGlow = useSharedValue(0.3);
  const squareGlow = useSharedValue(0.3);

  useEffect(() => {
    if (!roundActive) return;
    shelfPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 750, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.15, { duration: 750, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    circleGlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 650 }), withTiming(0.35, { duration: 650 })),
      -1,
      true,
    );
    squareGlow.value = withRepeat(
      withSequence(withTiming(0.35, { duration: 650 }), withTiming(1, { duration: 650 })),
      -1,
      true,
    );
  }, [roundActive, circleGlow, shelfPulse, squareGlow]);

  useEffect(() => {
    if (!sortKey) return;
    sortBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 200 }),
      withTiming(0, { duration: 450 }),
    );
  }, [sortKey, sortBurst]);

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

  const shelfStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + shelfPulse.value * 0.35,
  }));
  const circleGlowStyle = useAnimatedStyle(() => ({
    opacity: circleGlow.value * 0.55,
  }));
  const squareGlowStyle = useAnimatedStyle(() => ({
    opacity: squareGlow.value * 0.55,
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: sortBurst.value,
    transform: [{ scale: 0.85 + sortBurst.value * 0.35 }],
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={['#2E1065', '#4C1D95', '#2E1065']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.shelfBar, shelfStyle]} />

      <Animated.View
        style={[
          styles.binGlow,
          styles.circleBinGlow,
          { left: leftZone.x - 58, top: leftZone.y - 58 },
          circleGlowStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.binGlow,
          styles.squareBinGlow,
          { left: rightZone.x - 58, top: rightZone.y - 58 },
          squareGlowStyle,
        ]}
      />

      <View style={[styles.binLabel, { left: leftZone.x - 42, top: leftZone.y - 72 }]}>
        <Text style={styles.binEmoji}>⭕</Text>
        <Text style={styles.binText}>CIRCLE</Text>
      </View>
      <View style={[styles.binLabel, styles.squareLabel, { left: rightZone.x - 42, top: rightZone.y - 72 }]}>
        <Text style={styles.binEmoji}>⬜</Text>
        <Text style={styles.binText}>SQUARE</Text>
      </View>

      <View style={styles.conveyorHint}>
        <Text style={styles.conveyorText}>📦 WAREHOUSE SORT</Text>
      </View>

      <Animated.View style={[styles.sortGuide, guideStyle]} pointerEvents="none">
        <Text style={styles.guideText}>⭕ LEFT · ⬜ RIGHT</Text>
        <Text style={styles.guideSub}>Sort both shapes at once!</Text>
      </Animated.View>

      <Animated.View style={[styles.sortBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.burstText}>✦ SORTED! ✦</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  shelfBar: {
    position: 'absolute',
    left: '4%',
    right: '4%',
    bottom: '18%',
    height: 6,
    borderRadius: 3,
    backgroundColor: T.accent,
  },
  binGlow: {
    position: 'absolute',
    width: 116,
    height: 116,
    borderRadius: 20,
  },
  circleBinGlow: { backgroundColor: T.circleGlow },
  squareBinGlow: { backgroundColor: T.squareGlow, borderRadius: 16 },
  binLabel: {
    position: 'absolute',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(46,16,101,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(129,140,248,0.4)',
  },
  squareLabel: { borderColor: 'rgba(45,212,191,0.4)' },
  binEmoji: { fontSize: 16 },
  binText: { fontSize: 8, fontWeight: '900', color: T.accentDark, letterSpacing: 0.5, marginTop: 2 },
  conveyorHint: {
    position: 'absolute',
    alignSelf: 'center',
    top: '10%',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(46,16,101,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.4)',
  },
  conveyorText: { fontSize: 11, fontWeight: '900', color: T.accentDark, letterSpacing: 0.5 },
  sortGuide: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 24,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(46,16,101,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.45)',
  },
  guideText: { fontSize: 15, fontWeight: '900', color: '#F5F3FF' },
  guideSub: { fontSize: 11, fontWeight: '700', color: T.subtitleColor, marginTop: 2 },
  sortBurst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '48%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(167,139,250,0.35)',
  },
  burstText: { fontSize: 16, fontWeight: '900', color: '#F5F3FF', letterSpacing: 1 },
});
