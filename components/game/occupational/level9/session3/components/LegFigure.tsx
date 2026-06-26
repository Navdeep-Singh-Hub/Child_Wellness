/** Mech leg figure for joint pose demonstration — OT L9 S3 */
import type { LegPoseTarget } from '@/components/game/occupational/level9/session3/jointUtils';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const HIP_Y = 72;
const HX_L = 52;
const HX_R = 98;
const THIGH = 42;
const SHIN = 38;
const LEG_W = 12;

function legAngles(lift: number, knee: number, side: 'left' | 'right'): { hip: number; knee: number } {
  const hip = side === 'left' ? -8 - lift * 55 : 8 + lift * 55;
  const kneeFlex = 12 + knee * 88;
  const kneeRot = side === 'left' ? kneeFlex : -kneeFlex;
  return { hip, knee: kneeRot };
}

const MechLeg: React.FC<{
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
    <View style={{ position: 'absolute', left: hx - LEG_W / 2, top: HIP_Y, width: LEG_W, height: THIGH + SHIN }}>
      <View
        style={{
          width: LEG_W,
          height: THIGH,
          borderRadius: LEG_W / 2,
          backgroundColor: color,
          transform: [
            { translateY: -THIGH / 2 },
            { rotate: `${hip}deg` },
            { translateY: THIGH / 2 },
          ],
        }}
      >
        <View
          style={{
            position: 'absolute',
            bottom: -SHIN + 4,
            left: 0,
            width: LEG_W,
            height: SHIN,
            borderRadius: LEG_W / 2,
            backgroundColor: matched ? '#34D399' : color,
            transform: [
              { translateY: -SHIN / 2 },
              { rotate: `${kneeRot}deg` },
              { translateY: SHIN / 2 },
            ],
          }}
        >
          <View style={[styles.foot, { backgroundColor: jointColor, borderColor: color }]} />
        </View>
        <View style={[styles.jointDot, { backgroundColor: jointColor, bottom: -4 }]} />
      </View>
      <View style={[styles.jointDot, { backgroundColor: jointColor, top: -4 }]} />
    </View>
  );
};

export const LegFigure: React.FC<{
  pose: LegPoseTarget;
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
        <View style={[styles.torso, { backgroundColor: accent }]}>
          <Text style={styles.icon}>{pose.icon}</Text>
        </View>
        <MechLeg
          side="left"
          lift={pose.leftLift}
          knee={pose.leftKnee}
          color={accent}
          jointColor={jointColor}
          hx={HX_L}
          matched={matched}
        />
        <MechLeg
          side="right"
          lift={pose.rightLift}
          knee={pose.rightKnee}
          color={accent}
          jointColor={jointColor}
          hx={HX_R}
          matched={matched}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  label: { color: '#D9F99D', fontSize: 10, fontWeight: '900', letterSpacing: 0.6, marginBottom: 6 },
  body: {
    width: 150,
    height: 168,
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(26,46,5,0.65)',
    alignItems: 'center',
  },
  torso: {
    position: 'absolute',
    top: 18,
    width: 44,
    height: 52,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 22 },
  jointDot: {
    position: 'absolute',
    alignSelf: 'center',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },
  foot: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    width: 14,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
  },
});
