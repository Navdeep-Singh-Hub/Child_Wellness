/** Speed Control overlay — OT L9 S7 Game 4 */
import type { SpeedControlTheme } from '@/components/game/occupational/level9/session7/movementCalibrationTheme';
import { MOVEMENT_CALIBRATION_SHELL } from '@/components/game/occupational/level9/session7/movementCalibrationTheme';
import type {
  SpeedControlRound,
  CalibrationZoneStatus,
  BracketZoneStatus,
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
  theme: SpeedControlTheme;
  roundDef: SpeedControlRound;
  readout: FullBodyReadout;
  controlPower: number;
  pathScore: number;
  bracketScore: number;
  stability: number;
  currentSpeed: number;
  armsScore: number;
  legsScore: number;
  targetEffort: number;
  effortStatus: CalibrationZoneStatus;
  bracketStatus: BracketZoneStatus;
  holdProgress: number;
  sealProgress: number;
  sealing: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  laneCount: number;
  arenaProgress: number;
  pathProgress: number;
  banner: string;
  quality: number;
  effortBandHalf: number;
};

export function SpeedControlOverlay({
  theme,
  roundDef,
  readout,
  controlPower,
  pathScore,
  bracketScore,
  stability,
  currentSpeed,
  armsScore,
  legsScore,
  targetEffort,
  effortStatus,
  bracketStatus,
  holdProgress,
  sealProgress,
  sealing,
  previewing,
  roundActive,
  round,
  totalRounds,
  laneCount,
  arenaProgress,
  pathProgress,
  banner,
  quality,
  effortBandHalf,
}: Props) {
  const lanePulse = useSharedValue(0);
  const sealPulse = useSharedValue(0);

  useEffect(() => {
    lanePulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 840, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 840, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [lanePulse]);

  useEffect(() => {
    if (roundActive && effortStatus === 'zone' && bracketStatus === 'in') {
      sealPulse.value = withRepeat(
        withSequence(withTiming(1, { duration: 250 }), withTiming(0.2, { duration: 250 })),
        -1,
        false,
      );
    } else {
      sealPulse.value = withTiming(0, { duration: 180 });
    }
  }, [roundActive, effortStatus, bracketStatus, sealPulse]);

  const laneStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + lanePulse.value * 0.38,
  }));

  const sealStyle = useAnimatedStyle(() => ({
    opacity: sealPulse.value,
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

  const powerPct = Math.round(controlPower * 100);
  const effortPct = Math.round(targetEffort * 100);
  const pathPct = Math.round(pathScore * 100);
  const bracketPct = Math.round(bracketScore * 100);
  const pacePct = Math.round(currentSpeed * 100);
  const minPct = Math.round(roundDef.speedMin * 100);
  const maxPct = Math.round(roundDef.speedMax * 100);
  const effortInZone = effortStatus === 'zone';
  const inCorridor = bracketStatus === 'in';
  const dualControl = effortInZone && inCorridor;
  const effortLow = targetEffort - effortBandHalf;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`ctrl-${i}`}
          style={[styles.decor, laneStyle, { left: `${4 + (i * 15) % 88}%`, top: `${2 + (i % 4) * 7}%` }]}
        >
          {d}
        </Animated.Text>
      ))}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          CTRL {powerPct}% · PATH {pathPct}% · LANE {bracketPct}%
        </Text>

        <Text style={styles.meterLabel}>CORRIDOR {pacePct}% · BAND {minPct}–{maxPct}%</Text>
        <View style={styles.meterTrack}>
          <View style={[styles.corridorBand, { left: `${minPct}%`, width: `${maxPct - minPct}%` }]} />
          <View
            style={[
              styles.speedNeedle,
              {
                left: `${Math.min(98, pacePct)}%`,
                backgroundColor: inCorridor ? MOVEMENT_CALIBRATION_SHELL.good : bracketStatus === 'above' ? MOVEMENT_CALIBRATION_SHELL.warn : theme.accent,
              },
            ]}
          />
        </View>

        <Text style={[styles.meterLabel, { marginTop: 8 }]}>EFFORT · TARGET {effortPct}%</Text>
        <View style={styles.meterTrack}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${Math.min(100, powerPct)}%`,
                backgroundColor: effortInZone ? MOVEMENT_CALIBRATION_SHELL.good : effortStatus === 'heavy' ? MOVEMENT_CALIBRATION_SHELL.warn : theme.accent,
              },
            ]}
          />
          <View style={[styles.zoneBand, { left: `${effortLow * 100}%`, width: `${effortBandHalf * 2 * 100}%` }]} />
          <View style={[styles.targetTick, { left: `${effortPct}%` }]} />
        </View>

        <View style={styles.hudRow}>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={[styles.zoneBadge, { color: dualControl ? MOVEMENT_CALIBRATION_SHELL.good : theme.lane }]}>
            {bracketStatus === 'below' ? 'TOO SLOW' : bracketStatus === 'above' ? 'TOO FAST' : effortInZone ? 'GOVERNED' : effortStatus === 'heavy' ? 'TOO STRONG' : 'REGULATE'}
          </Text>
          <Text style={styles.roundText}>
            Lane {round + 1}/{totalRounds}
          </Text>
        </View>
        <View style={styles.segRow}>
          <Text style={styles.segChip}>STABLE {Math.round(stability * 100)}%</Text>
          <Text style={styles.segChip}>ARMS {Math.round(armsScore * 100)}%</Text>
          <Text style={styles.segChip}>LEGS {Math.round(legsScore * 100)}%</Text>
        </View>
      </View>

      <View style={styles.lanesRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.laneDot, { opacity: i < laneCount ? 1 : 0.25 }]}>
            {i < laneCount ? theme.lanes[i % theme.lanes.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.arenaWrap}>
        <Text style={styles.arenaLabel}>🛞 ARENA {Math.round(arenaProgress * 100)}%</Text>
        <View style={styles.arenaBar}>
          <LinearGradient
            colors={[theme.accentDeep, theme.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.arenaFill, { width: `${arenaProgress * 100}%` }]}
          />
        </View>
      </View>

      <View style={styles.pathWrap}>
        <Text style={styles.pathLabel}>🎚️ PATH {Math.round(pathProgress * 100)}%</Text>
        <View style={styles.pathBar}>
          <View style={[styles.pathFill, { width: `${pathProgress * 100}%`, backgroundColor: theme.lane }]} />
        </View>
      </View>

      {!previewing && (
        <Animated.View style={[styles.figureRow, sealStyle]}>
          <View style={styles.figureCol}>
            <Text style={styles.figureLabel}>START</Text>
            <FullBodyFigure pose={roundDef.start} accent={theme.lane} jointColor={theme.accentDeep} label="GO" compact />
          </View>
          <Text style={styles.arrow}>🛤️</Text>
          <View style={styles.figureCol}>
            <Text style={styles.figureLabel}>TARGET</Text>
            <FullBodyFigure pose={roundDef.end} accent={theme.accent} jointColor={theme.lane} label={roundDef.label} compact />
          </View>
          <Text style={styles.arrow}>→</Text>
          <View style={styles.figureCol}>
            <Text style={styles.figureLabel}>YOU</Text>
            <FullBodyFigure
              pose={playerPose}
              accent={dualControl ? MOVEMENT_CALIBRATION_SHELL.good : theme.accentDeep}
              jointColor={theme.lane}
              matched={dualControl}
              compact
            />
          </View>
        </Animated.View>
      )}

      {previewing && (
        <View style={styles.previewWrap}>
          <Text style={styles.previewEmoji}>{roundDef.icon}</Text>
          <Text style={styles.previewText}>{roundDef.name}</Text>
          <Text style={styles.previewBand}>Corridor {minPct}–{maxPct}% · effort {effortPct}%</Text>
        </View>
      )}

      {roundActive && dualControl && !sealing && (
        <View style={styles.holdRingWrap}>
          <View style={styles.holdRing}>
            <View style={[styles.holdFill, { width: `${holdProgress * 100}%` }]} />
          </View>
        </View>
      )}

      {sealing && (
        <Text style={styles.sealText}>SEALING {Math.round(sealProgress * 100)}%</Text>
      )}

      {banner ? (
        <View style={[styles.banner, { backgroundColor: dualControl ? MOVEMENT_CALIBRATION_SHELL.good : theme.accentDeep }]}>
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
    backgroundColor: 'rgba(12,25,41,0.92)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.35)',
  },
  hudTitle: { color: '#E0F2FE', fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
  meterLabel: { color: '#7DD3FC', fontSize: 8, fontWeight: '800', marginTop: 6 },
  meterTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginTop: 4,
    overflow: 'visible',
  },
  meterFill: { height: '100%', borderRadius: 5 },
  corridorBand: {
    position: 'absolute',
    top: 0,
    height: '100%',
    backgroundColor: 'rgba(52,211,153,0.28)',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.5)',
  },
  speedNeedle: {
    position: 'absolute',
    top: -2,
    width: 4,
    height: 14,
    marginLeft: -2,
    borderRadius: 2,
  },
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
  qualityText: { color: '#BAE6FD', fontSize: 11, fontWeight: '700' },
  zoneBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  roundText: { color: MOVEMENT_CALIBRATION_SHELL.gold, fontSize: 11, fontWeight: '800' },
  segRow: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  segChip: {
    color: '#E0F2FE',
    fontSize: 8,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(56,189,248,0.18)',
  },
  lanesRow: {
    position: 'absolute',
    top: 148,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(12,25,41,0.55)',
    borderRadius: 16,
  },
  laneDot: { fontSize: 14 },
  arenaWrap: { position: 'absolute', top: '18%', left: 14, right: 14 },
  arenaLabel: { color: '#BAE6FD', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  arenaBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  arenaFill: { height: '100%', borderRadius: 4 },
  pathWrap: { position: 'absolute', top: '24%', left: 14, right: 14 },
  pathLabel: { color: '#7DD3FC', fontSize: 10, fontWeight: '800', marginBottom: 4 },
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
  figureLabel: { color: '#BAE6FD', fontSize: 7, fontWeight: '900', letterSpacing: 0.6, marginBottom: 3 },
  arrow: { color: MOVEMENT_CALIBRATION_SHELL.gold, fontSize: 16, fontWeight: '900' },
  previewWrap: { position: 'absolute', top: '40%', alignSelf: 'center', alignItems: 'center' },
  previewEmoji: { fontSize: 68 },
  previewText: { color: '#E0F2FE', fontSize: 14, fontWeight: '800', marginTop: 8 },
  previewBand: { color: '#7DD3FC', fontSize: 12, fontWeight: '900', marginTop: 4 },
  holdRingWrap: { position: 'absolute', bottom: '18%', alignSelf: 'center' },
  holdRing: {
    width: 120,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', backgroundColor: MOVEMENT_CALIBRATION_SHELL.good, borderRadius: 4 },
  sealText: {
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
