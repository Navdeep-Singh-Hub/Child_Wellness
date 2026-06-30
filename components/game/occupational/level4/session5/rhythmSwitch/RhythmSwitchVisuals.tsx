/**
 * Jazz club drum stage for Rhythm Switch (OT L4 S5 Game 4).
 */
import { RHYTHM_SWITCH_THEME as T } from '@/components/game/occupational/level4/session5/rhythmSwitch/rhythmSwitchTheme';
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
  beatKey: number;
};

export const RhythmSwitchPlayArea: React.FC<Props> = ({
  roundActive,
  showGuide,
  activeHand,
  stepDisplay,
  stepsTotal,
  beatKey,
}) => {
  const metronome = useSharedValue(0.4);
  const guideScale = useSharedValue(1);
  const rhythmBurst = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    metronome.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 480, easing: Easing.out(Easing.quad) }),
        withTiming(0.3, { duration: 480, easing: Easing.in(Easing.quad) }),
      ),
      -1,
      true,
    );
  }, [roundActive, metronome]);

  useEffect(() => {
    metronome.value = withSequence(withSpring(1.15, { damping: 6 }), withTiming(0.4, { duration: 350 }));
  }, [activeHand, metronome]);

  useEffect(() => {
    if (!beatKey) return;
    rhythmBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 200 }),
      withTiming(0, { duration: 450 }),
    );
  }, [beatKey, rhythmBurst]);

  useEffect(() => {
    if (!showGuide || !roundActive) {
      guideScale.value = 1;
      return;
    }
    guideScale.value = withRepeat(
      withSequence(withTiming(1.1, { duration: 480 }), withTiming(1, { duration: 480 })),
      -1,
      true,
    );
  }, [showGuide, roundActive, guideScale]);

  const metroStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-18 + metronome.value * 36}deg` }],
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: rhythmBurst.value,
    transform: [{ scale: 0.85 + rhythmBurst.value * 0.3 }],
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={[T.stageDark, '#422006', '#292524']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.stageLights} />
      <View style={styles.vinylRecord} />

      <Animated.View style={[styles.metronomeArm, metroStyle]} />
      <View style={styles.metronomeBase} />

      <View style={styles.beatDots}>
        {Array.from({ length: stepsTotal }).map((_, i) => (
          <View
            key={`beat-${i}`}
            style={[styles.beatDot, i < stepDisplay - 1 && styles.beatDotDone, i === stepDisplay - 1 && styles.beatDotCurrent]}
          />
        ))}
      </View>

      <View style={[styles.drumPad, styles.leftPad, activeHand === 'left' && styles.padActive]}>
        <Text style={styles.padLabel}>L</Text>
      </View>
      <View style={[styles.drumPad, styles.rightPad, activeHand === 'right' && styles.padActive]}>
        <Text style={styles.padLabel}>R</Text>
      </View>

      <View style={styles.beatCue}>
        <Text style={styles.beatCueText}>
          {activeHand === 'left' ? '🥁 LEFT BEAT' : '🥁 RIGHT BEAT'}
        </Text>
      </View>

      <Animated.View style={[styles.rhythmBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.rhythmBurstText}>🎵 GROOVE!</Text>
      </Animated.View>

      <Animated.View style={[styles.guideBadge, guideStyle]}>
        <Text style={styles.guideText}>🥁 Alternate drums!</Text>
      </Animated.View>

      <View style={styles.stageLabel}>
        <Text style={styles.stageLabelText}>JAZZ STAGE</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  stageLights: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: T.metronomeGlow,
    opacity: 0.35,
  },
  vinylRecord: {
    position: 'absolute',
    alignSelf: 'center',
    top: '22%',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#292524',
    borderWidth: 3,
    borderColor: 'rgba(251,191,36,0.35)',
  },
  metronomeBase: {
    position: 'absolute',
    alignSelf: 'center',
    top: '30%',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: T.metronomeGlow,
    opacity: 0.5,
  },
  metronomeArm: {
    position: 'absolute',
    alignSelf: 'center',
    top: '24%',
    width: 3,
    height: 48,
    backgroundColor: T.metronomeGlow,
    borderRadius: 2,
    transformOrigin: 'bottom',
  },
  beatDots: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: '22%',
    flexDirection: 'row',
    gap: 10,
  },
  beatDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(245,158,11,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
  },
  beatDotDone: { backgroundColor: T.accentCopper },
  beatDotCurrent: { backgroundColor: T.metronomeGlow, transform: [{ scale: 1.2 }] },
  drumPad: {
    position: 'absolute',
    bottom: '32%',
    width: '24%',
    height: '12%',
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(28,20,16,0.5)',
  },
  leftPad: { left: '10%', borderColor: 'rgba(249,115,22,0.35)' },
  rightPad: { right: '10%', borderColor: 'rgba(220,38,38,0.35)' },
  padActive: {
    backgroundColor: 'rgba(245,158,11,0.2)',
    borderColor: T.metronomeGlow,
  },
  padLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: T.accentDark,
    letterSpacing: 1,
  },
  beatCue: {
    position: 'absolute',
    alignSelf: 'center',
    top: '14%',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(28,20,16,0.8)',
    borderWidth: 1,
    borderColor: T.metronomeGlow,
  },
  beatCueText: { fontSize: 13, fontWeight: '900', color: T.metronomeGlow },
  rhythmBurst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '40%',
  },
  rhythmBurstText: { fontSize: 20, fontWeight: '900', color: T.metronomeGlow },
  guideBadge: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: '28%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(28,20,16,0.88)',
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
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
  },
  stageLabelText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: T.accent,
  },
});
