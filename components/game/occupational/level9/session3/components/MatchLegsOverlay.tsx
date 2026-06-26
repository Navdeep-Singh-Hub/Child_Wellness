/** Match The Legs overlay — OT L9 S3 Game 2 */
import type { MatchLegsTheme } from '@/components/game/occupational/level9/session3/jointTheme';
import { LEGS_SHELL } from '@/components/game/occupational/level9/session3/jointTheme';
import { LegFigure } from '@/components/game/occupational/level9/session3/components/LegFigure';
import type { LegJointReadout, LegPoseTarget } from '@/components/game/occupational/level9/session3/jointUtils';
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
  theme: MatchLegsTheme;
  targetPose: LegPoseTarget;
  joints: LegJointReadout;
  matchScore: number;
  matched: boolean;
  holdProgress: number;
  lockProgress: number;
  locking: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  lockedCount: number;
  leftKnee: JointMarker;
  rightKnee: JointMarker;
  leftAnkle: JointMarker;
  rightAnkle: JointMarker;
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
        <View style={[styles.meterFill, { width: `${aPct}%`, backgroundColor: acc >= 0.8 ? LEGS_SHELL.good : color }]} />
        <View style={[styles.targetTick, { left: `${tPct}%` }]} />
      </View>
    </View>
  );
}

export function MatchLegsOverlay({
  theme,
  targetPose,
  joints,
  matchScore,
  matched,
  holdProgress,
  lockProgress,
  locking,
  previewing,
  roundActive,
  round,
  totalRounds,
  lockedCount,
  leftKnee,
  rightKnee,
  leftAnkle,
  rightAnkle,
  banner,
  quality,
  tolerance,
}: Props) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.18 + pulse.value * 0.32,
  }));

  const left = joints.left;
  const right = joints.right;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`leg-${i}`}
          style={[styles.decor, pulseStyle, { left: `${5 + (i * 15) % 88}%`, top: `${3 + (i % 4) * 8}%` }]}
        >
          {d}
        </Animated.Text>
      ))}

      {[leftKnee, rightKnee, leftAnkle, rightAnkle].map((m, i) =>
        m ? (
          <View
            key={`lm-${i}`}
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
              actual={left.lift}
              target={targetPose.leftLift}
              acc={jointAxisAccuracy(left.lift, targetPose.leftLift, tolerance)}
              color={theme.accent}
            />
            <JointMeter
              label="R↑"
              actual={right.lift}
              target={targetPose.rightLift}
              acc={jointAxisAccuracy(right.lift, targetPose.rightLift, tolerance)}
              color={theme.accentDeep}
            />
            <JointMeter
              label="L∠"
              actual={left.knee}
              target={targetPose.leftKnee}
              acc={jointAxisAccuracy(left.knee, targetPose.leftKnee, tolerance)}
              color={theme.joint}
            />
            <JointMeter
              label="R∠"
              actual={right.knee}
              target={targetPose.rightKnee}
              acc={jointAxisAccuracy(right.knee, targetPose.rightKnee, tolerance)}
              color={theme.joint}
            />
          </>
        )}
        <View style={styles.hudRow}>
          <Text style={[styles.statusBadge, { color: matched ? LEGS_SHELL.good : theme.joint }]}>
            {matched ? 'LEGS LOCKED' : previewing ? 'PREVIEW' : 'ADJUST'}
          </Text>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={styles.roundText}>
            Pose {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      <View style={styles.lockedRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.lockedDot, { opacity: i < lockedCount ? 1 : 0.25 }]}>
            {i < lockedCount ? theme.walkers[i % theme.walkers.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.duoRow}>
        <View style={styles.duoCard}>
          <Text style={styles.duoLabel}>TARGET</Text>
          <LegFigure pose={targetPose} accent={theme.accent} jointColor={theme.joint} compact matched={matched} />
        </View>
        {!previewing && (
          <View style={styles.duoCard}>
            <Text style={styles.duoLabel}>YOU</Text>
            <LegFigure
              pose={{
                ...targetPose,
                leftLift: left?.lift ?? 0,
                rightLift: right?.lift ?? 0,
                leftKnee: left?.knee ?? 0,
                rightKnee: right?.knee ?? 0,
              }}
              accent={matched ? LEGS_SHELL.good : theme.accentDeep}
              jointColor={theme.joint}
              compact
              matched={matched}
            />
          </View>
        )}
      </View>

      {roundActive && matched && !locking && (
        <View style={styles.holdRing}>
          <LinearGradient
            colors={[LEGS_SHELL.gold, LEGS_SHELL.good]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.holdFill, { width: `${holdProgress * 100}%` }]}
          />
        </View>
      )}
      {locking && (
        <Text style={styles.lockText}>LOCKING {Math.round(lockProgress * 100)}%</Text>
      )}

      {banner ? (
        <View style={[styles.banner, { backgroundColor: matched ? LEGS_SHELL.good : theme.accentDeep }]}>
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
    backgroundColor: 'rgba(26,46,5,0.9)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(163,230,53,0.35)',
  },
  hudTitle: { color: '#F7FEE7', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  meterBlock: { marginTop: 5 },
  meterLabel: { color: '#D9F99D', fontSize: 8, fontWeight: '800' },
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
    backgroundColor: LEGS_SHELL.gold,
  },
  hudRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, alignItems: 'center' },
  statusBadge: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  qualityText: { color: '#A3E635', fontSize: 11, fontWeight: '700' },
  roundText: { color: LEGS_SHELL.gold, fontSize: 11, fontWeight: '800' },
  lockedRow: {
    position: 'absolute',
    top: 118,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(26,46,5,0.55)',
    borderRadius: 16,
  },
  lockedDot: { fontSize: 14 },
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
    backgroundColor: 'rgba(26,46,5,0.5)',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(163,230,53,0.25)',
    minWidth: '42%',
  },
  duoLabel: { color: '#A3E635', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
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
  lockText: {
    position: 'absolute',
    bottom: '10%',
    alignSelf: 'center',
    color: LEGS_SHELL.gold,
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
