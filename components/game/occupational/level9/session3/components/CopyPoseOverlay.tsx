/** Copy The Pose overlay — OT L9 S3 Game 3 */
import type { CopyPoseTheme } from '@/components/game/occupational/level9/session3/jointTheme';
import { COPY_SHELL } from '@/components/game/occupational/level9/session3/jointTheme';
import { FullBodyFigure } from '@/components/game/occupational/level9/session3/components/FullBodyFigure';
import type { FullBodyPoseTarget, FullBodyReadout } from '@/components/game/occupational/level9/session3/jointUtils';
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

type Marker = { x: number; y: number } | null;

type Props = {
  theme: CopyPoseTheme;
  targetPose: FullBodyPoseTarget;
  readout: FullBodyReadout;
  matchScore: number;
  armsScore: number;
  legsScore: number;
  matched: boolean;
  holdProgress: number;
  mirrorProgress: number;
  mirroring: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  copiedCount: number;
  markers: {
    leftElbow: Marker;
    rightElbow: Marker;
    leftWrist: Marker;
    rightWrist: Marker;
    leftKnee: Marker;
    rightKnee: Marker;
    leftAnkle: Marker;
    rightAnkle: Marker;
  };
  banner: string;
  quality: number;
};

export function CopyPoseOverlay({
  theme,
  targetPose,
  readout,
  matchScore,
  armsScore,
  legsScore,
  matched,
  holdProgress,
  mirrorProgress,
  mirroring,
  previewing,
  roundActive,
  round,
  totalRounds,
  copiedCount,
  markers,
  banner,
  quality,
}: Props) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [shimmer]);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + shimmer.value * 0.4,
  }));

  const arms = readout.arms;
  const legs = readout.legs;
  const playerPose: FullBodyPoseTarget = {
    ...targetPose,
    leftRaise: arms.left?.raise ?? 0,
    rightRaise: arms.right?.raise ?? 0,
    leftElbow: arms.left?.elbow ?? 0,
    rightElbow: arms.right?.elbow ?? 0,
    leftLift: legs.left?.lift ?? 0,
    rightLift: legs.right?.lift ?? 0,
    leftKnee: legs.left?.knee ?? 0,
    rightKnee: legs.right?.knee ?? 0,
  };

  const jointDots = [
    markers.leftElbow,
    markers.rightElbow,
    markers.leftWrist,
    markers.rightWrist,
    markers.leftKnee,
    markers.rightKnee,
    markers.leftAnkle,
    markers.rightAnkle,
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`mirror-${i}`}
          style={[styles.decor, shimmerStyle, { left: `${4 + (i * 16) % 90}%`, top: `${2 + (i % 4) * 7}%` }]}
        >
          {d}
        </Animated.Text>
      ))}

      {jointDots.map((m, i) =>
        m ? (
          <View
            key={`jd-${i}`}
            style={[
              styles.jointDot,
              { left: `${m.x * 100}%`, top: `${m.y * 100}%`, backgroundColor: i < 4 ? theme.mirror : theme.accent },
            ]}
          />
        ) : null,
      )}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          {targetPose.name.toUpperCase()} · BODY {Math.round(matchScore * 100)}%
        </Text>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreChip}>ARMS {Math.round(armsScore * 100)}%</Text>
          <Text style={styles.scoreChip}>LEGS {Math.round(legsScore * 100)}%</Text>
          <Text style={[styles.statusBadge, { color: matched ? COPY_SHELL.good : theme.mirror }]}>
            {matched ? 'MIRRORED' : previewing ? 'PREVIEW' : 'COPY'}
          </Text>
        </View>
        <View style={styles.hudRow}>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={styles.roundText}>
            Pose {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      <View style={styles.copiedRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.copiedDot, { opacity: i < copiedCount ? 1 : 0.25 }]}>
            {i < copiedCount ? theme.poses[i % theme.poses.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.mirrorRow}>
        <View style={styles.mirrorCard}>
          <Text style={styles.mirrorLabel}>🪞 MIRROR</Text>
          <FullBodyFigure pose={targetPose} accent={theme.accent} jointColor={theme.mirror} compact matched={matched} />
        </View>
        {!previewing && (
          <View style={styles.mirrorCard}>
            <Text style={styles.mirrorLabel}>YOU</Text>
            <FullBodyFigure
              pose={playerPose}
              accent={matched ? COPY_SHELL.good : theme.accentDeep}
              jointColor={theme.mirror}
              compact
              matched={matched}
            />
          </View>
        )}
      </View>

      {roundActive && matched && !mirroring && (
        <View style={styles.holdRing}>
          <LinearGradient
            colors={[COPY_SHELL.gold, COPY_SHELL.good]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.holdFill, { width: `${holdProgress * 100}%` }]}
          />
        </View>
      )}
      {mirroring && (
        <Text style={styles.mirrorText}>REFLECTING {Math.round(mirrorProgress * 100)}%</Text>
      )}

      {banner ? (
        <View style={[styles.banner, { backgroundColor: matched ? COPY_SHELL.good : theme.accentDeep }]}>
          <Text style={styles.bannerText}>{banner}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  decor: { position: 'absolute', fontSize: 18 },
  jointDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    marginLeft: -6,
    marginTop: -6,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 4,
  },
  hudWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(46,16,101,0.9)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(232,121,249,0.35)',
  },
  hudTitle: { color: '#FDF4FF', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  scoreRow: { flexDirection: 'row', gap: 8, marginTop: 6, alignItems: 'center' },
  scoreChip: { color: '#F5D0FE', fontSize: 9, fontWeight: '800' },
  statusBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  hudRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  qualityText: { color: '#E879F9', fontSize: 11, fontWeight: '700' },
  roundText: { color: COPY_SHELL.gold, fontSize: 11, fontWeight: '800' },
  copiedRow: {
    position: 'absolute',
    top: 96,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(46,16,101,0.55)',
    borderRadius: 16,
  },
  copiedDot: { fontSize: 14 },
  mirrorRow: {
    position: 'absolute',
    top: '20%',
    left: 4,
    right: 4,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  mirrorCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(46,16,101,0.5)',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(245,208,254,0.25)',
    minWidth: '42%',
  },
  mirrorLabel: { color: '#F5D0FE', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 2 },
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
  mirrorText: {
    position: 'absolute',
    bottom: '10%',
    alignSelf: 'center',
    color: COPY_SHELL.gold,
    fontSize: 12,
    fontWeight: '900',
  },
  banner: {
    position: 'absolute',
    top: '56%',
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bannerText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
