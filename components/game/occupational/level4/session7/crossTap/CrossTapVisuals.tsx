/**
 * Neural bridge backdrop for Cross Tap (OT L4 S7 Game 1).
 */
import { CROSS_TAP_THEME as T } from '@/components/game/occupational/level4/session7/crossTap/crossTapTheme';
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
  tapKey: number;
};

export const CrossTapPlayArea: React.FC<Props> = ({ roundActive, showGuide, tapKey }) => {
  const beamPulse = useSharedValue(0.3);
  const leftFlow = useSharedValue(0);
  const rightFlow = useSharedValue(0);
  const guideScale = useSharedValue(1);
  const tapBurst = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    beamPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.25, { duration: 800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    leftFlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 1100 }), withTiming(0, { duration: 100 })),
      -1,
      false,
    );
    rightFlow.value = withRepeat(
      withSequence(withTiming(0, { duration: 100 }), withTiming(1, { duration: 1100 })),
      -1,
      false,
    );
  }, [roundActive, beamPulse, leftFlow, rightFlow]);

  useEffect(() => {
    if (!tapKey) return;
    tapBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 200 }),
      withTiming(0, { duration: 450 }),
    );
  }, [tapKey, tapBurst]);

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

  const beamStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + beamPulse.value * 0.6,
    transform: [{ scaleY: 0.85 + beamPulse.value * 0.15 }],
  }));
  const leftSynapseStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + leftFlow.value * 0.7,
    transform: [{ translateX: -20 + leftFlow.value * 40 }],
  }));
  const rightSynapseStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + rightFlow.value * 0.7,
    transform: [{ translateX: 20 - rightFlow.value * 40 }],
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
        colors={['#0F172A', '#1E1B4B', '#312E81']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.leftZone}>
        <Text style={styles.zoneLabel}>⬅️ ARROW</Text>
      </View>
      <View style={styles.rightZone}>
        <Text style={styles.zoneLabel}>👉 HAND</Text>
      </View>

      <Animated.View style={[styles.midlineBeam, beamStyle]} />

      <Animated.View style={[styles.synapseLeft, leftSynapseStyle]}>
        <Text style={styles.synapseText}>⬅️ · · · ✦</Text>
      </Animated.View>
      <Animated.View style={[styles.synapseRight, rightSynapseStyle]}>
        <Text style={styles.synapseText}>✦ · · · 👉</Text>
      </Animated.View>

      <Animated.View style={[styles.crossGuide, guideStyle]} pointerEvents="none">
        <Text style={styles.guideText}>⬅️ → 👉</Text>
        <Text style={styles.guideSub}>Cross your body!</Text>
      </Animated.View>

      <Animated.View style={[styles.tapBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.burstText}>✦ CROSS ✦</Text>
      </Animated.View>

      <View style={styles.cornerDots}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={[styles.dot, { opacity: 0.15 + (i % 3) * 0.15 }]} />
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  leftZone: {
    position: 'absolute',
    left: 8,
    top: '18%',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(59,130,246,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.35)',
  },
  rightZone: {
    position: 'absolute',
    right: 8,
    top: '18%',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(244,63,94,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(251,113,133,0.35)',
  },
  zoneLabel: { fontSize: 10, fontWeight: '900', color: T.accentDark, letterSpacing: 0.5 },
  midlineBeam: {
    position: 'absolute',
    alignSelf: 'center',
    left: '48%',
    top: '12%',
    width: 4,
    height: '72%',
    borderRadius: 2,
    backgroundColor: T.bridgeGlow,
  },
  synapseLeft: {
    position: 'absolute',
    left: '8%',
    top: '42%',
  },
  synapseRight: {
    position: 'absolute',
    right: '8%',
    top: '52%',
  },
  synapseText: { fontSize: 14, fontWeight: '800', color: T.accentDark, letterSpacing: 2 },
  crossGuide: {
    position: 'absolute',
    alignSelf: 'center',
    top: '28%',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(49,46,129,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(129,140,248,0.45)',
  },
  guideText: { fontSize: 22, fontWeight: '900', color: '#E0E7FF' },
  guideSub: { fontSize: 11, fontWeight: '700', color: T.subtitleColor, marginTop: 2 },
  tapBurst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '36%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(129,140,248,0.35)',
  },
  burstText: { fontSize: 16, fontWeight: '900', color: '#EEF2FF', letterSpacing: 1 },
  cornerDots: {
    position: 'absolute',
    bottom: 140,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: T.accent,
  },
});
