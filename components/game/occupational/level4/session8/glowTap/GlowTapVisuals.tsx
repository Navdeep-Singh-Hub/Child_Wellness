/**
 * Neon panel backdrop for Glow Tap (OT L4 S8 Game 1).
 */
import { GLOW_TAP_THEME as T } from '@/components/game/occupational/level4/session8/glowTap/glowTapTheme';
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
  glowKey: number;
  activeSide: Side | null;
};

export const GlowTapPlayArea: React.FC<Props> = ({ roundActive, showGuide, glowKey, activeSide }) => {
  const neonPulse = useSharedValue(0.2);
  const scanLine = useSharedValue(0);
  const guideScale = useSharedValue(1);
  const tapBurst = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    neonPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 650, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.15, { duration: 650, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    scanLine.value = withRepeat(
      withSequence(withTiming(1, { duration: 1400 }), withTiming(0, { duration: 100 })),
      -1,
      false,
    );
  }, [roundActive, neonPulse, scanLine]);

  useEffect(() => {
    if (!glowKey) return;
    tapBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 200 }),
      withTiming(0, { duration: 450 }),
    );
  }, [glowKey, tapBurst]);

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

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.15 + neonPulse.value * 0.5,
  }));
  const scanStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + scanLine.value * 0.55,
    transform: [{ translateY: -30 + scanLine.value * 60 }],
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: tapBurst.value,
    transform: [{ scale: 0.85 + tapBurst.value * 0.35 }],
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={['#0C1929', '#0F2744', '#1E3A5F']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.panelZone, styles.leftZone, activeSide === 'left' && styles.leftZoneActive]} />
      <View style={[styles.panelZone, styles.rightZone, activeSide === 'right' && styles.rightZoneActive]} />

      <Animated.View style={[styles.neonBeam, pulseStyle]} />
      <Animated.View style={[styles.scanLine, scanStyle]} />

      <View style={styles.midDivider}>
        <Text style={styles.dividerText}>↔</Text>
      </View>

      <Animated.View style={[styles.glowGuide, guideStyle]} pointerEvents="none">
        <Text style={styles.guideText}>💡 TAP THE GLOW</Text>
        <Text style={styles.guideSub}>Watch which side lights up!</Text>
      </Animated.View>

      <Animated.View style={[styles.tapBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.burstText}>✦ GLOW ✦</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  panelZone: {
    position: 'absolute',
    top: '18%',
    bottom: '18%',
    width: '42%',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(96,165,250,0.15)',
    backgroundColor: 'rgba(15,39,68,0.35)',
  },
  leftZone: { left: '4%' },
  rightZone: { right: '4%' },
  leftZoneActive: {
    borderColor: 'rgba(59,130,246,0.55)',
    backgroundColor: 'rgba(59,130,246,0.12)',
  },
  rightZoneActive: {
    borderColor: 'rgba(244,63,94,0.55)',
    backgroundColor: 'rgba(244,63,94,0.12)',
  },
  neonBeam: {
    position: 'absolute',
    alignSelf: 'center',
    top: '20%',
    width: 4,
    height: '60%',
    borderRadius: 2,
    backgroundColor: T.neonPulse,
  },
  scanLine: {
    position: 'absolute',
    alignSelf: 'center',
    left: '8%',
    right: '8%',
    height: 2,
    borderRadius: 1,
    backgroundColor: T.accent,
  },
  midDivider: {
    position: 'absolute',
    alignSelf: 'center',
    top: '12%',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(12,25,41,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.3)',
  },
  dividerText: { fontSize: 14, fontWeight: '900', color: T.accentDark },
  glowGuide: {
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
  guideText: { fontSize: 16, fontWeight: '900', color: '#EFF6FF' },
  guideSub: { fontSize: 11, fontWeight: '700', color: T.subtitleColor, marginTop: 2 },
  tapBurst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '44%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(96,165,250,0.35)',
  },
  burstText: { fontSize: 16, fontWeight: '900', color: '#EFF6FF', letterSpacing: 1 },
});
