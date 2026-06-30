/** Robot Arms overlay — OT L9 S3 Game 1 */
import type { RobotArmsTheme } from '@/components/game/occupational/level9/session3/jointTheme';
import { ROBOT_SHELL } from '@/components/game/occupational/level9/session3/jointTheme';
import { RobotFigure } from '@/components/game/occupational/level9/session3/components/RobotFigure';
import type { RobotArmPose, RobotJointReadout } from '@/components/game/occupational/level9/session3/jointUtils';
import { jointAxisAccuracy } from '@/components/game/occupational/level9/session3/jointUtils';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type JointMarker = { x: number; y: number } | null;

type Props = {
  theme: RobotArmsTheme;
  targetPose: RobotArmPose;
  joints: RobotJointReadout;
  matchScore: number;
  matched: boolean;
  holdProgress: number;
  calibrateProgress: number;
  calibrating: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  calibratedCount: number;
  leftElbow: JointMarker;
  rightElbow: JointMarker;
  leftWrist: JointMarker;
  rightWrist: JointMarker;
  banner: string;
  quality: number;
  tolerance: number;
};

function JointMeter({
  label,
  actual,
  target,
  acc,
  color,
}: {
  label: string;
  actual: number;
  target: number;
  acc: number;
  color: string;
}) {
  const aPct = Math.round(actual * 100);
  const tPct = Math.round(target * 100);
  return (
    <View style={styles.meterBlock}>
      <Text style={styles.meterLabel}>
        {label} {aPct}% → {tPct}%
      </Text>
      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, { width: `${aPct}%`, backgroundColor: acc >= 0.82 ? ROBOT_SHELL.good : color }]} />
        <View style={[styles.targetTick, { left: `${tPct}%` }]} />
      </View>
    </View>
  );
}

