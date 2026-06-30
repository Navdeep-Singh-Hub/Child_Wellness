/**
 * Sound studio backdrop for Sound Tap (OT L4 S8 Game 3).
 */
import { SOUND_TAP_THEME as T } from '@/components/game/occupational/level4/session8/soundTap/soundTapTheme';
import { SoundCue, soundEmoji } from '@/components/game/occupational/level4/session8/sideTapUtils';
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

type Side = 'left' | 'right';

type Props = {
  roundActive: boolean;
  showGuide: boolean;
  soundKey: number;
  activeSide: Side | null;
  soundCue: SoundCue;
};

export const SoundTapPlayArea: React.FC<Props> = ({ roundActive, showGuide, soundKey, activeSide, soundCue }) => {
  const wavePulse = useSharedValue(0.2);
  const eqBars = useSharedValue(0);
  const guideScale = useSharedValue(1);
  const soundBurst = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    wavePulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.15, { duration: 500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    eqBars.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0.2, { duration: 200 })),
      -1,
      false,
    );
  }, [roundActive, eqBars, wavePulse]);

  useEffect(() => {
    if (!soundKey) return;
    soundBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 200 }),
      withTiming(0, { duration: 450 }),
    );
  }, [soundKey, soundBurst]);

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

  const waveStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + wavePulse.value * 0.6,
    transform: [{ scaleX: 0.85 + wavePulse.value * 0.2 }],
  }));
  const eqStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + eqBars.value * 0.65,
    transform: [{ scaleY: 0.6 + eqBars.value * 0.5 }],
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: soundBurst.value,
    transform: [{ scale: 0.85 + soundBurst.value * 0.35 }],
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={['#2E1065', '#4C1D95', '#6D28D9']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.speakerZone, styles.leftSpeaker, activeSide === 'left' && styles.speakerActiveLeft]}>
        <Text style={styles.speakerLabel}>🔊 LEFT</Text>
      </View>
      <View style={[styles.speakerZone, styles.rightSpeaker, activeSide === 'right' && styles.speakerActiveRight]}>
        <Text style={styles.speakerLabel}>RIGHT 🔊</Text>
      </View>

      <Animated.View style={[styles.waveBand, styles.waveTop, waveStyle]} />
      <Animated.View style={[styles.waveBand, styles.waveMid, waveStyle]} />

      <View style={styles.eqRow}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Animated.View key={i} style={[styles.eqBar, eqStyle, { height: 12 + (i % 4) * 8 }]} />
        ))}
      </View>

      {activeSide && (
        <View style={[styles.cueBadge, activeSide === 'left' ? styles.cueLeft : styles.cueRight]}>
          <Text style={styles.cueText}>{soundEmoji(soundCue)} playing</Text>
        </View>
      )}

      <Animated.View style={[styles.soundGuide, guideStyle]} pointerEvents="none">
        <Text style={styles.guideText}>👂 LISTEN → TAP</Text>
        <Text style={styles.guideSub}>Find the sound side!</Text>
      </Animated.View>

      <Animated.View style={[styles.soundBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.burstText}>✦ SOUND ✦</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  speakerZone: {
    position: 'absolute',
    top: '20%',
    bottom: '22%',
    width: '40%',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(167,139,250,0.2)',
    backgroundColor: 'rgba(46,16,101,0.35)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
  },
  leftSpeaker: { left: '5%' },
  rightSpeaker: { right: '5%' },
  speakerActiveLeft: {
    borderColor: 'rgba(139,92,246,0.55)',
    backgroundColor: 'rgba(139,92,246,0.15)',
  },
  speakerActiveRight: {
    borderColor: 'rgba(244,114,182,0.55)',
    backgroundColor: 'rgba(244,114,182,0.15)',
  },
  speakerLabel: { fontSize: 10, fontWeight: '900', color: T.accentDark, letterSpacing: 0.5 },
  waveBand: {
    position: 'absolute',
    alignSelf: 'center',
    left: '10%',
    right: '10%',
    height: 3,
    borderRadius: 2,
    backgroundColor: T.waveGlow,
  },
  waveTop: { top: '38%' },
  waveMid: { top: '44%', height: 4, backgroundColor: T.accent },
  eqRow: {
    position: 'absolute',
    alignSelf: 'center',
    top: '52%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 40,
  },
  eqBar: {
    width: 6,
    borderRadius: 3,
    backgroundColor: T.accent,
  },
  cueBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '14%',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(46,16,101,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.4)',
  },
  cueLeft: { alignSelf: 'flex-start', left: '12%' },
  cueRight: { alignSelf: 'flex-end', right: '12%' },
  cueText: { fontSize: 12, fontWeight: '900', color: T.accentDark },
  soundGuide: {
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
  guideText: { fontSize: 16, fontWeight: '900', color: '#F5F3FF' },
  guideSub: { fontSize: 11, fontWeight: '700', color: T.subtitleColor, marginTop: 2 },
  soundBurst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '42%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(167,139,250,0.35)',
  },
  burstText: { fontSize: 16, fontWeight: '900', color: '#F5F3FF', letterSpacing: 1 },
});
