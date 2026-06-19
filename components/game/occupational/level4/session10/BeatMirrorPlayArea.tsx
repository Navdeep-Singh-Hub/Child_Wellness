/**
 * Concert booth backdrop for Beat Mirror (OT L4 S10 Game 3).
 */
import { BEAT_MIRROR_THEME as T } from '@/components/game/occupational/level4/session10/session10Theme';
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
  mirrorKey: number;
  beatDisplay: number;
  patternLen: number;
};

export const BeatMirrorPlayArea: React.FC<Props> = ({ phase, showGuide, mirrorKey, beatDisplay, patternLen }) => {
  const wavePulse = useSharedValue(0.2);
  const eqBars = useSharedValue(0);
  const guideScale = useSharedValue(1);
  const mirrorBurst = useSharedValue(0);

  useEffect(() => {
    wavePulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.15, { duration: 500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    eqBars.value = withRepeat(
      withSequence(withTiming(1, { duration: 600 }), withTiming(0.2, { duration: 200 })),
      -1,
      false,
    );
  }, [eqBars, wavePulse]);

  useEffect(() => {
    if (!mirrorKey) return;
    mirrorBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 200 }),
      withTiming(0, { duration: 450 }),
    );
  }, [mirrorKey, mirrorBurst]);

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

  const waveStyle = useAnimatedStyle(() => ({
    opacity: 0.15 + wavePulse.value * 0.35,
  }));
  const eqStyle = useAnimatedStyle(() => ({
    height: 8 + eqBars.value * 24,
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && phase !== 'remember' ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: mirrorBurst.value,
    transform: [{ scale: 0.85 + mirrorBurst.value * 0.35 }],
  }));

  return (
    <>
      <LinearGradient
        colors={['#2E1065', '#4C1D95', '#2E1065']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.waveLeft, waveStyle]} />
      <Animated.View style={[styles.waveRight, waveStyle]} />

      <View style={styles.eqRow}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Animated.View key={i} style={[styles.eqBar, eqStyle, i % 2 === 0 && { height: 20 }]} />
        ))}
      </View>

      <View style={styles.moveHints}>
        <Text style={styles.hintEmoji}>👈</Text>
        <Text style={styles.hintEmoji}>🙌</Text>
        <Text style={styles.hintEmoji}>👉</Text>
      </View>

      {phase === 'listen' && patternLen > 0 && (
        <View style={styles.phaseBadge}>
          <Text style={styles.phaseText}>🎵 BEAT {beatDisplay}/{patternLen}</Text>
        </View>
      )}
      {phase === 'copy' && (
        <View style={[styles.phaseBadge, styles.copyBadge]}>
          <Text style={styles.phaseText}>🪞 MIRROR!</Text>
        </View>
      )}

      <Animated.View style={[styles.mirrorGuide, guideStyle]} pointerEvents="none">
        <Text style={styles.guideText}>🎵 MIRROR THE BEAT!</Text>
        <Text style={styles.guideSub}>Left · Both · Right</Text>
      </Animated.View>

      <Animated.View style={[styles.mirrorBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.burstText}>✦ BEAT! ✦</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  waveLeft: {
    position: 'absolute',
    left: 0,
    top: '25%',
    width: '40%',
    height: '45%',
    backgroundColor: T.leftColor,
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
  },
  waveRight: {
    position: 'absolute',
    right: 0,
    top: '25%',
    width: '40%',
    height: '45%',
    backgroundColor: T.rightColor,
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
  },
  eqRow: {
    position: 'absolute',
    alignSelf: 'center',
    top: '14%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 32,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(46,16,101,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.35)',
  },
  eqBar: {
    width: 6,
    borderRadius: 3,
    backgroundColor: T.accent,
  },
  moveHints: {
    position: 'absolute',
    alignSelf: 'center',
    top: '22%',
    flexDirection: 'row',
    gap: 24,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(46,16,101,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.3)',
  },
  hintEmoji: { fontSize: 18 },
  phaseBadge: {
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
  copyBadge: { borderColor: 'rgba(244,114,182,0.45)' },
  phaseText: { fontSize: 11, fontWeight: '900', color: T.accentDark, letterSpacing: 0.5 },
  mirrorGuide: {
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
  mirrorBurst: {
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
