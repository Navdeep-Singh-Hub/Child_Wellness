/** Slow Motion overlay — OT L9 S7 Game 1 */
import type { SlowMotionTheme } from '@/components/game/occupational/level9/session7/movementCalibrationTheme';
import { MOVEMENT_CALIBRATION_SHELL } from '@/components/game/occupational/level9/session7/movementCalibrationTheme';
import type { SlowMotionRound, CalibrationZoneStatus } from '@/components/game/occupational/level9/session7/movementCalibrationUtils';
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
  theme: SlowMotionTheme;
  roundDef: SlowMotionRound;
  readout: FullBodyReadout;
  slowPower: number;
  trajectory: number;
  paceScore: number;
  armsScore: number;
  legsScore: number;
  targetPower: number;
  zoneStatus: CalibrationZoneStatus;
  holdProgress: number;
  calibrateProgress: number;
  calibrating: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  pathCount: number;
  labProgress: number;
  pathProgress: number;
  tooFast: boolean;
  banner: string;
  quality: number;
  bandHalf: number;
};

export function SlowMotionOverlay({
  theme,
  roundDef,
  readout,
  slowPower,
  trajectory,
  paceScore,
  armsScore,
  legsScore,
  targetPower,
  zoneStatus,
  holdProgress,
  calibrateProgress,
  calibrating,
  previewing,
  roundActive,
  round,
  totalRounds,
  pathCount,
  labProgress,
  pathProgress,
  tooFast,
  banner,
  quality,
  bandHalf,
}: Props) {
  const pulse = useSharedValue(0);
  const trailPulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  useEffect(() => {
    if (roundActive && zoneStatus === 'zone' && !tooFast) {
      trailPulse.value = withRepeat(
        withSequence(withTiming(1, { duration: 280 }), withTiming(0.2, { duration: 280 })),
        -1,
        false,
      );
    } else {
      trailPulse.value = withTiming(0, { duration: 200 });
    }
  }, [roundActive, zoneStatus, tooFast, trailPulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + pulse.value * 0.36,
  }));

  const trailStyle = useAnimatedStyle(() => ({
    opacity: trailPulse.value,
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

  const powerPct = Math.round(slowPower * 100);
  const targetPct = Math.round(targetPower * 100);
  const trajPct = Math.round(trajectory * 100);
  const pacePct = Math.round(paceScore * 100);
  const inZone = zoneStatus === 'zone';
  const low = targetPower - bandHalf;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`slow-${i}`}
          style={[styles.decor, pulseStyle, { left: `${4 + (i * 15) % 88}%`, top: `${2 + (i % 4) * 7}%` }]}
        >
          {d}
        </Animated.Text>
      ))}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          EFFORT {powerPct}% · TARGET {targetPct}% · PATH {trajPct}%
        </Text>
        <View style={styles.meterTrack}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${Math.min(100, powerPct)}%`,
                backgroundColor: inZone ? MOVEMENT_CALIBRATION_SHELL.good : zoneStatus === 'heavy' ? MOVEMENT_CALIBRATION_SHELL.warn : theme.accent,
              },
            ]}
          />
          <View style={[styles.zoneBand, { left: `${low * 100}%`, width: `${bandHalf * 2 * 100}%` }]} />
          <View style={[styles.targetTick, { left: `${targetPct}%` }]} />
        </View>
        <View style={styles.hudRow}>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={[styles.zoneBadge, { color: tooFast ? MOVEMENT_CALIBRATION_SHELL.warn : inZone ? MOVEMENT_CALIBRATION_SHELL.good : theme.trail }]}>
            {tooFast ? 'TOO FAST' : inZone ? 'GLACIAL' : zoneStatus === 'heavy' ? 'TOO STRONG' : 'TOO LIGHT'}
          </Text>
          <Text style={styles.roundText}>
            Path {round + 1}/{totalRounds}
          </Text>
        </View>
        <View style={styles.segRow}>
          <Text style={styles.segChip}>PACE {pacePct}%</Text>
          <Text style={styles.segChip}>ARMS {Math.round(armsScore * 100)}%</Text>
          <Text style={styles.segChip}>LEGS {Math.round(legsScore * 100)}%</Text>
        </View>
      </View>

      <View style={styles.movesRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.moveDot, { opacity: i < pathCount ? 1 : 0.25 }]}>
            {i < pathCount ? theme.moves[i % theme.moves.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.labWrap}>
        <Text style={styles.labLabel}>⏳ LAB {Math.round(labProgress * 100)}%</Text>
        <View style={styles.labBar}>
          <LinearGradient
            colors={[theme.accentDeep, theme.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.labFill, { width: `${labProgress * 100}%` }]}
          />
        </View>
      </View>

      <View style={styles.pathWrap}>
        <Text style={styles.pathLabel}>🐢 PATH {Math.round(pathProgress * 100)}%</Text>
        <View style={styles.pathBar}>
          <View style={[styles.pathFill, { width: `${pathProgress * 100}%`, backgroundColor: tooFast ? MOVEMENT_CALIBRATION_SHELL.warn : theme.trail }]} />
        </View>
      </View>

      {!previewing && (
        <Animated.View style={[styles.figureRow, trailStyle]}>
          <View style={styles.figureCol}>
            <Text style={styles.figureLabel}>START</Text>
            <FullBodyFigure pose={roundDef.start} accent={theme.trail} jointColor={theme.accentDeep} label="REST" compact />
          </View>
          <Text style={styles.arrow}>⇢</Text>
          <View style={styles.figureCol}>
            <Text style={styles.figureLabel}>TARGET</Text>
            <FullBodyFigure pose={roundDef.end} accent={theme.accent} jointColor={theme.trail} label={roundDef.label} compact />
          </View>
          <Text style={styles.arrow}>→</Text>
          <View style={styles.figureCol}>
            <Text style={styles.figureLabel}>YOU</Text>
            <FullBodyFigure
              pose={playerPose}
              accent={inZone && !tooFast ? MOVEMENT_CALIBRATION_SHELL.good : theme.accentDeep}
              jointColor={theme.trail}
              matched={inZone && !tooFast}
              compact
            />
          </View>
        </Animated.View>
      )}

      {previewing && (
        <View style={styles.previewWrap}>
          <Text style={styles.previewEmoji}>{roundDef.icon}</Text>
          <Text style={styles.previewText}>{roundDef.name}</Text>
          <Text style={styles.previewPace}>Glacial effort {targetPct}%</Text>
        </View>
      )}

      {roundActive && inZone && !tooFast && !calibrating && (
        <View style={styles.holdRingWrap}>
          <View style={styles.holdRing}>
            <View style={[styles.holdFill, { width: `${holdProgress * 100}%` }]} />
          </View>
        </View>
      )}

      {calibrating && (
        <Text style={styles.calibrateText}>CALIBRATING {Math.round(calibrateProgress * 100)}%</Text>
      )}

      {banner ? (
        <View style={[styles.banner, { backgroundColor: inZone && !tooFast ? MOVEMENT_CALIBRATION_SHELL.good : theme.accentDeep }]}>
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
    backgroundColor: 'rgba(30,27,75,0.92)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.35)',
  },
  hudTitle: { color: '#EDE9FE', fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
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
  qualityText: { color: '#DDD6FE', fontSize: 11, fontWeight: '700' },
  zoneBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  roundText: { color: MOVEMENT_CALIBRATION_SHELL.gold, fontSize: 11, fontWeight: '800' },
  segRow: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  segChip: {
    color: '#EDE9FE',
    fontSize: 8,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(167,139,250,0.18)',
  },
  movesRow: {
    position: 'absolute',
    top: 118,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(30,27,75,0.55)',
    borderRadius: 16,
  },
  moveDot: { fontSize: 14 },
  labWrap: { position: 'absolute', top: '18%', left: 14, right: 14 },
  labLabel: { color: '#DDD6FE', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  labBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  labFill: { height: '100%', borderRadius: 4 },
  pathWrap: { position: 'absolute', top: '24%', left: 14, right: 14 },
  pathLabel: { color: '#C4B5FD', fontSize: 10, fontWeight: '800', marginBottom: 4 },
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
  figureLabel: { color: '#DDD6FE', fontSize: 7, fontWeight: '900', letterSpacing: 0.6, marginBottom: 3 },
  arrow: { color: MOVEMENT_CALIBRATION_SHELL.gold, fontSize: 16, fontWeight: '900' },
  previewWrap: { position: 'absolute', top: '40%', alignSelf: 'center', alignItems: 'center' },
  previewEmoji: { fontSize: 68 },
  previewText: { color: '#EDE9FE', fontSize: 14, fontWeight: '800', marginTop: 8 },
  previewPace: { color: '#C4B5FD', fontSize: 12, fontWeight: '900', marginTop: 4 },
  holdRingWrap: { position: 'absolute', bottom: '18%', alignSelf: 'center' },
  holdRing: {
    width: 120,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', backgroundColor: MOVEMENT_CALIBRATION_SHELL.good, borderRadius: 4 },
  calibrateText: {
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
