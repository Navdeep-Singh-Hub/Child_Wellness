/**
 * Arena court backdrop for Rally Tap (OT L4 S8 Game 2).
 */
import { RALLY_TAP_THEME as T } from '@/components/game/occupational/level4/session8/session8Theme';
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
  rallyKey: number;
  centerReady: boolean;
  ballVisible: boolean;
};

export const RallyTapPlayArea: React.FC<Props> = ({ roundActive, showGuide, rallyKey, centerReady, ballVisible }) => {
  const linePulse = useSharedValue(0.2);
  const netFlash = useSharedValue(0);
  const guideScale = useSharedValue(1);
  const rallyBurst = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    linePulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.15, { duration: 800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    netFlash.value = withRepeat(
      withSequence(withTiming(0.7, { duration: 500 }), withTiming(0.2, { duration: 500 })),
      -1,
      true,
    );
  }, [roundActive, linePulse, netFlash]);

  useEffect(() => {
    if (!rallyKey) return;
    rallyBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 200 }),
      withTiming(0, { duration: 450 }),
    );
  }, [rallyKey, rallyBurst]);

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

  const lineStyle = useAnimatedStyle(() => ({
    opacity: 0.15 + linePulse.value * 0.45,
  }));
  const netStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + netFlash.value * 0.55,
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: rallyBurst.value,
    transform: [{ scale: 0.85 + rallyBurst.value * 0.35 }],
  }));
  const centerGlowStyle = useAnimatedStyle(() => ({
    opacity: centerReady ? 0.45 + linePulse.value * 0.35 : 0.1,
    transform: [{ scale: centerReady ? 1 + linePulse.value * 0.06 : 1 }],
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={['#052E16', '#14532D', '#166534']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.courtLine, styles.lineTop, lineStyle]} />
      <Animated.View style={[styles.courtLine, styles.lineMid, lineStyle]} />
      <Animated.View style={[styles.courtLine, styles.lineBot, lineStyle]} />

      <Animated.View style={[styles.net, netStyle]}>
        <Text style={styles.netText}>NET</Text>
      </Animated.View>

      <Animated.View style={[styles.centerGlow, centerGlowStyle]} />

      {ballVisible && (
        <View style={styles.rallyHint}>
          <Text style={styles.rallyHintText}>🏓 crossing…</Text>
        </View>
      )}

      <Animated.View style={[styles.rallyGuide, guideStyle]} pointerEvents="none">
        <Text style={styles.guideText}>🏓 TAP AT CENTER</Text>
        <Text style={styles.guideSub}>When the circle glows!</Text>
      </Animated.View>

      <Animated.View style={[styles.rallyBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.burstText}>✦ RALLY ✦</Text>
      </Animated.View>

      <View style={styles.cornerMarks}>
        <Text style={styles.corner}>◢</Text>
        <Text style={styles.corner}>◣</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  courtLine: {
    position: 'absolute',
    alignSelf: 'center',
    left: '6%',
    right: '6%',
    height: 2,
    borderRadius: 1,
    backgroundColor: T.courtLine,
  },
  lineTop: { top: '22%' },
  lineMid: { top: '50%', height: 3, backgroundColor: T.accent },
  lineBot: { bottom: '22%' },
  net: {
    position: 'absolute',
    alignSelf: 'center',
    top: '46%',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(5,46,22,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(110,231,183,0.4)',
  },
  netText: { fontSize: 9, fontWeight: '900', color: T.accentDark, letterSpacing: 1 },
  centerGlow: {
    position: 'absolute',
    alignSelf: 'center',
    top: '32%',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(74,222,128,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(74,222,128,0.35)',
  },
  rallyHint: {
    position: 'absolute',
    alignSelf: 'center',
    top: '14%',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(5,46,22,0.65)',
  },
  rallyHintText: { fontSize: 11, fontWeight: '800', color: T.subtitleColor },
  rallyGuide: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 100,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(5,46,22,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.45)',
  },
  guideText: { fontSize: 16, fontWeight: '900', color: '#F0FDF4' },
  guideSub: { fontSize: 11, fontWeight: '700', color: T.subtitleColor, marginTop: 2 },
  rallyBurst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '40%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(74,222,128,0.35)',
  },
  burstText: { fontSize: 16, fontWeight: '900', color: '#F0FDF4', letterSpacing: 1 },
  cornerMarks: {
    position: 'absolute',
    top: '20%',
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  corner: { fontSize: 18, color: 'rgba(134,239,172,0.35)', fontWeight: '900' },
});