export function RobotArmsOverlay({
  theme,
  targetPose,
  joints,
  matchScore,
  matched,
  holdProgress,
  calibrateProgress,
  calibrating,
  previewing,
  roundActive,
  round,
  totalRounds,
  calibratedCount,
  leftElbow,
  rightElbow,
  leftWrist,
  rightWrist,
  banner,
  quality,
  tolerance,
}: Props) {
  const scan = useSharedValue(0);

  useEffect(() => {
    scan.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [scan]);

  const scanStyle = useAnimatedStyle(() => ({
    opacity: 0.15 + scan.value * 0.35,
  }));

  const left = joints.left;
  const right = joints.right;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`bot-${i}`}
          style={[styles.decor, scanStyle, { left: `${4 + (i * 16) % 90}%`, top: `${3 + (i % 4) * 8}%` }]}
        >
          {d}
        </Animated.Text>
      ))}

      {[leftElbow, rightElbow, leftWrist, rightWrist].map((m, i) =>
        m ? (
          <View
            key={`jm-${i}`}
            style={[
              styles.jointMarker,
              {
                left: `${m.x * 100}%`,
                top: `${m.y * 100}%`,
                backgroundColor: i < 2 ? theme.joint : theme.accent,
              },
            ]}
          />
        ) : null,
      )}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          {targetPose.name.toUpperCase()} · MATCH {Math.round(matchScore * 100)}%
        </Text>
        {left && right && (
          <>
            <JointMeter
              label="L↑"
              actual={left.raise}
              target={targetPose.leftRaise}
              acc={jointAxisAccuracy(left.raise, targetPose.leftRaise, tolerance)}
              color={theme.accent}
            />
            <JointMeter
              label="R↑"
              actual={right.raise}
              target={targetPose.rightRaise}
              acc={jointAxisAccuracy(right.raise, targetPose.rightRaise, tolerance)}
              color={theme.accentDeep}
            />
            <JointMeter
              label="L∠"
              actual={left.elbow}
              target={targetPose.leftElbow}
              acc={jointAxisAccuracy(left.elbow, targetPose.leftElbow, tolerance)}
              color={theme.joint}
            />
            <JointMeter
              label="R∠"
              actual={right.elbow}
              target={targetPose.rightElbow}
              acc={jointAxisAccuracy(right.elbow, targetPose.rightElbow, tolerance)}
              color={theme.joint}
            />
          </>
        )}
        <View style={styles.hudRow}>
          <Text style={[styles.statusBadge, { color: matched ? ROBOT_SHELL.good : theme.joint }]}>
            {matched ? 'JOINTS LOCKED' : previewing ? 'PREVIEW' : 'ADJUST'}
          </Text>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={styles.roundText}>
            Pose {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      <View style={styles.calibratedRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.calDot, { opacity: i < calibratedCount ? 1 : 0.25 }]}>
            {i < calibratedCount ? theme.robots[i % theme.robots.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.duoRow}>
        <View style={styles.duoCard}>
          <Text style={styles.duoLabel}>{previewing ? 'TARGET' : 'TARGET'}</Text>
          <RobotFigure pose={targetPose} accent={theme.accent} jointColor={theme.joint} compact matched={matched} />
        </View>
        {!previewing && (
          <View style={styles.duoCard}>
            <Text style={styles.duoLabel}>YOU</Text>
            <RobotFigure
              pose={{
                ...targetPose,
                leftRaise: left?.raise ?? 0,
                rightRaise: right?.raise ?? 0,
                leftElbow: left?.elbow ?? 0,
                rightElbow: right?.elbow ?? 0,
              }}
              accent={matched ? ROBOT_SHELL.good : theme.accentDeep}
              jointColor={theme.joint}
              compact
              matched={matched}
            />
          </View>
        )}
      </View>

      {roundActive && matched && !calibrating && (
        <View style={styles.holdRing}>
          <LinearGradient
            colors={[ROBOT_SHELL.gold, ROBOT_SHELL.good]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.holdFill, { width: `${holdProgress * 100}%` }]}
          />
        </View>
      )}
      {calibrating && (
        <Text style={styles.calText}>CALIBRATING {Math.round(calibrateProgress * 100)}%</Text>
      )}

      {banner ? (
        <View style={[styles.banner, { backgroundColor: matched ? ROBOT_SHELL.good : theme.accentDeep }]}>
          <Text style={styles.bannerText}>{banner}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  decor: { position: 'absolute', fontSize: 18 },
  jointMarker: {
    position: 'absolute',
    width: 14,
    height: 14,
    marginLeft: -7,
    marginTop: -7,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 5,
  },
  hudWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(12,25,41,0.9)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.35)',
  },
  hudTitle: { color: '#ECFEFF', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  meterBlock: { marginTop: 5 },
  meterLabel: { color: '#A5F3FC', fontSize: 8, fontWeight: '800' },
  meterTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 2,
    overflow: 'visible',
  },
  meterFill: { height: '100%', borderRadius: 3 },
  targetTick: {
    position: 'absolute',
    top: -2,
    width: 2,
    height: 10,
    marginLeft: -1,
    backgroundColor: ROBOT_SHELL.gold,
  },
  hudRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, alignItems: 'center' },
  statusBadge: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  qualityText: { color: '#67E8F9', fontSize: 11, fontWeight: '700' },
  roundText: { color: ROBOT_SHELL.gold, fontSize: 11, fontWeight: '800' },
  calibratedRow: {
    position: 'absolute',
    top: 118,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(12,25,41,0.55)',
    borderRadius: 16,
  },
  calDot: { fontSize: 14 },
  duoRow: {
    position: 'absolute',
    top: '22%',
    left: 4,
    right: 4,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  duoCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(12,25,41,0.5)',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.25)',
    minWidth: '42%',
  },
  duoLabel: { color: '#67E8F9', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  holdRing: {
    position: 'absolute',
    bottom: '14%',
    alignSelf: 'center',
    width: 120,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', borderRadius: 4 },
  calText: {
    position: 'absolute',
    bottom: '10%',
    alignSelf: 'center',
    color: ROBOT_SHELL.gold,
    fontSize: 12,
    fontWeight: '900',
  },
  banner: {
    position: 'absolute',
    top: '58%',
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bannerText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
