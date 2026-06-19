/**
 * PoseFigure — a friendly stick-figure avatar that demonstrates a pose template
 * (arm zones + optional lean) so the child can clearly see what to copy.
 * Built from plain Views (no SVG dependency).
 */
import type { ArmZone, PoseTemplate } from '@/components/game/occupational/level8/session4/poseMatch';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

const BOX_W = 150;
const BOX_H = 168;
const SHOULDER_Y = 54;
const SX_L = 53;
const SX_R = 97;
const ARM_H = 50;
const ARM_W = 11;

/** Arm rotation (deg) measured so the free end swings outward/up from the shoulder. */
const armAngle = (side: 'left' | 'right', zone: ArmZone): number => {
  const mag = zone === 'up' ? 160 : zone === 'out' ? 92 : 18;
  return side === 'left' ? -mag : mag;
};

const Arm: React.FC<{ side: 'left' | 'right'; zone: ArmZone; color: string; x: number }> = ({ side, zone, color, x }) => {
  const angle = armAngle(side, zone);
  return (
    <View
      style={{
        position: 'absolute',
        left: x - ARM_W / 2,
        top: SHOULDER_Y,
        width: ARM_W,
        height: ARM_H,
        borderRadius: ARM_W / 2,
        backgroundColor: color,
        transform: [{ translateY: -ARM_H / 2 }, { rotate: `${angle}deg` }, { translateY: ARM_H / 2 }],
      }}
    >
      <View style={[styles.hand, { backgroundColor: color }]} />
    </View>
  );
};

export const PoseFigure: React.FC<{
  pose: PoseTemplate;
  accent: string;
  size?: number;
  animated?: boolean;
}> = ({ pose, accent, size = 1, animated = true }) => {
  const bob = useSharedValue(0);
  useEffect(() => {
    if (animated) {
      bob.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }), -1, true);
    } else {
      bob.value = 0;
    }
  }, [animated, bob, pose.id]);

  const leanDeg = pose.lean === 'left' ? -12 : pose.lean === 'right' ? 12 : 0;
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -bob.value * 4 }, { rotate: `${leanDeg}deg` }, { scale: size }],
  }));

  return (
    <Animated.View style={[styles.box, animStyle]}>
      {/* head */}
      <View style={[styles.head, { borderColor: accent }]} />
      {/* torso */}
      <View style={[styles.torso, { backgroundColor: accent }]} />
      {/* legs */}
      <View style={[styles.legLeft, { backgroundColor: accent }]} />
      <View style={[styles.legRight, { backgroundColor: accent }]} />
      {/* arms */}
      <Arm side="left" zone={pose.leftArm} color={accent} x={SX_L} />
      <Arm side="right" zone={pose.rightArm} color={accent} x={SX_R} />
      {/* lean arrow hint */}
      {pose.lean && (
        <Text style={[styles.leanArrow, pose.lean === 'left' ? styles.leanArrowLeft : styles.leanArrowRight]}>
          {pose.lean === 'left' ? '↙️' : '↘️'}
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  box: { width: BOX_W, height: BOX_H },
  head: {
    position: 'absolute',
    top: 12,
    left: BOX_W / 2 - 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  torso: { position: 'absolute', top: SHOULDER_Y, left: BOX_W / 2 - 5, width: 10, height: 60, borderRadius: 5 },
  legLeft: {
    position: 'absolute',
    top: SHOULDER_Y + 56,
    left: BOX_W / 2 - 4,
    width: 9,
    height: 46,
    borderRadius: 5,
    transform: [{ translateY: -23 }, { rotate: '18deg' }, { translateY: 23 }],
  },
  legRight: {
    position: 'absolute',
    top: SHOULDER_Y + 56,
    left: BOX_W / 2 - 4,
    width: 9,
    height: 46,
    borderRadius: 5,
    transform: [{ translateY: -23 }, { rotate: '-18deg' }, { translateY: 23 }],
  },
  hand: { position: 'absolute', bottom: -3, left: -2, width: ARM_W + 4, height: ARM_W + 4, borderRadius: (ARM_W + 4) / 2 },
  leanArrow: { position: 'absolute', bottom: 0, fontSize: 22 },
  leanArrowLeft: { left: 6 },
  leanArrowRight: { right: 6 },
});

export default PoseFigure;
