/**
 * Bilateral workshop backdrop for Twin Drag (OT L4 S9 Game 1).
 */
import { TWIN_DRAG_THEME as T } from '@/components/game/occupational/level4/session9/twinDrag/twinDragTheme';
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
  twinKey: number;
  leftZone: Zone;
  rightZone: Zone;
};

export const TwinDragPlayArea: React.FC<Props> = ({ roundActive, showGuide, twinKey, leftZone, rightZone }) => {
  const lanePulse = useSharedValue(0.2);
  const guideScale = useSharedValue(1);
  const twinBurst = useSharedValue(0);
  const leftGlow = useSharedValue(0.3);
  const rightGlow = useSharedValue(0.3);

  useEffect(() => {
    if (!roundActive) return;
    lanePulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.15, { duration: 800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    leftGlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 600 }), withTiming(0.35, { duration: 600 })),
      -1,
      true,
    );
    rightGlow.value = withRepeat(
      withSequence(withTiming(0.35, { duration: 600 }), withTiming(1, { duration: 600 })),
      -1,
      true,
    );
  }, [roundActive, lanePulse, leftGlow, rightGlow]);

  useEffect(() => {
    if (!twinKey) return;
    twinBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 200 }),
      withTiming(0, { duration: 450 }),
    );
  }, [twinKey, twinBurst]);

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
    opacity: 0.15 + lanePulse.value * 0.35,
  }));
  const leftGlowStyle = useAnimatedStyle(() => ({
    opacity: leftGlow.value * 0.6,
  }));
  const rightGlowStyle = useAnimatedStyle(() => ({
    opacity: rightGlow.value * 0.6,
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: twinBurst.value,
    transform: [{ scale: 0.85 + twinBurst.value * 0.35 }],
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={['#0C1929', '#0F2744', '#0C1929']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.leftLane, laneStyle]} />
      <Animated.View style={[styles.rightLane, laneStyle]} />

      <Animated.View
        style={[
          styles.targetGlow,
          { left: leftZone.x - 60, top: leftZone.y - 60 },
          leftGlowStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.targetGlow,
          styles.rightTargetGlow,
          { left: rightZone.x - 60, top: rightZone.y - 60 },
          rightGlowStyle,
        ]}
      />

      <View style={styles.leftLabel}>
        <Text style={styles.labelText}>LEFT TARGET</Text>
        <Text style={styles.labelEmoji}>🔵</Text>
      </View>
      <View style={styles.rightLabel}>
        <Text style={styles.labelText}>RIGHT TARGET</Text>
        <Text style={styles.labelEmoji}>🔴</Text>
      </View>

      <View style={styles.centerDivider}>
        <Text style={styles.dividerText}>🤲 BOTH HANDS</Text>
      </View>

      <Animated.View style={[styles.twinGuide, guideStyle]} pointerEvents="none">
        <Text style={styles.guideText}>🤲 DRAG BOTH AT ONCE!</Text>
        <Text style={styles.guideSub}>One object per hand</Text>
      </Animated.View>

      <Animated.View style={[styles.twinBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.burstText}>✦ BOTH! ✦</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  leftLane: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '48%',
    backgroundColor: T.leftGlow,
    borderRightWidth: 1,
    borderRightColor: 'rgba(96,165,250,0.2)',
  },
  rightLane: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '48%',
    backgroundColor: T.rightGlow,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(244,63,94,0.2)',
  },
  targetGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: T.leftGlow,
  },
  rightTargetGlow: { backgroundColor: T.rightGlow },
  leftLabel: {
    position: 'absolute',
    left: '6%',
    bottom: '8%',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(12,25,41,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.35)',
  },
  rightLabel: {
    position: 'absolute',
    right: '6%',
    bottom: '8%',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(12,25,41,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.35)',
    alignItems: 'flex-end',
  },
  labelText: { fontSize: 9, fontWeight: '900', color: T.accentDark, letterSpacing: 0.5 },
  labelEmoji: { fontSize: 14, marginTop: 2 },
  centerDivider: {
    position: 'absolute',
    alignSelf: 'center',
    top: '10%',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(12,25,41,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.4)',
  },
  dividerText: { fontSize: 11, fontWeight: '900', color: T.accentDark },
  twinGuide: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 24,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(12,25,41,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.45)',
  },
  guideText: { fontSize: 15, fontWeight: '900', color: '#EFF6FF' },
  guideSub: { fontSize: 11, fontWeight: '700', color: T.subtitleColor, marginTop: 2 },
  twinBurst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '48%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(96,165,250,0.35)',
  },
  burstText: { fontSize: 16, fontWeight: '900', color: '#EFF6FF', letterSpacing: 1 },
});
