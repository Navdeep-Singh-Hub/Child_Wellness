/** Mirror Body overlay — OT L9 S3 Game 4 (opposite-side mirroring) */
import { FullBodyFigure } from '@/components/game/occupational/level9/session3/components/FullBodyFigure';
import type { MirrorBodyTheme } from '@/components/game/occupational/level9/session3/jointTheme';
import { MIRROR_BODY_SHELL } from '@/components/game/occupational/level9/session3/jointTheme';
import type { FullBodyPoseTarget, FullBodyReadout } from '@/components/game/occupational/level9/session3/jointUtils';
import { flipPoseSides } from '@/components/game/occupational/level9/session3/jointUtils';
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
  theme: MirrorBodyTheme;
  displayPose: FullBodyPoseTarget;
  readout: FullBodyReadout;
  matchScore: number;
  armsScore: number;
  legsScore: number;
  matched: boolean;
  holdProgress: number;
  reflectProgress: number;
  reflecting: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  mirroredCount: number;
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

export function MirrorBodyOverlay({
  theme,
  displayPose,
  readout,
  matchScore,
  armsScore,
  legsScore,
  matched,
  holdProgress,
  reflectProgress,
  reflecting,
  previewing,
  roundActive,
  round,
  totalRounds,
  mirroredCount,
  markers,
  banner,
  quality,
}: Props) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [shimmer]);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: 0.18 + shimmer.value * 0.42,
  }));

  const expectedPose = flipPoseSides(displayPose);
  const arms = readout.arms;
  const legs = readout.legs;
  const playerPose: FullBodyPoseTarget = {
    ...displayPose,
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
          key={`crystal-${i}`}
          style={[styles.decor, shimmerStyle, { left: `${3 + (i * 17) % 88}%`, top: `${2 + (i % 5) * 6}%` }]}
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
              { left: `${m.x * 100}%`, top: `${m.y * 100}%`, backgroundColor: i < 4 ? theme.reflect : theme.accent },
            ]}
          />
        ) : null,
      )}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          {displayPose.name.toUpperCase()} · REFLECT {Math.round(matchScore * 100)}%
        </Text>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreChip}>ARMS {Math.round(armsScore * 100)}%</Text>
          <Text style={styles.scoreChip}>LEGS {Math.round(legsScore * 100)}%</Text>
          <Text style={[styles.statusBadge, { color: matched ? MIRROR_BODY_SHELL.good : theme.reflect }]}>
            {matched ? 'REFLECTED' : previewing ? 'PREVIEW' : 'MIRROR'}
          </Text>
        </View>
        <Text style={styles.oppositeHint}>↔️ Use your OPPOSITE side!</Text>
        <View style={styles.hudRow}>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={styles.roundText}>
            Reflect {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      <View style={styles.reflectRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.reflectDot, { opacity: i < mirroredCount ? 1 : 0.25 }]}>
            {i < mirroredCount ? theme.reflections[i % theme.reflections.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.mirrorRow}>
        <View style={styles.mirrorCard}>
          <Text style={styles.mirrorLabel}>🪩 REFLECTION</Text>
          <FullBodyFigure pose={displayPose} accent={theme.accent} jointColor={theme.reflect} compact matched={matched} />
        </View>
        {!previewing && (
          <View style={styles.mirrorCard}>
            <Text style={styles.mirrorLabel}>YOU (OPPOSITE)</Text>
            <FullBodyFigure
              pose={playerPose}
              accent={matched ? MIRROR_BODY_SHELL.good : theme.accentDeep}
              jointColor={theme.reflect}
              compact
              matched={matched}
            />
            <Text style={styles.targetHint}>
              Need: L↑{Math.round(expectedPose.leftRaise * 100)} R↑{Math.round(expectedPose.rightRaise * 100)}
            </Text>
          </View>
        )}
      </View>

      {roundActive && matched && !reflecting && (
        <View style={styles.holdRing}>
          <LinearGradient
            colors={[MIRROR_BODY_SHELL.gold, MIRROR_BODY_SHELL.good]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.holdFill, { width: `${holdProgress * 100}%` }]}
          />
        </View>
      )}
      {reflecting && (
        <Text style={styles.reflectText}>CRYSTALLIZING {Math.round(reflectProgress * 100)}%</Text>
      )}

      {banner ? (
        <View style={[styles.banner, { backgroundColor: matched ? MIRROR_BODY_SHELL.good : theme.accentDeep }]}>
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
    backgroundColor: 'rgba(12,74,110,0.92)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.35)',
  },
  hudTitle: { color: '#F0F9FF', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  scoreRow: { flexDirection: 'row', gap: 8, marginTop: 6, alignItems: 'center' },
  scoreChip: { color: '#BAE6FD', fontSize: 9, fontWeight: '800' },
  statusBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  oppositeHint: { color: '#7DD3FC', fontSize: 9, fontWeight: '800', marginTop: 4, letterSpacing: 0.3 },
  hudRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  qualityText: { color: '#38BDF8', fontSize: 11, fontWeight: '700' },
  roundText: { color: MIRROR_BODY_SHELL.gold, fontSize: 11, fontWeight: '800' },
  reflectRow: {
    position: 'absolute',
    top: 104,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(12,74,110,0.55)',
    borderRadius: 16,
  },
  reflectDot: { fontSize: 14 },
  mirrorRow: {
    position: 'absolute',
    top: '21%',
    left: 4,
    right: 4,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  mirrorCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(12,74,110,0.5)',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(165,243,252,0.25)',
    minWidth: '42%',
  },
  mirrorLabel: { color: '#BAE6FD', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 2 },
  targetHint: { color: '#7DD3FC', fontSize: 7, fontWeight: '700', marginTop: 2 },
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
  reflectText: {
    position: 'absolute',
    bottom: '10%',
    alignSelf: 'center',
    color: MIRROR_BODY_SHELL.gold,
    fontSize: 12,
    fontWeight: '900',
  },
  banner: {
    position: 'absolute',
    top: '57%',
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bannerText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
