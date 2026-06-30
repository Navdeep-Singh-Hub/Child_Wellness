/** Match My Speed overlay — OT L9 S7 Game 3 */
import type { MatchMySpeedTheme } from '@/components/game/occupational/level9/session7/movementCalibrationTheme';
import { MOVEMENT_CALIBRATION_SHELL } from '@/components/game/occupational/level9/session7/movementCalibrationTheme';
import type {
  MatchSpeedRound,
  CalibrationZoneStatus,
  SpeedZoneStatus,
} from '@/components/game/occupational/level9/session7/movementCalibrationUtils';
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
  theme: MatchMySpeedTheme;
  roundDef: MatchSpeedRound;
  readout: FullBodyReadout;
  matchPower: number;
  pathScore: number;
  speedAccuracy: number;
  currentSpeed: number;
  armsScore: number;
  legsScore: number;
  targetEffort: number;
  effortStatus: CalibrationZoneStatus;
  speedStatus: SpeedZoneStatus;
  holdProgress: number;
  syncedProgress: number;
  syncing: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  beatCount: number;
  studioProgress: number;
  pathProgress: number;
  banner: string;
  quality: number;
  effortBandHalf: number;
  speedBandHalf: number;
};

export function MatchMySpeedOverlay({
  theme,
  roundDef,
  readout,
  matchPower,
  pathScore,
  speedAccuracy,
  currentSpeed,
  armsScore,
  legsScore,
  targetEffort,
  effortStatus,
  speedStatus,
  holdProgress,
  syncedProgress,
  syncing,
  previewing,
  roundActive,
  round,
  totalRounds,
  beatCount,
  studioProgress,
  pathProgress,
  banner,
  quality,
  effortBandHalf,
  speedBandHalf,
}: Props) {
  const beat = useSharedValue(0);
  const syncPulse = useSharedValue(0);

  useEffect(() => {
    const ms = Math.max(320, Math.round(900 - roundDef.targetSpeed * 520));
    beat.value = withRepeat(
      withSequence(
        withTiming(1, { duration: ms, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: ms, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [beat, roundDef.targetSpeed]);

  useEffect(() => {
    if (roundActive && effortStatus === 'zone' && speedStatus === 'zone') {
      syncPulse.value = withRepeat(
        withSequence(withTiming(1, { duration: 260 }), withTiming(0.2, { duration: 260 })),
        -1,
        false,
      );
    } else {
      syncPulse.value = withTiming(0, { duration: 180 });
    }
  }, [roundActive, effortStatus, speedStatus, syncPulse]);

  const beatStyle = useAnimatedStyle(() => ({
    opacity: 0.22 + beat.value * 0.45,
    transform: [{ scale: 1 + beat.value * 0.08 }],
  }));

  const syncStyle = useAnimatedStyle(() => ({
    opacity: syncPulse.value,
  }));

  const arms = readout.arms;
  const legs = readout.legs;
  const playerPose = {
    ...roundDef.end,
    leftRaise: arms.left?.raise ?? 0,
    rightRaise: arms.right?.raise ?? 0,
    leftElbow: arms.left?.elbow ?? 0,
    rightElbow: arms.right?.elbow ?? 0,
    leftLift: legs.left?.lift ?? 0,
    rightLift: legs.right?.lift ?? 0,
    leftKnee: legs.left?.knee ?? 0,
    rightKnee: legs.right?.knee ?? 0,
  };

  const powerPct = Math.round(matchPower * 100);
  const effortPct = Math.round(targetEffort * 100);
  const pathPct = Math.round(pathScore * 100);
  const speedPct = Math.round(speedAccuracy * 100);
  const pacePct = Math.round(currentSpeed * 100);
  const targetSpeedPct = Math.round(roundDef.targetSpeed * 100);
  const effortInZone = effortStatus === 'zone';
  const speedInZone = speedStatus === 'zone';
  const dualSync = effortInZone && speedInZone;
  const effortLow = targetEffort - effortBandHalf;
  const speedLow = roundDef.targetSpeed - speedBandHalf;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`match-${i}`}
          style={[styles.decor, beatStyle, { left: `${4 + (i * 15) % 88}%`, top: `${2 + (i % 4) * 7}%` }]}
        >
          {d}
        </Animated.Text>
      ))}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          MATCH {powerPct}% · PATH {pathPct}% · SPEED {speedPct}%
        </Text>

        <Text style={styles.meterLabel}>PACE {pacePct}% · TARGET {targetSpeedPct}%</Text>
        <View style={styles.meterTrack}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${Math.min(100, pacePct)}%`,
                backgroundColor: speedInZone ? MOVEMENT_CALIBRATION_SHELL.good : speedStatus === 'fast' ? MOVEMENT_CALIBRATION_SHELL.warn : theme.accent,
              },
            ]}
          />
          <View style={[styles.zoneBand, { left: `${speedLow * 100}%`, width: `${speedBandHalf * 2 * 100}%` }]} />
          <View style={[styles.targetTick, { left: `${targetSpeedPct}%` }]} />
        </View>

        <Text style={[styles.meterLabel, { marginTop: 8 }]}>EFFORT · TARGET {effortPct}%</Text>
        <View style={styles.meterTrack}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${Math.min(100, powerPct)}%`,
                backgroundColor: effortInZone ? MOVEMENT_CALIBRATION_SHELL.good : effortStatus === 'heavy' ? MOVEMENT_CALIBRATION_SHELL.warn : theme.pulse,
              },
            ]}
          />
          <View style={[styles.zoneBand, { left: `${effortLow * 100}%`, width: `${effortBandHalf * 2 * 100}%` }]} />
          <View style={[styles.targetTick, { left: `${effortPct}%` }]} />
        </View>

        <View style={styles.hudRow}>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={[styles.zoneBadge, { color: dualSync ? MOVEMENT_CALIBRATION_SHELL.good : theme.pulse }]}>
            {dualSync ? 'SYNCED' : speedStatus === 'slow' ? 'TOO SLOW' : speedStatus === 'fast' ? 'TOO FAST' : effortInZone ? 'PACE OK' : effortStatus === 'heavy' ? 'TOO STRONG' : 'ADJUST'}
          </Text>
          <Text style={styles.roundText}>
            Beat {round + 1}/{totalRounds}
          </Text>
        </View>
        <View style={styles.segRow}>
          <Text style={styles.segChip}>ARMS {Math.round(armsScore * 100)}%</Text>
          <Text style={styles.segChip}>LEGS {Math.round(legsScore * 100)}%</Text>
        </View>
      </View>

      <View style={styles.beatsRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.beatDot, { opacity: i < beatCount ? 1 : 0.25 }]}>
            {i < beatCount ? theme.beats[i % theme.beats.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.studioWrap}>
        <Text style={styles.studioLabel}>🎵 STUDIO {Math.round(studioProgress * 100)}%</Text>
        <View style={styles.studioBar}>
          <LinearGradient
            colors={[theme.accentDeep, theme.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.studioFill, { width: `${studioProgress * 100}%` }]}
          />
        </View>
      </View>

      <View style={styles.pathWrap}>
        <Text style={styles.pathLabel}>🎯 PATH {Math.round(pathProgress * 100)}%</Text>
        <View style={styles.pathBar}>
          <View style={[styles.pathFill, { width: `${pathProgress * 100}%`, backgroundColor: theme.pulse }]} />
        </View>
      </View>

      {!previewing && (
        <Animated.View style={[styles.figureRow, syncStyle]}>
          <View style={styles.figureCol}>
            <Text style={styles.figureLabel}>PACE</Text>
            <FullBodyFigure pose={roundDef.start} accent={theme.pulse} jointColor={theme.accentDeep} label="GO" compact />
          </View>
          <Text style={styles.arrow}>🎵</Text>
          <View style={styles.figureCol}>
            <Text style={styles.figureLabel}>TARGET</Text>
            <FullBodyFigure pose={roundDef.end} accent={theme.accent} jointColor={theme.pulse} label={roundDef.label} compact />
          </View>
          <Text style={styles.arrow}>→</Text>
          <View style={styles.figureCol}>
            <Text style={styles.figureLabel}>YOU</Text>
            <FullBodyFigure
              pose={playerPose}
              accent={dualSync ? MOVEMENT_CALIBRATION_SHELL.good : theme.accentDeep}
              jointColor={theme.pulse}
              matched={dualSync}
              compact
            />
          </View>
        </Animated.View>
      )}

      {previewing && (
        <View style={styles.previewWrap}>
          <Text style={styles.previewEmoji}>{roundDef.icon}</Text>
          <Text style={styles.previewText}>{roundDef.name}</Text>
          <Text style={styles.previewSpeed}>Target pace {targetSpeedPct}% · effort {effortPct}%</Text>
        </View>
      )}

      {roundActive && dualSync && !syncing && (
        <View style={styles.holdRingWrap}>
          <View style={styles.holdRing}>
            <View style={[styles.holdFill, { width: `${holdProgress * 100}%` }]} />
          </View>
        </View>
      )}

      {syncing && (
        <Text style={styles.syncedText}>SYNCING {Math.round(syncedProgress * 100)}%</Text>
      )}

      {banner ? (
        <View style={[styles.banner, { backgroundColor: dualSync ? MOVEMENT_CALIBRATION_SHELL.good : theme.accentDeep }]}>
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
    backgroundColor: 'rgba(4,47,46,0.92)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(45,212,191,0.35)',
  },
  hudTitle: { color: '#CCFBF1', fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
  meterLabel: { color: '#99F6E4', fontSize: 8, fontWeight: '800', marginTop: 6 },
  meterTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginTop: 4,
    overflow: 'visible',
  },
  meterFill: { height: '100%', borderRadius: 4 },
  zoneBand: {
    position: 'absolute',
    top: -2,
    height: 12,
    backgroundColor: 'rgba(52,211,153,0.25)',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.45)',
  },
  targetTick: {
    position: 'absolute',
    top: -3,
    width: 3,
    height: 14,
    marginLeft: -1,
    backgroundColor: MOVEMENT_CALIBRATION_SHELL.gold,
    borderRadius: 1,
  },
  hudRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  qualityText: { color: '#99F6E4', fontSize: 11, fontWeight: '700' },
  zoneBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  roundText: { color: MOVEMENT_CALIBRATION_SHELL.gold, fontSize: 11, fontWeight: '800' },
  segRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  segChip: {
    color: '#CCFBF1',
    fontSize: 8,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(45,212,191,0.18)',
  },
  beatsRow: {
    position: 'absolute',
    top: 148,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(4,47,46,0.55)',
    borderRadius: 16,
  },
  beatDot: { fontSize: 14 },
  studioWrap: { position: 'absolute', top: '18%', left: 14, right: 14 },
  studioLabel: { color: '#99F6E4', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  studioBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  studioFill: { height: '100%', borderRadius: 4 },
  pathWrap: { position: 'absolute', top: '24%', left: 14, right: 14 },
  pathLabel: { color: '#5EEAD4', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  pathBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  pathFill: { height: '100%', borderRadius: 3 },
  figureRow: {
    position: 'absolute',
    top: '36%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  figureCol: { alignItems: 'center' },
  figureLabel: { color: '#99F6E4', fontSize: 7, fontWeight: '900', letterSpacing: 0.6, marginBottom: 3 },
  arrow: { color: MOVEMENT_CALIBRATION_SHELL.gold, fontSize: 16, fontWeight: '900' },
  previewWrap: { position: 'absolute', top: '40%', alignSelf: 'center', alignItems: 'center' },
  previewEmoji: { fontSize: 68 },
  previewText: { color: '#CCFBF1', fontSize: 14, fontWeight: '800', marginTop: 8 },
  previewSpeed: { color: '#5EEAD4', fontSize: 12, fontWeight: '900', marginTop: 4 },
  holdRingWrap: { position: 'absolute', bottom: '18%', alignSelf: 'center' },
  holdRing: {
    width: 120,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', backgroundColor: MOVEMENT_CALIBRATION_SHELL.good, borderRadius: 4 },
  syncedText: {
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
