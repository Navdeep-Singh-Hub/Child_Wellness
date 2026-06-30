/**
 * Lightning storm backdrop for Fast Beat (OT L4 S10 Game 5).
 */
import { SESSION4_10_PACING as P } from '@/components/game/occupational/level4/session10/session10Pacing';
import { FAST_BEAT_THEME as T } from '@/components/game/occupational/level4/session10/fastBeat/fastBeatTheme';
import { speedBeatMs } from '@/components/game/occupational/level4/session10/rhythmUtils';
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

type Phase = 'listen' | 'remember' | 'copy';

type Props = {
  phase: Phase;
  showGuide: boolean;
  fastKey: number;
  beatDisplay: number;
  patternLen: number;
  round: number;
  totalRounds: number;
};

export const FastBeatPlayArea: React.FC<Props> = ({
  phase,
  showGuide,
  fastKey,
  beatDisplay,
  patternLen,
  round,
  totalRounds,
}) => {
  const boltPulse = useSharedValue(0.15);
  const stormFlash = useSharedValue(0);
  const guideScale = useSharedValue(1);
  const fastBurst = useSharedValue(0);

  const speedPct = Math.round((round / totalRounds) * 100);
  const beatMs = speedBeatMs(round, P.speedInitialBeatMs, P.speedMinBeatMs, P.speedDecreaseMs);
  const bpm = Math.round(60000 / beatMs);

  useEffect(() => {
    boltPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 350, easing: Easing.out(Easing.quad) }),
        withTiming(0.1, { duration: 450, easing: Easing.in(Easing.quad) }),
      ),
      -1,
      false,
    );
    stormFlash.value = withRepeat(
      withSequence(withTiming(0.7, { duration: 60 }), withTiming(0, { duration: 350 })),
      -1,
      false,
    );
  }, [boltPulse, stormFlash]);

  useEffect(() => {
    if (!fastKey) return;
    fastBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 220 }),
      withTiming(0, { duration: 400 }),
    );
  }, [fastKey, fastBurst]);

  useEffect(() => {
    if (!showGuide || phase === 'remember') {
      guideScale.value = 1;
      return;
    }
    guideScale.value = withRepeat(
      withSequence(withTiming(1.1, { duration: 350 }), withTiming(1, { duration: 350 })),
      -1,
      true,
    );
  }, [showGuide, phase, guideScale]);

  const boltStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + boltPulse.value * 0.7,
    transform: [{ scale: 0.85 + boltPulse.value * 0.2 }],
  }));
  const stormStyle = useAnimatedStyle(() => ({
    opacity: stormFlash.value * 0.15,
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && phase !== 'remember' ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: fastBurst.value,
    transform: [{ scale: 0.85 + fastBurst.value * 0.35 }],
  }));

  return (
    <>
      <LinearGradient
        colors={['#1C1917', '#450A0A', '#1C1917']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.stormFlash, stormStyle]} pointerEvents="none" />

      <Animated.View style={[styles.leftBolt, boltStyle]}>
        <Text style={styles.boltEmoji}>⚡</Text>
      </Animated.View>
      <Animated.View style={[styles.rightBolt, boltStyle]}>
        <Text style={styles.boltEmoji}>⚡</Text>
      </Animated.View>

      <View style={styles.speedBox}>
        <Text style={styles.speedLabel}>TEMPO</Text>
        <View style={styles.speedTrack}>
          <View style={[styles.speedFill, { width: `${speedPct}%` }]} />
        </View>
        <Text style={styles.speedPct}>{bpm} BPM · R{round}</Text>
      </View>

      {phase === 'listen' && patternLen > 0 && (
        <View style={styles.phaseBadge}>
          <Text style={styles.phaseText}>👂 BEAT {beatDisplay}/{patternLen}</Text>
        </View>
      )}
      {phase === 'copy' && (
        <View style={[styles.phaseBadge, styles.copyBadge]}>
          <Text style={styles.phaseText}>⚡ COPY!</Text>
        </View>
      )}

      <Animated.View style={[styles.fastGuide, guideStyle]} pointerEvents="none">
        <Text style={styles.guideText}>⚡ COPY THE RHYTHM — IT SPEEDS UP!</Text>
        <Text style={styles.guideSub}>Stay in control as tempo rises</Text>
      </Animated.View>

      <Animated.View style={[styles.fastBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.burstText}>⚡ FAST! ⚡</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  stormFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#EF4444',
  },
  leftBolt: {
    position: 'absolute',
    left: '8%',
    top: '22%',
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(69,10,10,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
  },
  rightBolt: {
    position: 'absolute',
    right: '8%',
    top: '22%',
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(69,10,10,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.35)',
  },
  boltEmoji: { fontSize: 22 },
  speedBox: {
    position: 'absolute',
    alignSelf: 'center',
    top: '12%',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(28,25,23,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
  },
  speedLabel: { fontSize: 9, fontWeight: '900', color: T.accentDark, letterSpacing: 1 },
  speedTrack: {
    width: 110,
    height: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(69,10,10,0.8)',
    marginTop: 4,
    overflow: 'hidden',
  },
  speedFill: { height: '100%', borderRadius: 4, backgroundColor: T.accent },
  speedPct: { fontSize: 10, fontWeight: '800', color: T.accent, marginTop: 3 },
  phaseBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '38%',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(28,25,23,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
  },
  copyBadge: { borderColor: T.speedGlow },
  phaseText: { fontSize: 11, fontWeight: '900', color: T.accentDark, letterSpacing: 0.5 },
  fastGuide: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 24,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(28,25,23,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.45)',
  },
  guideText: { fontSize: 14, fontWeight: '900', color: '#FFFBEB' },
  guideSub: { fontSize: 11, fontWeight: '700', color: T.subtitleColor, marginTop: 2 },
  fastBurst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '52%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(239,68,68,0.35)',
  },
  burstText: { fontSize: 16, fontWeight: '900', color: '#FFFBEB', letterSpacing: 1 },
});
