/**
 * Purple neon beat stage for Beat Pass (OT L4 S6 Game 4).
 */
import { BEAT_PASS_THEME as T } from '@/components/game/occupational/level4/session6/beatPass/beatPassTheme';
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
  activeHand: Hand | null;
  passCount: number;
  passesNeeded: number;
  beatKey: number;
};

export const BeatPassPlayArea: React.FC<Props> = ({
  roundActive,
  showGuide,
  activeHand,
  passCount,
  passesNeeded,
  beatKey,
}) => {
  const beatPulse = useSharedValue(0.3);
  const waveShift = useSharedValue(0);
  const guideScale = useSharedValue(1);
  const beatBurst = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    waveShift.value = withRepeat(
      withSequence(withTiming(1, { duration: 1200, easing: Easing.linear }), withTiming(0, { duration: 0 })),
      -1,
      false,
    );
  }, [roundActive, waveShift]);

  useEffect(() => {
    if (!activeHand) {
      beatPulse.value = withTiming(0.25, { duration: 200 });
      return;
    }
    beatPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) }),
        withTiming(0.35, { duration: 400 }),
      ),
      2,
      false,
    );
  }, [activeHand, beatPulse]);

  useEffect(() => {
    if (!beatKey) return;
    beatBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 200 }),
      withTiming(0, { duration: 450 }),
    );
  }, [beatKey, beatBurst]);

  useEffect(() => {
    if (!showGuide || !roundActive) {
      guideScale.value = 1;
      return;
    }
    guideScale.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 480 }), withTiming(1, { duration: 480 })),
      -1,
      true,
    );
  }, [showGuide, roundActive, guideScale]);

  const beatStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + beatPulse.value * 0.65,
    transform: [{ scale: 0.9 + beatPulse.value * 0.15 }],
  }));
  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -30 + waveShift.value * 60 }],
    opacity: 0.15 + waveShift.value * 0.2,
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: beatBurst.value,
    transform: [{ scale: 0.85 + beatBurst.value * 0.3 }],
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={[T.stageDark, '#312E81', '#4C1D95']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.neonStripTop} />
      <View style={styles.neonStripBottom} />

      <Animated.View style={[styles.waveLayer, waveStyle]}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View key={`wave-${i}`} style={[styles.waveBar, { height: 12 + (i % 3) * 10, left: `${8 + i * 14}%` }]} />
        ))}
      </Animated.View>

      <Animated.View style={[styles.beatFlash, beatStyle]}>
        <Text style={styles.beatFlashText}>🎵 BEAT</Text>
      </Animated.View>

      <View style={styles.beatDots}>
        {Array.from({ length: passesNeeded }).map((_, i) => (
          <View
            key={`beat-${i}`}
            style={[
              styles.beatDot,
              i < passCount && styles.beatDotDone,
              i === passCount && activeHand && styles.beatDotCurrent,
            ]}
          />
        ))}
      </View>

      <View style={[styles.handCue, activeHand === 'left' && styles.handCueLeft, activeHand === 'right' && styles.handCueRight]}>
        <Text style={styles.handCueText}>
          {activeHand === 'left'
            ? '👈 TAP LEFT ON BEAT'
            : activeHand === 'right'
              ? '👉 TAP RIGHT ON BEAT'
              : '⏳ WAIT FOR BEAT…'}
        </Text>
      </View>

      <Animated.View style={[styles.beatBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.beatBurstText}>🎵 ON BEAT!</Text>
      </Animated.View>

      <Animated.View style={[styles.guideBadge, guideStyle]}>
        <Text style={styles.guideText}>Wait for BEAT — then tap!</Text>
      </Animated.View>

      <View style={styles.stageLabel}>
        <Text style={styles.stageLabelText}>BEAT STAGE</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  neonStripTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: T.beatGlow,
    opacity: 0.35,
  },
  neonStripBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: T.accentPink,
    opacity: 0.3,
  },
  waveLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '28%',
    height: 40,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  waveBar: {
    position: 'absolute',
    bottom: 0,
    width: 6,
    borderRadius: 3,
    backgroundColor: T.accentViolet,
    opacity: 0.5,
  },
  beatFlash: {
    position: 'absolute',
    alignSelf: 'center',
    top: '16%',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: 'rgba(30,27,75,0.9)',
    borderWidth: 2,
    borderColor: T.beatGlow,
  },
  beatFlashText: { fontSize: 16, fontWeight: '900', color: T.beatGlow },
  beatDots: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: '20%',
    flexDirection: 'row',
    gap: 10,
  },
  beatDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(167,139,250,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.35)',
  },
  beatDotDone: { backgroundColor: T.accentViolet },
  beatDotCurrent: { backgroundColor: T.beatGlow, transform: [{ scale: 1.2 }] },
  handCue: {
    position: 'absolute',
    alignSelf: 'center',
    top: '38%',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(30,27,75,0.85)',
    borderWidth: 1,
    borderColor: T.accent,
  },
  handCueLeft: { borderColor: T.leftColor },
  handCueRight: { borderColor: T.rightColor },
  handCueText: { fontSize: 13, fontWeight: '900', color: T.accentDark },
  beatBurst: { position: 'absolute', alignSelf: 'center', top: '48%' },
  beatBurstText: { fontSize: 22, fontWeight: '900', color: T.beatGlow },
  guideBadge: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: '28%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(30,27,75,0.88)',
    borderWidth: 1,
    borderColor: T.accent,
  },
  guideText: { fontSize: 14, fontWeight: '900', color: T.accentDark },
  stageLabel: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(167,139,250,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.35)',
  },
  stageLabelText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: T.accent,
  },
});
