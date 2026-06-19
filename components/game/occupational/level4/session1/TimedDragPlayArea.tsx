/**
 * Speed rush launch track for Quick Drag (OT L4 S1 Game 5).
 */
import { QUICK_DRAG_THEME as T } from '@/components/game/occupational/level4/session1/session1Theme';
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
  timerActive: boolean;
  timerPct: number;
  timeLeftMs: number;
  rushKey: number;
  streakCount: number;
};

export const TimedDragPlayArea: React.FC<Props> = ({
  roundActive,
  showGuide,
  isDragging,
  timerActive,
  timerPct,
  timeLeftMs,
  rushKey,
  streakCount,
}) => {
  const streakX = useSharedValue(0);
  const gatePulse = useSharedValue(0.5);
  const arrowX = useSharedValue(0);
  const urgentPulse = useSharedValue(0);
  const launchFlash = useSharedValue(0);

  const urgent = timerActive && timerPct < 28;

  useEffect(() => {
    if (!roundActive) return;
    streakX.value = withRepeat(
      withTiming(-40, { duration: 500, easing: Easing.linear }),
      -1,
      false,
    );
    gatePulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.35, { duration: 500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [roundActive, streakX, gatePulse]);

  useEffect(() => {
    if (!urgent) {
      urgentPulse.value = withTiming(0, { duration: 200 });
      return;
    }
    urgentPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 280 }),
        withTiming(0.2, { duration: 280 }),
      ),
      -1,
      true,
    );
  }, [urgent, urgentPulse]);

  useEffect(() => {
    if (!showGuide || !roundActive || !timerActive) {
      arrowX.value = 0;
      return;
    }
    arrowX.value = withRepeat(
      withSequence(
        withTiming(18, { duration: 420, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0, { duration: 420, easing: Easing.inOut(Easing.cubic) }),
      ),
      -1,
      true,
    );
  }, [showGuide, roundActive, timerActive, arrowX]);

  useEffect(() => {
    if (!rushKey) return;
    launchFlash.value = withSequence(
      withSpring(1, { damping: 6, stiffness: 240 }),
      withTiming(0, { duration: 500 }),
    );
  }, [rushKey, launchFlash]);

  useEffect(() => {
    if (!timerActive) return;
    launchFlash.value = withSequence(
      withTiming(1, { duration: 120 }),
      withTiming(0, { duration: 400 }),
    );
  }, [timerActive, launchFlash]);

  const streakStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: streakX.value }],
  }));

  const gateGlowStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + gatePulse.value * 0.55,
  }));

  const urgentStyle = useAnimatedStyle(() => ({
    opacity: urgentPulse.value * 0.55,
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: launchFlash.value * 0.7,
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: arrowX.value }],
    opacity: showGuide && roundActive && timerActive && !isDragging ? 0.95 : 0,
  }));

  if (!roundActive) return null;

  const timerColor = timerPct > 50 ? T.accentYellow : timerPct > 25 ? T.accent : '#EF4444';

  return (
    <>
      <LinearGradient
        colors={[T.trackDark, T.trackMid, '#292524']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.gridOverlay}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={`grid-${i}`} style={[styles.gridLine, { top: `${18 + i * 16}%` }]} />
        ))}
      </View>

      <Animated.View style={[styles.speedStreaks, streakStyle]}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <View
            key={`streak-${i}`}
            style={[
              styles.streak,
              {
                top: `${20 + (i % 4) * 18}%`,
                left: `${8 + i * 11}%`,
                width: 28 + (i % 3) * 12,
                opacity: 0.08 + (i % 2) * 0.06,
              },
            ]}
          />
        ))}
      </Animated.View>

      <Animated.View style={[styles.urgentFlash, urgentStyle]} pointerEvents="none" />

      <View style={styles.launchPad}>
        <Animated.View style={[styles.launchGlow, flashStyle]} />
        <View style={styles.padRing}>
          <View style={[styles.padRingInner, { borderColor: timerActive ? T.accent : '#57534E' }]} />
        </View>
        <Text style={styles.padLabel}>LAUNCH</Text>
        {!timerActive && <Text style={styles.padWait}>READY</Text>}
        {timerActive && (
          <Text style={[styles.padGo, { color: timerColor }]}>
            {timerPct > 50 ? 'GO!' : timerPct > 25 ? 'HURRY!' : 'NOW!'}
          </Text>
        )}
      </View>

      <View style={styles.trackLane}>
        <View style={styles.laneEdge} />
        <View style={styles.electricArc} />
        <View style={[styles.laneEdge, { bottom: 0, top: undefined }]} />
      </View>

      <View style={styles.finishGate}>
        <Animated.View style={[styles.gateGlow, gateGlowStyle, { backgroundColor: T.finishGate }]} />
        <View style={styles.gateFrame}>
          <View style={[styles.gatePillar, styles.gatePillarLeft]} />
          <View style={[styles.gatePillar, styles.gatePillarRight]} />
          <View style={styles.gateBeam} />
          <Text style={styles.gateFlag}>🏁</Text>
        </View>
        <Text style={styles.gateLabel}>FINISH</Text>
        <View style={styles.streakRow}>
          {Array.from({ length: Math.min(5, streakCount) }).map((_, i) => (
            <Text key={`bolt-${i}`} style={styles.streakBolt}>
              ⚡
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.timerRingWrap}>
        <View style={[styles.timerRingTrack, { borderColor: `${timerColor}44` }]}>
          <View
            style={[
              styles.timerRingFill,
              {
                width: `${timerPct}%`,
                backgroundColor: timerColor,
              },
            ]}
          />
        </View>
        <Text style={[styles.timerSecs, { color: timerColor }]}>
          {timerActive ? `${Math.max(0, Math.ceil(timeLeftMs / 1000))}s` : '—'}
        </Text>
      </View>

      <Animated.View style={[styles.rushArrow, arrowStyle]}>
        <Text style={styles.rushArrowText}>➜</Text>
        <Text style={styles.rushArrowHint}>Drag fast!</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: T.trackGlow,
  },
  speedStreaks: {
    ...StyleSheet.absoluteFillObject,
  },
  streak: {
    position: 'absolute',
    height: 3,
    backgroundColor: T.accentYellow,
    borderRadius: 2,
  },
  urgentFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#EF4444',
  },
  launchPad: {
    position: 'absolute',
    left: '5%',
    top: '30%',
    width: '22%',
    height: '44%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: T.trackGlow,
    borderRadius: 12,
    backgroundColor: T.launchPad,
    overflow: 'hidden',
  },
  launchGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: T.accentYellow,
  },
  padRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  padRingInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
  },
  padLabel: {
    position: 'absolute',
    top: 10,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: T.accentYellow,
  },
  padWait: {
    position: 'absolute',
    bottom: 12,
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
  },
  padGo: {
    position: 'absolute',
    bottom: 10,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  trackLane: {
    position: 'absolute',
    left: '30%',
    right: '30%',
    top: '38%',
    height: '28%',
    justifyContent: 'center',
  },
  laneEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(249,115,22,0.45)',
  },
  electricArc: {
    alignSelf: 'center',
    width: '80%',
    height: 2,
    backgroundColor: T.boltBlue,
    opacity: 0.35,
    shadowColor: T.boltBlue,
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  finishGate: {
    position: 'absolute',
    right: '5%',
    top: '26%',
    width: '24%',
    height: '52%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gateGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    transform: [{ scale: 1.06 }],
  },
  gateFrame: {
    width: '88%',
    height: '70%',
    borderWidth: 2,
    borderColor: T.finishGate,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  gatePillar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: T.finishGate,
    borderRadius: 2,
  },
  gatePillarLeft: { left: 0 },
  gatePillarRight: { right: 0 },
  gateBeam: {
    position: 'absolute',
    top: '22%',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: T.finishGate,
  },
  gateFlag: { fontSize: 32, marginTop: 8 },
  gateLabel: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: T.finishGate,
  },
  streakRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  streakBolt: { fontSize: 10 },
  timerRingWrap: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    left: '22%',
    right: '22%',
    alignItems: 'center',
  },
  timerRingTrack: {
    width: '100%',
    height: 8,
    borderRadius: 99,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  timerRingFill: {
    height: '100%',
    borderRadius: 99,
  },
  timerSecs: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  rushArrow: {
    position: 'absolute',
    left: '28%',
    top: '44%',
    alignItems: 'center',
  },
  rushArrowText: {
    fontSize: 32,
    color: T.accentYellow,
    fontWeight: '900',
    textShadowColor: T.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  rushArrowHint: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.85)',
  },
});
