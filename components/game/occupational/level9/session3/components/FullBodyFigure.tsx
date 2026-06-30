/** Full-body figure for mirror pose copy — OT L9 S3 */
import type { FullBodyPoseTarget } from '@/components/game/occupational/level9/session3/jointUtils';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const SHOULDER_Y = 48;
const SX_L = 48;
const SX_R = 102;
const HIP_Y = 72;
const HX_L = 52;
const HX_R = 98;
const UPPER_ARM = 34;
const FORE_ARM = 30;
const THIGH = 38;
const SHIN = 34;
const LIMB_W = 10;

function armAngles(raise: number, elbow: number, side: 'left' | 'right') {
  const shoulder = side === 'left' ? -18 - raise * 125 : 18 + raise * 125;
  const elbowFlex = 14 + elbow * 90;
  return { shoulder, elbow: side === 'left' ? elbowFlex : -elbowFlex };
}

function legAngles(lift: number, knee: number, side: 'left' | 'right') {
  const hip = side === 'left' ? -6 - lift * 52 : 6 + lift * 52;
  const kneeFlex = 10 + knee * 85;
  return { hip, knee: side === 'left' ? kneeFlex : -kneeFlex };
}

const PoseArm: React.FC<{
  side: 'left' | 'right';
  raise: number;
  elbow: number;
  color: string;
  jointColor: string;
  sx: number;
  matched?: boolean;
}> = ({ side, raise, elbow, color, jointColor, sx, matched }) => {
  const { shoulder, elbow: elbowRot } = armAngles(raise, elbow, side);
  return (
    <View style={{ position: 'absolute', left: sx - LIMB_W / 2, top: SHOULDER_Y, width: LIMB_W, height: UPPER_ARM + FORE_ARM }}>
      <View
        style={{
          width: LIMB_W,
          height: UPPER_ARM,
          borderRadius: LIMB_W / 2,
          backgroundColor: color,
          transform: [{ translateY: -UPPER_ARM / 2 }, { rotate: `${shoulder}deg` }, { translateY: UPPER_ARM / 2 }],
        }}
      >
        <View
          style={{
            position: 'absolute',
            bottom: -FORE_ARM + 4,
            width: LIMB_W,
            height: FORE_ARM,
            borderRadius: LIMB_W / 2,
            backgroundColor: matched ? '#34D399' : color,
            transform: [{ translateY: -FORE_ARM / 2 }, { rotate: `${elbowRot}deg` }, { translateY: FORE_ARM / 2 }],
          }}
        />
        <View style={[styles.dot, { backgroundColor: jointColor, bottom: -3 }]} />
      </View>
    </View>
  );
};

const PoseLeg: React.FC<{
  side: 'left' | 'right';
  lift: number;
  knee: number;
  color: string;
  jointColor: string;
  hx: number;
  matched?: boolean;
}> = ({ side, lift, knee, color, jointColor, hx, matched }) => {
  const { hip, knee: kneeRot } = legAngles(lift, knee, side);
  return (
    <View style={{ position: 'absolute', left: hx - LIMB_W / 2, top: HIP_Y, width: LIMB_W, height: THIGH + SHIN }}>
      <View
        style={{
          width: LIMB_W,
          height: THIGH,
          borderRadius: LIMB_W / 2,
          backgroundColor: color,
          transform: [{ translateY: -THIGH / 2 }, { rotate: `${hip}deg` }, { translateY: THIGH / 2 }],
        }}
      >
        <View
          style={{
            position: 'absolute',
            bottom: -SHIN + 4,
            width: LIMB_W,
            height: SHIN,
            borderRadius: LIMB_W / 2,
            backgroundColor: matched ? '#34D399' : color,
            transform: [{ translateY: -SHIN / 2 }, { rotate: `${kneeRot}deg` }, { translateY: SHIN / 2 }],
          }}
        />
        <View style={[styles.dot, { backgroundColor: jointColor, bottom: -3 }]} />
      </View>
    </View>
  );
};

export const FullBodyFigure: React.FC<{
  pose: FullBodyPoseTarget;
  accent: string;
  jointColor: string;
  label?: string;
  matched?: boolean;
  compact?: boolean;
}> = ({ pose, accent, jointColor, label, matched, compact }) => (
  <View style={[styles.wrap, { transform: [{ scale: compact ? 0.78 : 1 }] }]}>
    {label ? <Text style={styles.label}>{label}</Text> : null}
    <View style={[styles.frame, { borderColor: accent }]}>
      <View style={[styles.head, { borderColor: accent, backgroundColor: accent }]}>
        <Text style={styles.face}>{pose.icon}</Text>
      </View>
      <View style={[styles.torso, { backgroundColor: accent }]} />
      <PoseArm side="left" raise={pose.leftRaise} elbow={pose.leftElbow} color={accent} jointColor={jointColor} sx={SX_L} matched={matched} />
      <PoseArm side="right" raise={pose.rightRaise} elbow={pose.rightElbow} color={accent} jointColor={jointColor} sx={SX_R} matched={matched} />
      <PoseLeg side="left" lift={pose.leftLift} knee={pose.leftKnee} color={accent} jointColor={jointColor} hx={HX_L} matched={matched} />
      <PoseLeg side="right" lift={pose.rightLift} knee={pose.rightKnee} color={accent} jointColor={jointColor} hx={HX_R} matched={matched} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  label: { color: '#F5D0FE', fontSize: 9, fontWeight: '900', letterSpacing: 0.6, marginBottom: 4 },
  frame: {
    width: 150,
    height: 168,
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(46,16,101,0.6)',
  },
  head: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  face: { fontSize: 20 },
  torso: {
    position: 'absolute',
    top: 48,
    alignSelf: 'center',
    width: 34,
    height: 28,
    borderRadius: 8,
  },
  dot: {
    position: 'absolute',
    alignSelf: 'center',
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },
});
