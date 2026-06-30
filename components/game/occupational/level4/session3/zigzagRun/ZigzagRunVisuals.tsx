/**
 * Lightning canyon backdrop for Zigzag Run (OT L4 S3 Game 4).
 */
import { ZIGZAG_RUN_THEME as T } from '@/components/game/occupational/level4/session3/zigzagRun/zigzagRunTheme';
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
  isDragging: boolean;
  zapKey: number;
};

const STRATA = [0, 1, 2, 3, 4];

export const ZigzagRunPlayArea: React.FC<Props> = ({ roundActive, showGuide, isDragging, zapKey }) => {
  const boltPulse = useSharedValue(0.4);
  const gateGlow = useSharedValue(0.5);
  const crackFlash = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    boltPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.2, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    gateGlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 550 }), withTiming(0.3, { duration: 550 })),
      -1,
      true,
    );
  }, [roundActive, boltPulse, gateGlow]);

  useEffect(() => {
    if (!zapKey) return;
    gateGlow.value = withSequence(
      withSpring(1.5, { damping: 4, stiffness: 200 }),
      withTiming(0.5, { duration: 500 }),
    );
    crackFlash.value = withSequence(withTiming(1, { duration: 150 }), withTiming(0, { duration: 400 }));
  }, [zapKey, gateGlow, crackFlash]);

  useEffect(() => {
    if (!showGuide || !roundActive) return;
    crackFlash.value = withRepeat(
      withSequence(withTiming(0.6, { duration: 500 }), withTiming(0.1, { duration: 500 })),
      -1,
      true,
    );
  }, [showGuide, roundActive, crackFlash]);

  const boltStyle = useAnimatedStyle(() => ({ opacity: 0.2 + boltPulse.value * 0.5 }));
  const gateStyle = useAnimatedStyle(() => ({ opacity: 0.3 + gateGlow.value * 0.55 }));
  const crackStyle = useAnimatedStyle(() => ({ opacity: crackFlash.value * 0.35 }));
  const guideStyle = useAnimatedStyle(() => ({
    opacity: showGuide && roundActive && !isDragging ? 0.85 : 0,
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={[T.canyonDark, T.rockMid, '#1C1917']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.crackFlash, crackStyle]} pointerEvents="none" />

      {STRATA.map((i) => (
        <View
          key={`strata-${i}`}
          style={[
            styles.strata,
            { top: `${14 + i * 16}%`, opacity: 0.08 + (i % 2) * 0.05 },
          ]}
        />
      ))}

      <View style={styles.sparkStart}>
        <Animated.View style={[styles.sparkGlow, boltStyle]} />
        <Text style={styles.nodeLabel}>SPARK</Text>
        <Text style={styles.nodeEmoji}>✨</Text>
      </View>

      <View style={styles.thunderGate}>
        <Animated.View style={[styles.gateGlow, gateStyle]} />
        <Text style={styles.gateEmoji}>{T.targetEmoji}</Text>
        <Text style={styles.nodeLabel}>GATE</Text>
      </View>

      {[1, 2].map((n) => (
        <View
          key={`node-${n}`}
          style={[
            styles.checkNode,
            n === 1 ? styles.nodeMid1 : styles.nodeMid2,
          ]}
        >
          <Text style={styles.nodeNum}>{n}</Text>
        </View>
      ))}

      <Animated.View style={[styles.guideBolt, guideStyle]}>
        <Text style={styles.guideText}>⚡ Zigzag!</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  crackFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: T.boltGlow,
  },
  strata: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: '#57534E',
  },
  sparkStart: {
    position: 'absolute',
    left: '6%',
    top: '16%',
    width: '22%',
    height: '18%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: T.accentGold,
    borderRadius: 12,
    backgroundColor: 'rgba(12,10,9,0.55)',
    overflow: 'hidden',
  },
  sparkGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: T.accentGold,
  },
  thunderGate: {
    position: 'absolute',
    right: '5%',
    bottom: '14%',
    width: '26%',
    height: '22%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: T.accent,
    borderRadius: 14,
    backgroundColor: 'rgba(12,10,9,0.55)',
    overflow: 'hidden',
  },
  gateGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: T.accent,
  },
  gateEmoji: { fontSize: 30, zIndex: 2 },
  nodeLabel: {
    marginTop: 4,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: T.accentDark,
    zIndex: 2,
  },
  nodeEmoji: { fontSize: 22, zIndex: 2 },
  checkNode: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: T.accentElectric,
    backgroundColor: 'rgba(12,10,9,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeMid1: { left: '38%', top: '38%' },
  nodeMid2: { left: '58%', top: '52%' },
  nodeNum: {
    fontSize: 10,
    fontWeight: '900',
    color: T.accentGold,
  },
  guideBolt: {
    position: 'absolute',
    alignSelf: 'center',
    top: '42%',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(12,10,9,0.75)',
    borderWidth: 1,
    borderColor: T.accentGold,
  },
  guideText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: T.accentDark,
  },
});
