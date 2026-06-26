/** Rhythm Move overlay — OT L9 S7 Game 5 */
import type { RhythmMoveTheme } from '@/components/game/occupational/level9/session7/movementCalibrationTheme';
import { MOVEMENT_CALIBRATION_SHELL } from '@/components/game/occupational/level9/session7/movementCalibrationTheme';
import type { RhythmMoveRound, CalibrationZoneStatus } from '@/components/game/occupational/level9/session7/movementCalibrationUtils';
import { lerpPoseTarget } from '@/components/game/occupational/level9/session7/movementCalibrationUtils';
import { FullBodyFigure } from '@/components/game/occupational/level9/session3/components/FullBodyFigure';
import type { FullBodyReadout } from '@/components/game/occupational/level9/session3/jointUtils';
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

type Props = {
  theme: RhythmMoveTheme;
  roundDef: RhythmMoveRound;
  readout: FullBodyReadout;
  rhythmPower: number;
  pathScore: number;
  beatScore: number;
  beatHits: number;
  currentBeat: number;
  beatPhase: number;
  inBeatWindow: boolean;
  armsScore: number;
  legsScore: number;
  targetEffort: number;
  effortStatus: CalibrationZoneStatus;
  holdProgress: number;
  grooveProgress: number;
  grooving: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  grooveCount: number;
  stageProgress: number;
  pathProgress: number;
  banner: string;
  quality: number;
  effortBandHalf: number;
};

