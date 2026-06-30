/**
 * Sunny tennis court for Toss & Grab (OT L4 S6 Game 2).
 */
import { TOSS_GRAB_THEME as T } from '@/components/game/occupational/level4/session6/tossGrab/tossGrabTheme';
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

type BallState = 'left' | 'right' | 'moving' | 'throwing' | 'catching';

type Props = {
  roundActive: boolean;
  showGuide: boolean;
  ballState: BallState;
  tossKey: number;
};

export const TossGrabPlayArea: React.FC<Props> = ({ roundActive, showGuide, ballState, tossKey }) => {
  const netPulse = useSharedValue(0.4);
  const arcGlow = useSharedValue(0);
  const guideScale = useSharedValue(1);
  const grabBurst = useSharedValue(0);

  const flying = ballState === 'throwing' || ballState === 'catching';
  const readyCatch = ballState === 'catching';

  useEffect(() => {
    if (!roundActive) return;
    netPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.35, { duration: 600, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [roundActive, netPulse]);

  useEffect(() => {
    if (!flying) {
      arcGlow.value = withTiming(0, { duration: 200 });
      return;
    }
    arcGlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 400 }), withTiming(0.4, { duration: 400 })),
      -1,
      true,
    );
  }, [flying, arcGlow]);

  useEffect(() => {
    if (!tossKey) return;
    grabBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 200 }),
      withTiming(0, { duration: 450 }),
    );
  }, [tossKey, grabBurst]);

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

  const netStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + netPulse.value * 0.45,
  }));
  const arcStyle = useAnimatedStyle(() => ({
    opacity: arcGlow.value * 0.7,
    transform: [{ scale: 0.9 + arcGlow.value * 0.15 }],
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: grabBurst.value,
    transform: [{ scale: 0.85 + grabBurst.value * 0.3 }],
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={[T.courtDark, '#166534', '#15803D']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.courtLineTop} />
      <View style={styles.courtLineBottom} />
      <View style={styles.serviceBoxLeft} />
      <View style={styles.serviceBoxRight} />

      <Animated.View style={[styles.net, netStyle]}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <View key={`net-${i}`} style={[styles.netStrand, { top: `${8 + i * 14}%` }]} />
        ))}
      </Animated.View>

      <Animated.View style={[styles.tossArc, arcStyle]} pointerEvents="none">
        <Text style={styles.arcEmoji}>🎾</Text>
      </Animated.View>

      <View style={[styles.phaseCue, readyCatch && styles.phaseCueCatch]}>
        <Text style={styles.phaseCueText}>
          {ballState === 'left'
            ? '🎾 THROW LEFT'
            : ballState === 'throwing'
              ? '✨ ARC!'
              : readyCatch
                ? '🧤 GRAB RIGHT!'
                : '✅ GOT IT!'}
        </Text>
      </View>

      <Animated.View style={[styles.grabBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.grabBurstText}>🎾 GRAB!</Text>
      </Animated.View>

      <Animated.View style={[styles.guideBadge, guideStyle]}>
        <Text style={styles.guideText}>Throw left → catch right!</Text>
      </Animated.View>

      <View style={styles.courtLabel}>
        <Text style={styles.courtLabelText}>TENNIS COURT</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  courtLineTop: {
    position: 'absolute',
    top: '22%',
    left: '8%',
    right: '8%',
    height: 2,
    backgroundColor: 'rgba(254,243,199,0.25)',
  },
  courtLineBottom: {
    position: 'absolute',
    bottom: '22%',
    left: '8%',
    right: '8%',
    height: 2,
    backgroundColor: 'rgba(254,243,199,0.25)',
  },
  serviceBoxLeft: {
    position: 'absolute',
    left: '8%',
    top: '22%',
    bottom: '22%',
    width: '20%',
    borderRightWidth: 1,
    borderColor: 'rgba(254,243,199,0.15)',
  },
  serviceBoxRight: {
    position: 'absolute',
    right: '8%',
    top: '22%',
    bottom: '22%',
    width: '20%',
    borderLeftWidth: 1,
    borderColor: 'rgba(254,243,199,0.15)',
  },
  net: {
    position: 'absolute',
    alignSelf: 'center',
    top: '18%',
    bottom: '18%',
    width: 4,
    backgroundColor: T.netWhite,
    borderRadius: 2,
  },
  netStrand: {
    position: 'absolute',
    left: -20,
    right: -20,
    height: 1,
    backgroundColor: 'rgba(254,243,199,0.35)',
  },
  tossArc: {
    position: 'absolute',
    alignSelf: 'center',
    top: '32%',
  },
  arcEmoji: { fontSize: 24, opacity: 0.85 },
  phaseCue: {
    position: 'absolute',
    alignSelf: 'center',
    top: '12%',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(20,83,45,0.85)',
    borderWidth: 1,
    borderColor: T.accentGreen,
  },
  phaseCueCatch: { borderColor: T.accentGold, backgroundColor: 'rgba(120,53,15,0.85)' },
  phaseCueText: { fontSize: 13, fontWeight: '900', color: T.accentDark },
  grabBurst: { position: 'absolute', alignSelf: 'center', top: '46%' },
  grabBurstText: { fontSize: 22, fontWeight: '900', color: T.accentGold },
  guideBadge: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: '26%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(20,83,45,0.88)',
    borderWidth: 1,
    borderColor: T.accent,
  },
  guideText: { fontSize: 14, fontWeight: '900', color: T.accentDark },
  courtLabel: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(251,191,36,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.35)',
  },
  courtLabelText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: T.accent,
  },
});
