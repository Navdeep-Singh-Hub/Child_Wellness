/**
 * Rhythm studio backdrop for Cross Clap (OT L4 S10 Game 1).
 */
import { CROSS_CLAP_THEME as T } from '@/components/game/occupational/level4/session10/crossClap/crossClapTheme';
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
  clapKey: number;
  beatDisplay: number;
  patternLen: number;
};

export const CrossClapPlayArea: React.FC<Props> = ({ phase, showGuide, clapKey, beatDisplay, patternLen }) => {
  const wavePulse = useSharedValue(0.2);
  const midlinePulse = useSharedValue(0.2);
  const guideScale = useSharedValue(1);
  const clapBurst = useSharedValue(0);
  const beatFlash = useSharedValue(0);

  useEffect(() => {
    wavePulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.15, { duration: 500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    midlinePulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0.2, { duration: 700 })),
      -1,
      true,
    );
  }, [midlinePulse, wavePulse]);

  useEffect(() => {
    if (!clapKey) return;
    clapBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 200 }),
      withTiming(0, { duration: 450 }),
    );
  }, [clapKey, clapBurst]);

  useEffect(() => {
    if (phase !== 'listen' || !beatDisplay) return;
    beatFlash.value = withSequence(withTiming(1, { duration: 100 }), withTiming(0, { duration: 350 }));
  }, [beatDisplay, beatFlash, phase]);

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
  const midlineStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + midlinePulse.value * 0.5,
  }));
  const beatFlashStyle = useAnimatedStyle(() => ({
    opacity: beatFlash.value * 0.4,
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && phase !== 'remember' ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: clapBurst.value,
    transform: [{ scale: 0.85 + clapBurst.value * 0.35 }],
  }));

  return (
    <>
      <LinearGradient
        colors={['#0C1929', '#0F2744', '#0C1929']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.waveLeft, waveStyle]} />
      <Animated.View style={[styles.waveRight, waveStyle]} />
      <Animated.View style={[styles.midline, midlineStyle]} />
      <Animated.View style={[styles.beatFlash, beatFlashStyle]} pointerEvents="none" />

      <View style={styles.leftZone}>
        <Text style={styles.zoneLabel}>👏 LEFT</Text>
      </View>
      <View style={styles.rightZone}>
        <Text style={styles.zoneLabel}>RIGHT 👏</Text>
      </View>

      {phase === 'listen' && patternLen > 0 && (
        <View style={styles.phaseBadge}>
          <Text style={styles.phaseText}>👂 LISTEN {beatDisplay}/{patternLen}</Text>
        </View>
      )}
      {phase === 'copy' && (
        <View style={[styles.phaseBadge, styles.copyBadge]}>
          <Text style={styles.phaseText}>👏 YOUR TURN!</Text>
        </View>
      )}
      {phase === 'remember' && (
        <View style={[styles.phaseBadge, styles.rememberBadge]}>
          <Text style={styles.phaseText}>🧠 REMEMBER</Text>
        </View>
      )}

      <Animated.View style={[styles.clapGuide, guideStyle]} pointerEvents="none">
        <Text style={styles.guideText}>👏 LISTEN → COPY!</Text>
        <Text style={styles.guideSub}>Cross-body clap pattern</Text>
      </Animated.View>

      <Animated.View style={[styles.clapBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.burstText}>✦ CLAP! ✦</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  waveLeft: {
    position: 'absolute',
    left: 0,
    top: '20%',
    width: '45%',
    height: '50%',
    backgroundColor: T.leftColor,
    borderTopRightRadius: 60,
    borderBottomRightRadius: 60,
  },
  waveRight: {
    position: 'absolute',
    right: 0,
    top: '20%',
    width: '45%',
    height: '50%',
    backgroundColor: T.rightColor,
    borderTopLeftRadius: 60,
    borderBottomLeftRadius: 60,
  },
  midline: {
    position: 'absolute',
    alignSelf: 'center',
    top: '18%',
    bottom: '22%',
    width: 3,
    borderRadius: 2,
    backgroundColor: T.crossGlow,
  },
  beatFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: T.accent,
  },
  leftZone: {
    position: 'absolute',
    left: '8%',
    bottom: '14%',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(12,25,41,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.35)',
  },
  rightZone: {
    position: 'absolute',
    right: '8%',
    bottom: '14%',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(12,25,41,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.35)',
  },
  zoneLabel: { fontSize: 10, fontWeight: '900', color: T.accentDark, letterSpacing: 0.5 },
  phaseBadge: {
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
  copyBadge: { borderColor: 'rgba(74,222,128,0.45)', backgroundColor: 'rgba(5,46,22,0.75)' },
  rememberBadge: { borderColor: 'rgba(251,191,36,0.45)' },
  phaseText: { fontSize: 11, fontWeight: '900', color: T.accentDark, letterSpacing: 0.5 },
  clapGuide: {
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
  clapBurst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '42%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(96,165,250,0.35)',
  },
  burstText: { fontSize: 16, fontWeight: '900', color: '#EFF6FF', letterSpacing: 1 },
});