export function RhythmMoveOverlay({
  theme,
  roundDef,
  readout,
  rhythmPower,
  pathScore,
  beatScore,
  beatHits,
  currentBeat,
  beatPhase,
  inBeatWindow,
  armsScore,
  legsScore,
  targetEffort,
  effortStatus,
  holdProgress,
  grooveProgress,
  grooving,
  previewing,
  roundActive,
  round,
  totalRounds,
  grooveCount,
  stageProgress,
  pathProgress,
  banner,
  quality,
  effortBandHalf,
}: Props) {
  const drum = useSharedValue(0);
  const groovePulse = useSharedValue(0);

  useEffect(() => {
    const ms = Math.max(280, roundDef.beatIntervalMs * 0.45);
    drum.value = withRepeat(
      withSequence(
        withTiming(1, { duration: ms, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: ms, easing: Easing.in(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [drum, roundDef.beatIntervalMs]);

  useEffect(() => {
    if (roundActive && inBeatWindow) {
      groovePulse.value = withTiming(1, { duration: 120 });
    } else {
      groovePulse.value = withTiming(0, { duration: 180 });
    }
  }, [roundActive, inBeatWindow, groovePulse]);

  const drumStyle = useAnimatedStyle(() => ({
    opacity: 0.24 + drum.value * 0.5,
    transform: [{ scale: 1 + drum.value * 0.14 }],
  }));

  const beatFlashStyle = useAnimatedStyle(() => ({
    opacity: groovePulse.value,
    transform: [{ scale: 1 + groovePulse.value * 0.1 }],
  }));

  const arms = readout.arms;
  const legs = readout.legs;
  const beatT = roundDef.beats > 0 ? beatHits / roundDef.beats : 0;
  const stepPose = lerpPoseTarget(roundDef.start, roundDef.end, beatT);
  const playerPose = {
    ...stepPose,
    leftRaise: arms.left?.raise ?? 0,
    rightRaise: arms.right?.raise ?? 0,
    leftElbow: arms.left?.elbow ?? 0,
    rightElbow: arms.right?.elbow ?? 0,
    leftLift: legs.left?.lift ?? 0,
    rightLift: legs.right?.lift ?? 0,
    leftKnee: legs.left?.knee ?? 0,
    rightKnee: legs.right?.knee ?? 0,
  };

  const powerPct = Math.round(rhythmPower * 100);
  const effortPct = Math.round(targetEffort * 100);
  const pathPct = Math.round(pathScore * 100);
  const beatPct = Math.round(beatScore * 100);
  const inZone = effortStatus === 'zone';
  const effortLow = targetEffort - effortBandHalf;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`rhythm-${i}`}
          style={[styles.decor, drumStyle, { left: `${4 + (i * 15) % 88}%`, top: `${2 + (i % 4) * 7}%` }]}
        >
          {d}
        </Animated.Text>
      ))}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          GROOVE {powerPct}% · BEATS {beatHits}/{roundDef.beats} · PATH {pathPct}%
        </Text>
        <View style={styles.meterTrack}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${Math.min(100, powerPct)}%`,
                backgroundColor: inZone ? MOVEMENT_CALIBRATION_SHELL.good : effortStatus === 'heavy' ? MOVEMENT_CALIBRATION_SHELL.warn : theme.accent,
              },
            ]}
          />
          <View style={[styles.zoneBand, { left: `${effortLow * 100}%`, width: `${effortBandHalf * 2 * 100}%` }]} />
          <View style={[styles.targetTick, { left: `${effortPct}%` }]} />
        </View>
        <View style={styles.hudRow}>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={[styles.zoneBadge, { color: inBeatWindow ? MOVEMENT_CALIBRATION_SHELL.gold : inZone ? MOVEMENT_CALIBRATION_SHELL.good : theme.beat }]}>
            {inBeatWindow ? 'ON BEAT' : inZone ? 'IN ZONE' : effortStatus === 'heavy' ? 'TOO STRONG' : 'MOVE'}
          </Text>
          <Text style={styles.roundText}>
            Groove {round + 1}/{totalRounds}
          </Text>
        </View>
        <View style={styles.segRow}>
          <Text style={styles.segChip}>RHYTHM {beatPct}%</Text>
          <Text style={styles.segChip}>ARMS {Math.round(armsScore * 100)}%</Text>
          <Text style={styles.segChip}>LEGS {Math.round(legsScore * 100)}%</Text>
        </View>
      </View>

      <View style={styles.beatsRow}>
        {Array.from({ length: roundDef.beats }).map((_, i) => (
          <Text
            key={`b-${i}`}
            style={[
              styles.beatDot,
              {
                opacity: i < beatHits ? 1 : i === currentBeat && inBeatWindow ? 1 : 0.3,
                transform: [{ scale: i === currentBeat && inBeatWindow ? 1.2 : 1 }],
              },
            ]}
          >
            {i < beatHits ? '🥁' : i === currentBeat ? '💥' : '○'}
          </Text>
        ))}
      </View>

      <View style={styles.beatBarWrap}>
        <Text style={styles.beatBarLabel}>🎵 BEAT {Math.round(beatPhase * 100)}%</Text>
        <View style={styles.beatBar}>
          <View
            style={[
              styles.beatFill,
              {
                width: `${beatPhase * 100}%`,
                backgroundColor: inBeatWindow ? MOVEMENT_CALIBRATION_SHELL.gold : theme.beat,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.stageWrap}>
        <Text style={styles.stageLabel}>🎶 STAGE {Math.round(stageProgress * 100)}%</Text>
        <View style={styles.stageBar}>
          <LinearGradient
            colors={[theme.accentDeep, theme.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.stageFill, { width: `${stageProgress * 100}%` }]}
          />
        </View>
      </View>

      <View style={styles.pathWrap}>
        <Text style={styles.pathLabel}>💃 PATH {Math.round(pathProgress * 100)}%</Text>
        <View style={styles.pathBar}>
          <View style={[styles.pathFill, { width: `${pathProgress * 100}%`, backgroundColor: theme.beat }]} />
        </View>
      </View>

      <View style={styles.groovesRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.grooveDot, { opacity: i < grooveCount ? 1 : 0.25 }]}>
            {i < grooveCount ? theme.grooves[i % theme.grooves.length] : '·'}
          </Text>
        ))}
      </View>

      {!previewing && (
        <Animated.View style={[styles.figureRow, beatFlashStyle]}>
          <View style={styles.figureCol}>
            <Text style={styles.figureLabel}>BEAT</Text>
            <FullBodyFigure pose={stepPose} accent={theme.beat} jointColor={theme.accentDeep} label={`${currentBeat + 1}`} compact />
          </View>
          <Text style={styles.arrow}>🥁</Text>
          <View style={styles.figureCol}>
            <Text style={styles.figureLabel}>TARGET</Text>
            <FullBodyFigure pose={roundDef.end} accent={theme.accent} jointColor={theme.beat} label={roundDef.label} compact />
          </View>
          <Text style={styles.arrow}>→</Text>
          <View style={styles.figureCol}>
            <Text style={styles.figureLabel}>YOU</Text>
            <FullBodyFigure
              pose={playerPose}
              accent={inZone && inBeatWindow ? MOVEMENT_CALIBRATION_SHELL.good : theme.accentDeep}
              jointColor={theme.beat}
              matched={inZone}
              compact
            />
          </View>
        </Animated.View>
      )}

      {previewing && (
        <View style={styles.previewWrap}>
          <Text style={styles.previewEmoji}>{roundDef.icon}</Text>
          <Text style={styles.previewText}>{roundDef.name}</Text>
          <Text style={styles.previewBeat}>{roundDef.beats} beats · effort {effortPct}%</Text>
        </View>
      )}

      {roundActive && inZone && !grooving && holdProgress > 0 && (
        <View style={styles.holdRingWrap}>
          <View style={styles.holdRing}>
            <View style={[styles.holdFill, { width: `${holdProgress * 100}%` }]} />
          </View>
        </View>
      )}

      {grooving && (
        <Text style={styles.grooveText}>GROOVING {Math.round(grooveProgress * 100)}%</Text>
      )}

      {banner ? (
        <View style={[styles.banner, { backgroundColor: inZone ? MOVEMENT_CALIBRATION_SHELL.good : theme.accentDeep }]}>
          <Text style={styles.bannerText}>{banner}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  decor: { position: 'absolute', fontSize: 18 },
  hudWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(80,7,36,0.92)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(244,114,182,0.35)',
  },
  hudTitle: { color: '#FCE7F3', fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
  meterTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginTop: 8,
    overflow: 'visible',
  },
  meterFill: { height: '100%', borderRadius: 5 },
  zoneBand: {
    position: 'absolute',
    top: -2,
    height: 14,
    backgroundColor: 'rgba(52,211,153,0.25)',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.45)',
  },
  targetTick: {
    position: 'absolute',
    top: -3,
    width: 3,
    height: 16,
    marginLeft: -1,
    backgroundColor: MOVEMENT_CALIBRATION_SHELL.gold,
    borderRadius: 1,
  },
  hudRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  qualityText: { color: '#FBCFE8', fontSize: 11, fontWeight: '700' },
  zoneBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  roundText: { color: MOVEMENT_CALIBRATION_SHELL.gold, fontSize: 11, fontWeight: '800' },
  segRow: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  segChip: {
    color: '#FCE7F3',
    fontSize: 8,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(244,114,182,0.18)',
  },
  beatsRow: {
    position: 'absolute',
    top: 118,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(80,7,36,0.55)',
    borderRadius: 16,
  },
  beatDot: { fontSize: 16 },
  beatBarWrap: { position: 'absolute', top: '17%', left: 14, right: 14 },
  beatBarLabel: { color: '#FBCFE8', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  beatBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  beatFill: { height: '100%', borderRadius: 4 },
  stageWrap: { position: 'absolute', top: '23%', left: 14, right: 14 },
  stageLabel: { color: '#F9A8D4', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  stageBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  stageFill: { height: '100%', borderRadius: 4 },
  pathWrap: { position: 'absolute', top: '29%', left: 14, right: 14 },
  pathLabel: { color: '#FBCFE8', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  pathBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  pathFill: { height: '100%', borderRadius: 3 },
  groovesRow: {
    position: 'absolute',
    top: 156,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(80,7,36,0.45)',
    borderRadius: 16,
  },
  grooveDot: { fontSize: 14 },
  figureRow: {
    position: 'absolute',
    top: '38%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  figureCol: { alignItems: 'center' },
  figureLabel: { color: '#FBCFE8', fontSize: 7, fontWeight: '900', letterSpacing: 0.6, marginBottom: 3 },
  arrow: { color: MOVEMENT_CALIBRATION_SHELL.gold, fontSize: 16, fontWeight: '900' },
  previewWrap: { position: 'absolute', top: '42%', alignSelf: 'center', alignItems: 'center' },
  previewEmoji: { fontSize: 68 },
  previewText: { color: '#FCE7F3', fontSize: 14, fontWeight: '800', marginTop: 8 },
  previewBeat: { color: '#F9A8D4', fontSize: 12, fontWeight: '900', marginTop: 4 },
  holdRingWrap: { position: 'absolute', bottom: '18%', alignSelf: 'center' },
  holdRing: {
    width: 120,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', backgroundColor: MOVEMENT_CALIBRATION_SHELL.good, borderRadius: 4 },
  grooveText: {
    position: 'absolute',
    bottom: '14%',
    alignSelf: 'center',
    color: MOVEMENT_CALIBRATION_SHELL.gold,
    fontSize: 13,
    fontWeight: '900',
  },
  banner: {
    position: 'absolute',
    bottom: '24%',
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bannerText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
