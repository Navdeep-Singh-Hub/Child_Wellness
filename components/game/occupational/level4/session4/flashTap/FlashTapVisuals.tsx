/**
 * Neon reaction grid for Flash Tap (OT L4 S4 Game 4).
 */
import { FLASH_TAP_THEME as T } from '@/components/game/occupational/level4/session4/flashTap/flashTapTheme';
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
  lightsOn: boolean;
  leftLit: boolean;
  rightLit: boolean;
  flashKey: number;
};

export const FlashTapPlayArea: React.FC<Props> = ({
  roundActive,
  showGuide,
  lightsOn,
  leftLit,
  rightLit,
  flashKey,
}) => {
  const scanY = useSharedValue(0);
  const guideScale = useSharedValue(1);
  const flashBurst = useSharedValue(0);
  const waitPulse = useSharedValue(0.4);

  useEffect(() => {
    if (!roundActive) return;
    scanY.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.linear }),
      -1,
      false,
    );
  }, [roundActive, scanY]);

  useEffect(() => {
    if (!roundActive || lightsOn) {
      waitPulse.value = 0.4;
      return;
    }
    waitPulse.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.3, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [roundActive, lightsOn, waitPulse]);

  useEffect(() => {
    if (!flashKey) return;
    flashBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 200 }),
      withTiming(0, { duration: 500 }),
    );
  }, [flashKey, flashBurst]);

  useEffect(() => {
    if (!showGuide || !roundActive) {
      guideScale.value = 1;
      return;
    }
    guideScale.value = withRepeat(
      withSequence(withTiming(1.1, { duration: 500 }), withTiming(1, { duration: 500 })),
      -1,
      true,
    );
  }, [showGuide, roundActive, guideScale]);

  const scanStyle = useAnimatedStyle(() => ({
    top: `${scanY.value * 85}%`,
    opacity: 0.25 + waitPulse.value * 0.2,
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: flashBurst.value,
    transform: [{ scale: 0.8 + flashBurst.value * 0.5 }],
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={[T.gridDark, '#0F172A', '#111827']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.grid}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={`v-${i}`} style={[styles.gridLineV, { left: `${15 + i * 17}%` }]} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <View key={`h-${i}`} style={[styles.gridLineH, { top: `${20 + i * 18}%` }]} />
        ))}
      </View>

      <Animated.View style={[styles.scanLine, scanStyle]} />

      <View style={[styles.neonLane, styles.leftLane, lightsOn && styles.laneLit, leftLit && styles.laneTapped]}>
        <Text style={[styles.laneLabel, lightsOn && styles.laneLabelLit]}>L</Text>
      </View>
      <View style={[styles.neonLane, styles.rightLane, lightsOn && styles.laneLitRed, rightLit && styles.laneTappedRed]}>
        <Text style={[styles.laneLabel, lightsOn && styles.laneLabelLitRed]}>R</Text>
      </View>

      {lightsOn && (
        <View style={styles.goSignal}>
          <Text style={styles.goSignalText}>⚡ GO!</Text>
        </View>
      )}

      {!lightsOn && roundActive && (
        <View style={styles.waitSignal}>
          <Text style={styles.waitSignalText}>WAIT…</Text>
        </View>
      )}

      <Animated.View style={[styles.flashBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.flashBurstText}>⚡ FLASH! ⚡</Text>
      </Animated.View>

      <Animated.View style={[styles.guideBadge, guideStyle]}>
        <Text style={styles.guideText}>👀 Wait for both!</Text>
      </Animated.View>

      <View style={styles.gridLabel}>
        <Text style={styles.gridLabelText}>REACTION GRID</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  grid: { ...StyleSheet.absoluteFillObject },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(34,211,238,0.06)',
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(34,211,238,0.06)',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: T.neonCyan,
    opacity: 0.35,
  },
  neonLane: {
    position: 'absolute',
    top: '30%',
    width: '22%',
    height: '38%',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(59,130,246,0.25)',
    backgroundColor: 'rgba(59,130,246,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftLane: { left: '12%' },
  rightLane: {
    right: '12%',
    borderColor: 'rgba(239,68,68,0.25)',
    backgroundColor: 'rgba(239,68,68,0.05)',
  },
  laneLit: {
    borderColor: T.accentBlue,
    backgroundColor: 'rgba(59,130,246,0.2)',
    shadowColor: T.accentBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  laneLitRed: {
    borderColor: T.neonRed,
    backgroundColor: 'rgba(239,68,68,0.2)',
    shadowColor: T.neonRed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  laneTapped: { backgroundColor: 'rgba(34,211,238,0.25)' },
  laneTappedRed: { backgroundColor: 'rgba(248,113,113,0.25)' },
  laneLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: 'rgba(59,130,246,0.4)',
    letterSpacing: 1,
  },
  laneLabelLit: { color: T.accentDark },
  laneLabelLitRed: { color: '#FECACA' },
  goSignal: {
    position: 'absolute',
    alignSelf: 'center',
    top: '18%',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(34,211,238,0.15)',
    borderWidth: 1,
    borderColor: T.neonCyan,
  },
  goSignalText: { fontSize: 16, fontWeight: '900', color: T.neonCyan },
  waitSignal: {
    position: 'absolute',
    alignSelf: 'center',
    top: '18%',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(15,23,42,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.3)',
  },
  waitSignalText: { fontSize: 14, fontWeight: '800', color: '#94A3B8', letterSpacing: 2 },
  flashBurst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '42%',
  },
  flashBurstText: { fontSize: 20, fontWeight: '900', color: T.neonCyan },
  guideBadge: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: '20%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(3,7,18,0.88)',
    borderWidth: 1,
    borderColor: T.neonCyan,
  },
  guideText: { fontSize: 14, fontWeight: '900', color: T.accentDark },
  gridLabel: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(34,211,238,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.3)',
  },
  gridLabelText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: T.neonCyan,
  },
});
