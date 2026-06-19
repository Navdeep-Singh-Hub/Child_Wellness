/**
 * Split mirror-studio play area for Cross Reach (OT L4 S2 Game 4).
 */
import { CROSS_REACH_THEME as T } from '@/components/game/occupational/level4/session2/session2Theme';
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
  reachKey: number;
};

export const CrossReachPlayArea: React.FC<Props> = ({ roundActive, showGuide, isDragging, reachKey }) => {
  const mirrorShimmer = useSharedValue(0.3);
  const catchPulse = useSharedValue(0.5);
  const arrowX = useSharedValue(0);
  const arcGlow = useSharedValue(0.4);

  useEffect(() => {
    if (!roundActive) return;
    mirrorShimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.2, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    catchPulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 750 }), withTiming(0.35, { duration: 750 })),
      -1,
      true,
    );
    arcGlow.value = withRepeat(
      withSequence(withTiming(0.85, { duration: 1400 }), withTiming(0.25, { duration: 1400 })),
      -1,
      true,
    );
  }, [roundActive, mirrorShimmer, catchPulse, arcGlow]);

  useEffect(() => {
    if (!reachKey) return;
    catchPulse.value = withSequence(
      withSpring(1.4, { damping: 5, stiffness: 180 }),
      withTiming(0.5, { duration: 500 }),
    );
  }, [reachKey, catchPulse]);

  useEffect(() => {
    if (!showGuide || !roundActive) {
      arrowX.value = 0;
      return;
    }
    arrowX.value = withRepeat(
      withSequence(
        withTiming(-18, { duration: 600, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0, { duration: 600, easing: Easing.inOut(Easing.cubic) }),
      ),
      -1,
      true,
    );
  }, [showGuide, roundActive, arrowX]);

  const shimmerStyle = useAnimatedStyle(() => ({ opacity: 0.15 + mirrorShimmer.value * 0.45 }));
  const catchStyle = useAnimatedStyle(() => ({ opacity: 0.3 + catchPulse.value * 0.55 }));
  const arcStyle = useAnimatedStyle(() => ({ opacity: 0.2 + arcGlow.value * 0.5 }));
  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: arrowX.value }],
    opacity: showGuide && roundActive && !isDragging ? 0.95 : 0,
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={[T.leftGlow, T.studioDark, T.rightGlow]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.leftFloor} />
      <View style={styles.rightFloor} />

      <Animated.View style={[styles.mirrorStrip, shimmerStyle]} />
      <View style={styles.mirrorLine} />

      <Animated.View style={[styles.crossArc, arcStyle]} pointerEvents="none">
        <View style={styles.arcInner} />
      </Animated.View>

      <View style={styles.catchZone}>
        <Animated.View style={[styles.catchGlow, catchStyle]} />
        <Text style={styles.zoneLabel}>CATCH</Text>
        <Text style={styles.zoneEmoji}>{T.targetEmoji}</Text>
        <Text style={styles.zoneSub}>Mirror</Text>
      </View>

      <View style={styles.reachZone}>
        <Text style={styles.reachLabel}>REACH</Text>
        <View style={styles.handPad}>
          <Text style={styles.handPadEmoji}>{T.draggableEmoji}</Text>
        </View>
        <Text style={styles.zoneSub}>Right hand</Text>
      </View>

      <View style={styles.bodySilhouette} pointerEvents="none">
        <View style={styles.shoulder} />
        <View style={styles.torso} />
      </View>

      {[0, 1, 2].map((i) => (
        <View
          key={`dot-${i}`}
          style={[
            styles.floorDot,
            { left: `${28 + i * 22}%`, top: `${72 + (i % 2) * 4}%` },
          ]}
        />
      ))}

      <Animated.View style={[styles.reachArrow, arrowStyle]}>
        <Text style={styles.arrowEmoji}>⬅</Text>
        <Text style={styles.arrowHint}>Cross reach</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  leftFloor: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    backgroundColor: 'rgba(14,165,233,0.12)',
  },
  rightFloor: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    backgroundColor: 'rgba(249,115,22,0.14)',
  },
  mirrorStrip: {
    position: 'absolute',
    left: '48%',
    top: '8%',
    bottom: '8%',
    width: '4%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  mirrorLine: {
    position: 'absolute',
    left: '50%',
    top: '10%',
    bottom: '10%',
    width: 2,
    marginLeft: -1,
    backgroundColor: T.mirrorLine,
    opacity: 0.7,
  },
  crossArc: {
    position: 'absolute',
    left: '18%',
    right: '18%',
    top: '28%',
    height: '38%',
    borderTopWidth: 3,
    borderTopColor: T.accent,
    borderRadius: 999,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  arcInner: {
    position: 'absolute',
    left: '15%',
    right: '15%',
    top: 6,
    height: '70%',
    borderTopWidth: 1,
    borderTopColor: T.accentCoral,
    borderRadius: 999,
    opacity: 0.6,
  },
  catchZone: {
    position: 'absolute',
    left: '5%',
    top: '24%',
    width: '26%',
    height: '52%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: T.accent,
    borderRadius: 16,
    backgroundColor: 'rgba(14,165,233,0.12)',
    overflow: 'hidden',
  },
  catchGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: T.accent,
  },
  reachZone: {
    position: 'absolute',
    right: '5%',
    top: '24%',
    width: '26%',
    height: '52%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: T.accentWarm,
    borderRadius: 16,
    backgroundColor: 'rgba(249,115,22,0.12)',
  },
  zoneLabel: {
    position: 'absolute',
    top: 10,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: T.accent,
  },
  reachLabel: {
    position: 'absolute',
    top: 10,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: T.accentWarm,
  },
  zoneEmoji: { fontSize: 34, marginTop: 8 },
  zoneSub: {
    marginTop: 6,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: 'rgba(255,255,255,0.65)',
  },
  handPad: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(251,146,60,0.25)',
    borderWidth: 2,
    borderColor: T.accentCoral,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  handPadEmoji: { fontSize: 28 },
  bodySilhouette: {
    position: 'absolute',
    left: '44%',
    top: '52%',
    alignItems: 'center',
    opacity: 0.12,
  },
  shoulder: {
    width: 48,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
    marginBottom: 2,
  },
  torso: {
    width: 28,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  floorDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  reachArrow: {
    position: 'absolute',
    alignSelf: 'center',
    top: '42%',
    left: '38%',
    alignItems: 'center',
    zIndex: 4,
  },
  arrowEmoji: { fontSize: 32, color: '#F0F9FF' },
  arrowHint: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: T.accentDark,
  },
});
