/**
 * Meadow finger trail for Hand Walk (OT L4 S5 Game 2).
 */
import { HAND_WALK_THEME as T } from '@/components/game/occupational/level4/session5/session5Theme';
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
  walkKey: number;
};

export const HandWalkPlayArea: React.FC<Props> = ({
  roundActive,
  showGuide,
  activeHand,
  stepDisplay,
  stepsTotal,
  walkKey,
}) => {
  const pathGlow = useSharedValue(0.4);
  const guideScale = useSharedValue(1);
  const finishBurst = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    pathGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [roundActive, pathGlow]);

  useEffect(() => {
    pathGlow.value = withSequence(withSpring(1.2, { damping: 6 }), withTiming(0.4, { duration: 400 }));
  }, [activeHand, pathGlow]);

  useEffect(() => {
    if (!walkKey) return;
    finishBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 180 }),
      withTiming(0, { duration: 500 }),
    );
  }, [walkKey, finishBurst]);

  useEffect(() => {
    if (!showGuide || !roundActive) {
      guideScale.value = 1;
      return;
    }
    guideScale.value = withRepeat(
      withSequence(withTiming(1.1, { duration: 520 }), withTiming(1, { duration: 520 })),
      -1,
      true,
    );
  }, [showGuide, roundActive, guideScale]);

  const pathStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + pathGlow.value * 0.4,
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: finishBurst.value,
    transform: [{ scale: 0.85 + finishBurst.value * 0.25 }],
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={[T.meadowDark, '#166534', '#14532D']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.grassTop} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Text key={`flower-${i}`} style={[styles.flower, { left: `${12 + i * 18}%`, top: `${14 + (i % 2) * 4}%` }]}>
          {i % 2 === 0 ? '🌼' : '🌿'}
        </Text>
      ))}

      <Animated.View style={[styles.trailPath, pathStyle]} />
      <View style={styles.trailDashes}>
        {[0, 1, 2, 3].map((i) => (
          <Text
            key={`print-${i}`}
            style={[
              styles.footprint,
              i < stepDisplay - 1 && styles.footprintDone,
              i === stepDisplay - 1 && styles.footprintCurrent,
            ]}
          >
            {i % 2 === 0 ? '👣' : '👣'}
          </Text>
        ))}
      </View>

      <View style={[styles.stonePad, styles.leftStone, activeHand === 'left' && styles.stoneActive]} />
      <View style={[styles.stonePad, styles.rightStone, activeHand === 'right' && styles.stoneActive]} />

      <Animated.View style={[styles.finishBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.finishBurstText}>🚶 TRAIL DONE!</Text>
      </Animated.View>

      <Animated.View style={[styles.guideBadge, guideStyle]}>
        <Text style={styles.guideText}>👣 Walk the path!</Text>
      </Animated.View>

      <View style={styles.trailLabel}>
        <Text style={styles.trailLabelText}>MEADOW TRAIL</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  grassTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '16%',
    backgroundColor: 'rgba(74,222,128,0.08)',
  },
  flower: { position: 'absolute', fontSize: 16, opacity: 0.7 },
  trailPath: {
    position: 'absolute',
    alignSelf: 'center',
    top: '46%',
    width: '68%',
    height: 8,
    borderRadius: 4,
    backgroundColor: T.pathTan,
  },
  trailDashes: {
    position: 'absolute',
    alignSelf: 'center',
    top: '40%',
    flexDirection: 'row',
    gap: 16,
  },
  footprint: { fontSize: 18, opacity: 0.25 },
  footprintDone: { opacity: 0.85 },
  footprintCurrent: { opacity: 1, transform: [{ scale: 1.25 }] },
  stonePad: {
    position: 'absolute',
    bottom: '20%',
    width: '22%',
    height: '14%',
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: 'rgba(20,83,45,0.45)',
  },
  leftStone: { left: '12%', borderColor: 'rgba(59,130,246,0.35)' },
  rightStone: { right: '12%', borderColor: 'rgba(245,158,11,0.35)' },
  stoneActive: {
    backgroundColor: 'rgba(74,222,128,0.18)',
    borderColor: T.accent,
  },
  finishBurst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '30%',
  },
  finishBurstText: { fontSize: 18, fontWeight: '900', color: T.accentDark },
  guideBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '26%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(20,83,45,0.88)',
    borderWidth: 1,
    borderColor: T.accent,
  },
  guideText: { fontSize: 14, fontWeight: '900', color: T.accentDark },
  trailLabel: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(74,222,128,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.35)',
  },
  trailLabelText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: T.accent,
  },
});
