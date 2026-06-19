/**
 * Construction detour site for Detour Pass (OT L4 S6 Game 5).
 */
import { DETOUR_PASS_THEME as T } from '@/components/game/occupational/level4/session6/session6Theme';
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
  midlineCrossed: boolean;
  detourKey: number;
};

export const DetourPassPlayArea: React.FC<Props> = ({ roundActive, showGuide, midlineCrossed, detourKey }) => {
  const conePulse = useSharedValue(0.35);
  const barrierFlash = useSharedValue(0.3);
  const guideScale = useSharedValue(1);
  const detourBurst = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    conePulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    barrierFlash.value = withRepeat(
      withSequence(withTiming(0.9, { duration: 600 }), withTiming(0.35, { duration: 600 })),
      -1,
      true,
    );
  }, [roundActive, barrierFlash, conePulse]);

  useEffect(() => {
    if (!detourKey) return;
    detourBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 200 }),
      withTiming(0, { duration: 450 }),
    );
  }, [detourKey, detourBurst]);

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

  const coneStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + conePulse.value * 0.4,
  }));
  const barrierStyle = useAnimatedStyle(() => ({
    opacity: 0.45 + barrierFlash.value * 0.45,
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: detourBurst.value,
    transform: [{ scale: 0.85 + detourBurst.value * 0.3 }],
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={[T.siteDark, '#065F46', '#047857']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.groundStripe} />

      <Animated.View style={[styles.coneRow, coneStyle]}>
        <Text style={styles.cone}>🔶</Text>
        <Text style={styles.cone}>🔶</Text>
        <Text style={styles.cone}>🔶</Text>
      </Animated.View>

      <View style={styles.detourPath}>
        <View style={styles.pathUp} />
        <View style={styles.pathOver} />
        <Text style={styles.pathArrowUp}>↑</Text>
        <Text style={styles.pathArrowRight}>→</Text>
      </View>

      <View style={[styles.midlineGlow, midlineCrossed && styles.midlineCrossed]} />

      <Animated.View style={[styles.barrierZone, barrierStyle]}>
        <Text style={styles.barrierEmoji}>🚧</Text>
        <Text style={styles.barrierLabel}>BARRIER</Text>
      </Animated.View>

      <View style={[styles.phaseCue, midlineCrossed && styles.phaseCueGo]}>
        <Text style={styles.phaseCueText}>
          {midlineCrossed ? '🎯 AIM FOR GOAL!' : '↑ GO UP — THEN AROUND →'}
        </Text>
      </View>

      <Animated.View style={[styles.detourBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.detourBurstText}>🚧 DETOUR!</Text>
      </Animated.View>

      <Animated.View style={[styles.guideBadge, guideStyle]}>
        <Text style={styles.guideText}>Up, around the barrier, to goal!</Text>
      </Animated.View>

      <View style={styles.siteLabel}>
        <Text style={styles.siteLabelText}>DETOUR SITE</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  groundStripe: {
    position: 'absolute',
    bottom: '18%',
    left: '8%',
    right: '8%',
    height: 3,
    backgroundColor: 'rgba(251,191,36,0.25)',
    borderRadius: 2,
  },
  coneRow: {
    position: 'absolute',
    left: '10%',
    bottom: '22%',
    flexDirection: 'row',
    gap: 8,
  },
  cone: { fontSize: 14 },
  detourPath: {
    position: 'absolute',
    left: '14%',
    bottom: '28%',
    width: '55%',
    height: '38%',
  },
  pathUp: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 3,
    height: '72%',
    backgroundColor: 'rgba(251,191,36,0.45)',
    borderRadius: 2,
  },
  pathOver: {
    position: 'absolute',
    left: 0,
    top: '8%',
    width: '88%',
    height: 3,
    backgroundColor: 'rgba(251,191,36,0.45)',
    borderRadius: 2,
  },
  pathArrowUp: {
    position: 'absolute',
    left: -6,
    top: '30%',
    fontSize: 16,
    fontWeight: '900',
    color: T.barrierGlow,
  },
  pathArrowRight: {
    position: 'absolute',
    right: '8%',
    top: 0,
    fontSize: 16,
    fontWeight: '900',
    color: T.barrierGlow,
  },
  midlineGlow: {
    position: 'absolute',
    alignSelf: 'center',
    top: '12%',
    bottom: '12%',
    width: 4,
    borderRadius: 2,
    backgroundColor: T.midlineColor,
    opacity: 0.45,
  },
  midlineCrossed: {
    backgroundColor: T.barrierGlow,
    opacity: 1,
    shadowColor: T.barrierGlow,
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  barrierZone: {
    position: 'absolute',
    alignSelf: 'center',
    top: '46%',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(6,78,59,0.85)',
    borderWidth: 2,
    borderColor: T.barrierGlow,
    alignItems: 'center',
  },
  barrierEmoji: { fontSize: 22 },
  barrierLabel: { fontSize: 9, fontWeight: '900', color: T.barrierGlow, letterSpacing: 1 },
  phaseCue: {
    position: 'absolute',
    alignSelf: 'center',
    top: '12%',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(6,78,59,0.88)',
    borderWidth: 1,
    borderColor: T.accent,
  },
  phaseCueGo: { borderColor: T.barrierGlow },
  phaseCueText: { fontSize: 12, fontWeight: '900', color: T.accentDark },
  detourBurst: { position: 'absolute', alignSelf: 'center', top: '38%' },
  detourBurstText: { fontSize: 22, fontWeight: '900', color: T.barrierGlow },
  guideBadge: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: '24%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(6,78,59,0.88)',
    borderWidth: 1,
    borderColor: T.accent,
  },
  guideText: { fontSize: 14, fontWeight: '900', color: T.accentDark },
  siteLabel: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.35)',
  },
  siteLabelText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: T.accent,
  },
});
