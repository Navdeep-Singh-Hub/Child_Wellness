/** Robot arm figure for joint pose demonstration — OT L9 S3 */
import type { RobotArmPose } from '@/components/game/occupational/level9/session3/jointUtils';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const SHOULDER_Y = 52;
const SX_L = 48;
const SX_R = 102;
const UPPER_LEN = 38;
const FORE_LEN = 34;
const ARM_W = 10;

function jointToAngles(raise: number, elbow: number, side: 'left' | 'right'): { shoulder: number; elbow: number } {
  const shoulder = side === 'left' ? -20 - raise * 130 : 20 + raise * 130;
  const elbowFlex = 15 + elbow * 95;
  const elbowRot = side === 'left' ? elbowFlex : -elbowFlex;
  return { shoulder, elbow: elbowRot };
}

const RobotArm: React.FC<{
  side: 'left' | 'right';
  raise: number;
  elbow: number;
  color: string;
  jointColor: string;
  sx: number;
  matched?: boolean;
}> = ({ side, raise, elbow, color, jointColor, sx, matched }) => {
  const { shoulder, elbow: elbowRot } = jointToAngles(raise, elbow, side);
  return (
    <View style={{ position: 'absolute', left: sx - ARM_W / 2, top: SHOULDER_Y, width: ARM_W, height: UPPER_LEN + FORE_LEN }}>
      <View
        style={{
          width: ARM_W,
          height: UPPER_LEN,
          borderRadius: ARM_W / 2,
          backgroundColor: color,
          transform: [
            { translateY: -UPPER_LEN / 2 },
            { rotate: `${shoulder}deg` },
            { translateY: UPPER_LEN / 2 },
          ],
        }}
      >
        <View
          style={{
            position: 'absolute',
            bottom: -FORE_LEN + 4,
            left: 0,
            width: ARM_W,
            height: FORE_LEN,
            borderRadius: ARM_W / 2,
            backgroundColor: matched ? '#34D399' : color,
            transform: [
              { translateY: -FORE_LEN / 2 },
              { rotate: `${elbowRot}deg` },
              { translateY: FORE_LEN / 2 },
            ],
          }}
        >
          <View style={[styles.hand, { backgroundColor: jointColor, borderColor: color }]} />
        </View>
        <View style={[styles.jointDot, { backgroundColor: jointColor, bottom: -4 }]} />
      </View>
      <View style={[styles.jointDot, { backgroundColor: jointColor, top: -4 }]} />
    </View>
  );
};

export const RobotFigure: React.FC<{
  pose: RobotArmPose;
  accent: string;
  jointColor: string;
  label?: string;
  matched?: boolean;
  compact?: boolean;
}> = ({ pose, accent, jointColor, label, matched, compact }) => {
  const scale = compact ? 0.82 : 1;
  return (
    <View style={[styles.wrap, { transform: [{ scale }] }]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.body, { borderColor: accent }]}>
        <View style={[styles.head, { borderColor: accent, backgroundColor: accent }]}>
          <Text style={styles.face}>{pose.icon}</Text>
        </View>
        <View style={[styles.torso, { backgroundColor: accent }]} />
        <View style={[styles.leg, styles.legL, { backgroundColor: accent }]} />
        <View style={[styles.leg, styles.legR, { backgroundColor: accent }]} />
        <RobotArm
          side="left"
          raise={pose.leftRaise}
          elbow={pose.leftElbow}
          color={accent}
          jointColor={jointColor}
          sx={SX_L}
          matched={matched}
        />
        <RobotArm
          side="right"
          raise={pose.rightRaise}
          elbow={pose.rightElbow}
          color={accent}
          jointColor={jointColor}
          sx={SX_R}
          matched={matched}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  label: { color: '#A5F3FC', fontSize: 10, fontWeight: '900', letterSpacing: 0.6, marginBottom: 6 },
  body: { width: 150, height: 168, borderWidth: 2, borderRadius: 12, backgroundColor: 'rgba(12,25,41,0.65)' },
  head: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  face: { fontSize: 22 },
  torso: {
    position: 'absolute',
    top: 54,
    alignSelf: 'center',
    width: 36,
    height: 58,
    borderRadius: 8,
  },
  leg: { position: 'absolute', top: 110, width: 12, height: 48, borderRadius: 6 },
  legL: { left: 52 },
  legR: { right: 52 },
  jointDot: {
    position: 'absolute',
    alignSelf: 'center',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },
  hand: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
});
