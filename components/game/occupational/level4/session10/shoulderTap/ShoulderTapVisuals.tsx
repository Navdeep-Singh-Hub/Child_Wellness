/**
 * Body map studio backdrop for Shoulder Tap (OT L4 S10 Game 2).
 */
import { SHOULDER_TAP_THEME as T } from '@/components/game/occupational/level4/session10/shoulderTap/shoulderTapTheme';
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
  shoulderKey: number;
  beatDisplay: number;
  patternLen: number;
};

export const ShoulderTapPlayArea: React.FC<Props> = ({ phase, showGuide, shoulderKey, beatDisplay, patternLen }) => {
  const arcPulse = useSharedValue(0.2);
  const guideScale = useSharedValue(1);
  const tapBurst = useSharedValue(0);
  const rtlArc = useSharedValue(0);
  const ltrArc = useSharedValue(0);

  useEffect(() => {
    arcPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 650, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.15, { duration: 650, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    rtlArc.value = withRepeat(
      withSequence(withTiming(1, { duration: 800 }), withTiming(0.2, { duration: 200 })),
      -1,
      false,
    );
    ltrArc.value = withRepeat(
      withSequence(withTiming(0.2, { duration: 200 }), withTiming(1, { duration: 800 })),
      -1,
      false,
    );
  }, [arcPulse, ltrArc, rtlArc]);

  useEffect(() => {
    if (!shoulderKey) return;
    tapBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 200 }),
      withTiming(0, { duration: 450 }),
    );
  }, [shoulderKey, tapBurst]);

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

  const torsoStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + arcPulse.value * 0.35,
  }));
  const rtlStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + rtlArc.value * 0.55,
  }));
  const ltrStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + ltrArc.value * 0.55,
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && phase !== 'remember' ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: tapBurst.value,
    transform: [{ scale: 0.85 + tapBurst.value * 0.35 }],
  }));

  return (
    <>
      <LinearGradient
        colors={['#052E16', '#14532D', '#052E16']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.torso, torsoStyle]} />

      <Animated.View style={[styles.rtlArc, rtlStyle]}>
        <Text style={styles.arcText}>👉 → 🫲</Text>
      </Animated.View>
      <Animated.View style={[styles.ltrArc, ltrStyle]}>
        <Text style={styles.arcText}>👈 → 🫱</Text>
      </Animated.View>

      <View style={styles.bodyBadge}>
        <Text style={styles.badgeText}>🗺️ BODY MAP</Text>
      </View>

      {phase === 'listen' && patternLen > 0 && (
        <View style={styles.phaseBadge}>
          <Text style={styles.phaseText}>👀 WATCH {beatDisplay}/{patternLen}</Text>
        </View>
      )}
      {phase === 'copy' && (
        <View style={[styles.phaseBadge, styles.copyBadge]}>
          <Text style={styles.phaseText}>👆 YOUR TURN!</Text>
        </View>
      )}

      <Animated.View style={[styles.tapGuide, guideStyle]} pointerEvents="none">
        <Text style={styles.guideText}>👆 CROSS-BODY TAP!</Text>
        <Text style={styles.guideSub}>Hand → opposite shoulder</Text>
      </Animated.View>

      <Animated.View style={[styles.tapBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.burstText}>✦ TAP! ✦</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  torso: {
    position: 'absolute',
    alignSelf: 'center',
    top: '22%',
    width: 120,
    height: 160,
    borderRadius: 60,
    backgroundColor: T.crossArc,
    borderWidth: 2,
    borderColor: 'rgba(74,222,128,0.35)',
  },
  rtlArc: {
    position: 'absolute',
    right: '10%',
    top: '30%',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(5,46,22,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.4)',
  },
  ltrArc: {
    position: 'absolute',
    left: '10%',
    top: '30%',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(5,46,22,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.4)',
  },
  arcText: { fontSize: 12, fontWeight: '900', color: T.accentDark },
  bodyBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '12%',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(5,46,22,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.4)',
  },
  badgeText: { fontSize: 11, fontWeight: '900', color: T.accentDark, letterSpacing: 0.5 },
  phaseBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '10%',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(5,46,22,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.4)',
  },
  copyBadge: { borderColor: 'rgba(96,165,250,0.45)' },
  phaseText: { fontSize: 11, fontWeight: '900', color: T.accentDark, letterSpacing: 0.5 },
  tapGuide: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 24,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(5,46,22,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.45)',
  },
  guideText: { fontSize: 15, fontWeight: '900', color: '#F0FDF4' },
  guideSub: { fontSize: 11, fontWeight: '700', color: T.subtitleColor, marginTop: 2 },
  tapBurst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '48%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(74,222,128,0.35)',
  },
  burstText: { fontSize: 16, fontWeight: '900', color: '#F0FDF4', letterSpacing: 1 },
});
