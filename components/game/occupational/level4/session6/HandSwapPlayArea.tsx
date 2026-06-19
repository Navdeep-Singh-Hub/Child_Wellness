/**
 * Midline bridge backdrop for Hand Swap (OT L4 S6 Game 1).
 */
import { HAND_SWAP_THEME as T } from '@/components/game/occupational/level4/session6/session6Theme';
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

type BallSide = 'left' | 'right';
type BallState = 'left' | 'right' | 'moving' | 'throwing' | 'catching';

type Props = {
  roundActive: boolean;
  showGuide: boolean;
  ballSide: BallSide;
  ballState: BallState;
  passCount: number;
  passesNeeded: number;
  swapKey: number;
};

export const HandSwapPlayArea: React.FC<Props> = ({
  roundActive,
  showGuide,
  ballSide,
  ballState,
  passCount,
  passesNeeded,
  swapKey,
}) => {
  const beamPulse = useSharedValue(0.35);
  const arrowFlow = useSharedValue(0);
  const guideScale = useSharedValue(1);
  const swapBurst = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    beamPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.3, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    arrowFlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 100 })),
      -1,
      false,
    );
  }, [roundActive, arrowFlow, beamPulse]);

  useEffect(() => {
    if (!swapKey) return;
    swapBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 200 }),
      withTiming(0, { duration: 450 }),
    );
  }, [swapKey, swapBurst]);

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

  const beamStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + beamPulse.value * 0.55,
    transform: [{ scaleY: 0.9 + beamPulse.value * 0.1 }],
  }));
  const arrowStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + arrowFlow.value * 0.6,
    transform: [{ translateX: -12 + arrowFlow.value * 24 }],
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: swapBurst.value,
    transform: [{ scale: 0.85 + swapBurst.value * 0.3 }],
  }));

  const crossing = ballState === 'moving';

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={[T.bridgeDark, '#0F2744', '#1E3A5F']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.bridgeArch} />
      <Animated.View style={[styles.midlineBeam, beamStyle]} />

      <Animated.View style={[styles.swapArrows, arrowStyle]}>
        <Text style={styles.arrowText}>↔</Text>
      </Animated.View>

      <View style={styles.passDots}>
        {Array.from({ length: passesNeeded }).map((_, i) => (
          <View
            key={`pass-${i}`}
            style={[
              styles.passDot,
              i < passCount && styles.passDotDone,
              i === passCount && ballState !== 'moving' && styles.passDotCurrent,
            ]}
          />
        ))}
      </View>

      <View style={[styles.sideCue, ballSide === 'left' && styles.sideCueLeft]}>
        <Text style={styles.sideCueText}>
          {crossing ? '🌉 Crossing…' : ballSide === 'left' ? '👈 LEFT' : '👉 RIGHT'}
        </Text>
      </View>

      <Animated.View style={[styles.swapBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.swapBurstText}>🤲 SWAP!</Text>
      </Animated.View>

      <Animated.View style={[styles.guideBadge, guideStyle]}>
        <Text style={styles.guideText}>Swap across midline!</Text>
      </Animated.View>

      <View style={styles.bridgeLabel}>
        <Text style={styles.bridgeLabelText}>MIDLINE BRIDGE</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  bridgeArch: {
    position: 'absolute',
    alignSelf: 'center',
    top: '18%',
    width: '68%',
    height: '28%',
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: 'rgba(34,211,238,0.2)',
    backgroundColor: 'rgba(15,39,68,0.35)',
  },
  midlineBeam: {
    position: 'absolute',
    alignSelf: 'center',
    top: '12%',
    bottom: '12%',
    width: 4,
    borderRadius: 2,
    backgroundColor: T.midlineGlow,
    shadowColor: T.midlineGlow,
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  swapArrows: {
    position: 'absolute',
    alignSelf: 'center',
    top: '42%',
  },
  arrowText: { fontSize: 28, fontWeight: '900', color: T.midlineGlow },
  passDots: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: '18%',
    flexDirection: 'row',
    gap: 12,
  },
  passDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(34,211,238,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.35)',
  },
  passDotDone: { backgroundColor: T.accentBlue },
  passDotCurrent: { backgroundColor: T.midlineGlow, transform: [{ scale: 1.2 }] },
  sideCue: {
    position: 'absolute',
    alignSelf: 'center',
    top: '14%',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(12,25,41,0.85)',
    borderWidth: 1,
    borderColor: T.midlineGlow,
  },
  sideCueLeft: { borderColor: T.accentBlue },
  sideCueText: { fontSize: 13, fontWeight: '900', color: T.accentDark },
  swapBurst: { position: 'absolute', alignSelf: 'center', top: '48%' },
  swapBurstText: { fontSize: 22, fontWeight: '900', color: T.midlineGlow },
  guideBadge: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: '28%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(12,25,41,0.88)',
    borderWidth: 1,
    borderColor: T.accent,
  },
  guideText: { fontSize: 14, fontWeight: '900', color: T.accentDark },
  bridgeLabel: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(34,211,238,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.3)',
  },
  bridgeLabelText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: T.accent,
  },
});
