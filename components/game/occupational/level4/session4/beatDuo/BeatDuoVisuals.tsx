/**
 * Neon rhythm stage for Beat Duo (OT L4 S4 Game 3).
 */
import { BEAT_DUO_THEME as T } from '@/components/game/occupational/level4/session4/beatDuo/beatDuoTheme';
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

type Props = {
  roundActive: boolean;
  showGuide: boolean;
  leftLit: boolean;
  rightLit: boolean;
  beatKey: number;
};

export const BeatDuoPlayArea: React.FC<Props> = ({
  roundActive,
  showGuide,
  leftLit,
  rightLit,
  beatKey,
}) => {
  const beatPulse = useSharedValue(0.4);
  const guideScale = useSharedValue(1);
  const ripple = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    beatPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 480, easing: Easing.out(Easing.quad) }),
        withTiming(0.3, { duration: 520, easing: Easing.in(Easing.quad) }),
      ),
      -1,
      true,
    );
  }, [roundActive, beatPulse]);

  useEffect(() => {
    if (!beatKey) return;
    ripple.value = withSequence(
      withSpring(1, { damping: 6, stiffness: 200 }),
      withTiming(0, { duration: 450 }),
    );
  }, [beatKey, ripple]);

  useEffect(() => {
    if (!showGuide || !roundActive) {
      guideScale.value = 1;
      return;
    }
    guideScale.value = withRepeat(
      withSequence(withTiming(1.14, { duration: 460 }), withTiming(1, { duration: 460 })),
      -1,
      true,
    );
  }, [showGuide, roundActive, guideScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + beatPulse.value * 0.45,
    transform: [{ scale: 0.7 + beatPulse.value * 0.35 }],
  }));
  const rippleStyle = useAnimatedStyle(() => ({
    opacity: ripple.value * 0.6,
    transform: [{ scale: 0.5 + ripple.value * 1.2 }],
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={[T.stageDark, '#1E1B4B', '#312E81']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.ledStripTop} />
      <View style={styles.ledStripBottom} />

      {[0, 1, 2].map((i) => (
        <View
          key={`crowd-${i}`}
          style={[styles.crowdSilhouette, { bottom: `${8 + i * 3}%`, opacity: 0.15 + i * 0.08 }]}
        />
      ))}

      <Animated.View style={[styles.beatRing, pulseStyle]} />
      <Animated.View style={[styles.beatRingInner, pulseStyle]} />
      <Animated.View style={[styles.beatRipple, rippleStyle]} />

      <View style={[styles.stagePad, styles.leftPad, leftLit && styles.padLit]}>
        <Text style={styles.padLabel}>L</Text>
      </View>
      <View style={[styles.stagePad, styles.rightPad, rightLit && styles.padLit]}>
        <Text style={styles.padLabel}>R</Text>
      </View>

      <Animated.View style={[styles.guideBadge, guideStyle]}>
        <Text style={styles.guideText}>🥁 Both drums!</Text>
      </Animated.View>

      <View style={styles.stageLabel}>
        <Text style={styles.stageLabelText}>RHYTHM STAGE</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  ledStripTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: T.neonGlow,
    opacity: 0.6,
  },
  ledStripBottom: {
    position: 'absolute',
    bottom: '16%',
    left: '10%',
    right: '10%',
    height: 3,
    borderRadius: 2,
    backgroundColor: T.accentPink,
    opacity: 0.45,
  },
  crowdSilhouette: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '12%',
    backgroundColor: '#000',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  beatRing: {
    position: 'absolute',
    alignSelf: 'center',
    top: '38%',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: T.accentPink,
  },
  beatRingInner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '42%',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: T.neonGlow,
  },
  beatRipple: {
    position: 'absolute',
    alignSelf: 'center',
    top: '36%',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: T.accentOrange,
  },
  stagePad: {
    position: 'absolute',
    bottom: '22%',
    width: '24%',
    height: '12%',
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,10,26,0.55)',
  },
  leftPad: { left: '10%', borderColor: T.accentOrange },
  rightPad: { right: '10%', borderColor: T.accentPink },
  padLit: { backgroundColor: 'rgba(244,114,182,0.22)' },
  padLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: T.accentDark,
    letterSpacing: 1,
  },
  guideBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '26%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(15,10,26,0.88)',
    borderWidth: 1,
    borderColor: T.accentPink,
  },
  guideText: { fontSize: 14, fontWeight: '900', color: T.accentDark },
  stageLabel: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(168,85,247,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.4)',
  },
  stageLabelText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: T.neonGlow,
  },
});
