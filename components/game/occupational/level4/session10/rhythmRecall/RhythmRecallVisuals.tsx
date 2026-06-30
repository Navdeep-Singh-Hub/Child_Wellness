/**
 * Memory vault backdrop for Rhythm Recall (OT L4 S10 Game 4).
 */
import { RHYTHM_RECALL_THEME as T } from '@/components/game/occupational/level4/session10/rhythmRecall/rhythmRecallTheme';
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
  recallKey: number;
  beatDisplay: number;
  patternLen: number;
};

export const RhythmRecallPlayArea: React.FC<Props> = ({ phase, showGuide, recallKey, beatDisplay, patternLen }) => {
  const brainPulse = useSharedValue(0.2);
  const vaultGlow = useSharedValue(0.2);
  const guideScale = useSharedValue(1);
  const recallBurst = useSharedValue(0);

  useEffect(() => {
    brainPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.15, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    vaultGlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 900 }), withTiming(0.2, { duration: 300 })),
      -1,
      false,
    );
  }, [brainPulse, vaultGlow]);

  useEffect(() => {
    if (!recallKey) return;
    recallBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 200 }),
      withTiming(0, { duration: 450 }),
    );
  }, [recallKey, recallBurst]);

  useEffect(() => {
    if (!showGuide || phase === 'remember') {
      guideScale.value = 1;
      return;
    }
    guideScale.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 500 }), withTiming(1, { duration: 500 })),
      -1,
      true,
    );
  }, [showGuide, phase, guideScale]);

  const brainStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + brainPulse.value * 0.55,
    transform: [{ scale: 0.92 + brainPulse.value * 0.08 }],
  }));
  const vaultStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + vaultGlow.value * 0.4,
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && phase !== 'remember' ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: recallBurst.value,
    transform: [{ scale: 0.85 + recallBurst.value * 0.35 }],
  }));

  return (
    <>
      <LinearGradient
        colors={['#422006', '#78350F', '#422006']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.vaultRing, vaultStyle]} />
      <Animated.View style={[styles.brainGlow, brainStyle]}>
        <Text style={styles.brainEmoji}>🧠</Text>
      </Animated.View>

      <View style={styles.slotRow}>
        {Array.from({ length: Math.min(patternLen || 4, 6) }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.slot,
              phase === 'listen' && i < beatDisplay && styles.slotFilled,
              phase === 'copy' && styles.slotReady,
            ]}
          />
        ))}
      </View>

      {phase === 'listen' && patternLen > 0 && (
        <View style={styles.phaseBadge}>
          <Text style={styles.phaseText}>👂 LISTEN {beatDisplay}/{patternLen}</Text>
        </View>
      )}
      {phase === 'remember' && (
        <View style={[styles.phaseBadge, styles.rememberBadge]}>
          <Text style={styles.phaseText}>🧠 REMEMBER!</Text>
        </View>
      )}
      {phase === 'copy' && (
        <View style={[styles.phaseBadge, styles.copyBadge]}>
          <Text style={styles.phaseText}>🔁 REPEAT!</Text>
        </View>
      )}

      <Animated.View style={[styles.recallGuide, guideStyle]} pointerEvents="none">
        <Text style={styles.guideText}>🧠 LISTEN → REMEMBER → REPEAT!</Text>
        <Text style={styles.guideSub}>Hold the pattern in your mind</Text>
      </Animated.View>

      <Animated.View style={[styles.recallBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.burstText}>✦ RECALL! ✦</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  vaultRing: {
    position: 'absolute',
    alignSelf: 'center',
    top: '18%',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: T.memoryGlow,
    backgroundColor: 'rgba(251,191,36,0.08)',
  },
  brainGlow: {
    position: 'absolute',
    alignSelf: 'center',
    top: '22%',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(251,191,36,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brainEmoji: { fontSize: 36 },
  slotRow: {
    position: 'absolute',
    alignSelf: 'center',
    top: '38%',
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(66,32,6,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.35)',
  },
  slot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(251,191,36,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.35)',
  },
  slotFilled: { backgroundColor: T.accent, borderColor: T.accentDark },
  slotReady: { borderColor: T.accentDark, backgroundColor: 'rgba(251,191,36,0.35)' },
  phaseBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '10%',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(66,32,6,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.4)',
  },
  rememberBadge: {
    borderColor: '#FCD34D',
    backgroundColor: 'rgba(120,53,15,0.85)',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  copyBadge: { borderColor: 'rgba(239,68,68,0.45)' },
  phaseText: { fontSize: 11, fontWeight: '900', color: T.accentDark, letterSpacing: 0.5 },
  recallGuide: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 24,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(66,32,6,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.45)',
  },
  guideText: { fontSize: 14, fontWeight: '900', color: '#FFFBEB' },
  guideSub: { fontSize: 11, fontWeight: '700', color: T.subtitleColor, marginTop: 2 },
  recallBurst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '52%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(251,191,36,0.35)',
  },
  burstText: { fontSize: 16, fontWeight: '900', color: '#FFFBEB', letterSpacing: 1 },
});
