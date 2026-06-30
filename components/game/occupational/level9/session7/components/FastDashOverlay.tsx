/** Fast Dash overlay — OT L9 S7 Game 2 */
import type { FastDashTheme } from '@/components/game/occupational/level9/session7/movementCalibrationTheme';
import { MOVEMENT_CALIBRATION_SHELL } from '@/components/game/occupational/level9/session7/movementCalibrationTheme';
import type { FastDashRound, CalibrationZoneStatus } from '@/components/game/occupational/level9/session7/movementCalibrationUtils';
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
  theme: FastDashTheme;
  roundDef: FastDashRound;
  readout: FullBodyReadout;
  dashPower: number;
  reach: number;
  burstScore: number;
  peakBurst: number;
  armsScore: number;
  legsScore: number;
  targetPower: number;
  zoneStatus: CalibrationZoneStatus;
  holdProgress: number;
  lockProgress: number;
  locking: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  dashCount: number;
  circuitProgress: number;
  checkpointProgress: number;
  tooSlow: boolean;
  tooReckless: boolean;
  banner: string;
  quality: number;
  bandHalf: number;
};

export function FastDashOverlay({
  theme,
  roundDef,
  readout,
  dashPower,
  reach,
  burstScore,
  peakBurst,
  armsScore,
  legsScore,
  targetPower,
  zoneStatus,
  holdProgress,
  lockProgress,
  locking,
  previewing,
  roundActive,
  round,
  totalRounds,
  dashCount,
  circuitProgress,
  checkpointProgress,
  tooSlow,
  tooReckless,
  banner,
  quality,
  bandHalf,
}: Props) {
  const pulse = useSharedValue(0);
  const streakPulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 620, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 620, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  useEffect(() => {
    if (roundActive && zoneStatus === 'zone' && !tooReckless) {
      streakPulse.value = withRepeat(
        withSequence(withTiming(1, { duration: 180 }), withTiming(0.18, { duration: 180 })),
        -1,
        false,
      );
    } else {
      streakPulse.value = withTiming(0, { duration: 160 });
    }
  }, [roundActive, zoneStatus, tooReckless, streakPulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.24 + pulse.value * 0.42,
  }));

  const streakStyle = useAnimatedStyle(() => ({
    opacity: streakPulse.value,
    transform: [{ scale: 1 + streakPulse.value * 0.14 }],
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

  const powerPct = Math.round(dashPower * 100);
  const targetPct = Math.round(targetPower * 100);
  const reachPct = Math.round(reach * 100);
  const burstPct = Math.round(burstScore * 100);
  const peakPct = Math.round(peakBurst * 100);
  const inZone = zoneStatus === 'zone';
  const low = targetPower - bandHalf;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`dash-${i}`}
          style={[styles.decor, pulseStyle, { left: `${4 + (i * 15) % 88}%`, top: `${2 + (i % 4) * 7}%` }]}
        >
          {d}
        </Animated.Text>
      ))}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          LOCK {powerPct}% · TARGET {targetPct}% · REACH {reachPct}%
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
          <Text
            style={[
              styles.zoneBadge,
              {
                color: tooReckless
                  ? MOVEMENT_CALIBRATION_SHELL.warn
                  : tooSlow
                    ? theme.streak
                    : inZone
                      ? MOVEMENT_CALIBRATION_SHELL.good
                      : theme.accentDeep,
              },
            ]}
          >
            {tooReckless ? 'RECKLESS' : tooSlow ? 'TOO SLOW' : inZone ? 'LOCKED IN' : zoneStatus === 'heavy' ? 'TOO STRONG' : 'TOO LIGHT'}
          </Text>
          <Text style={styles.roundText}>
            Dash {round + 1}/{totalRounds}
          </Text>
        </View>
        <View style={styles.segRow}>
          <Text style={styles.segChip}>BURST {burstPct}%</Text>
          <Text style={styles.segChip}>PEAK {peakPct}%</Text>
          <Text style={styles.segChip}>ARMS {Math.round(armsScore * 100)}%</Text>
          <Text style={styles.segChip}>LEGS {Math.round(legsScore * 100)}%</Text>
        </View>
      </View>

      <View style={styles.dashesRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.dashDot, { opacity: i < dashCount ? 1 : 0.25 }]}>
            {i < dashCount ? theme.dashes[i % theme.dashes.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.circuitWrap}>
        <Text style={styles.circuitLabel}>🏁 CIRCUIT {Math.round(circuitProgress * 100)}%</Text>
        <View style={styles.circuitBar}>
          <LinearGradient
            colors={[theme.accentDeep, theme.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.circuitFill, { width: `${circuitProgress * 100}%` }]}
          />
        </View>
      </View>

      <View style={styles.checkpointWrap}>
        <Text style={styles.checkpointLabel}>⚡ CHECKPOINT {Math.round(checkpointProgress * 100)}%</Text>
        <View style={styles.checkpointBar}>
          <View
            style={[
              styles.checkpointFill,
              {
                width: `${checkpointProgress * 100}%`,
                backgroundColor: tooReckless ? MOVEMENT_CALIBRATION_SHELL.warn : theme.streak,
              },
            ]}
          />
        </View>
      </View>

      {!previewing && (
        <Animated.View style={[styles.figureRow, streakStyle]}>
          <View style={styles.figureCol}>
            <Text style={styles.figureLabel}>READY</Text>
            <FullBodyFigure pose={roundDef.start} accent={theme.streak} jointColor={theme.accentDeep} label="GO" compact />
          </View>
          <Text style={styles.arrow}>⚡</Text>
          <View style={styles.figureCol}>
            <Text style={styles.figureLabel}>CHECKPOINT</Text>
            <FullBodyFigure pose={roundDef.end} accent={theme.accent} jointColor={theme.streak} label={roundDef.label} compact />
          </View>
          <Text style={styles.arrow}>→</Text>
          <View style={styles.figureCol}>
            <Text style={styles.figureLabel}>YOU</Text>
            <FullBodyFigure
              pose={playerPose}
              accent={inZone && !tooReckless ? MOVEMENT_CALIBRATION_SHELL.good : theme.accentDeep}
              jointColor={theme.streak}
              matched={inZone && !tooReckless}
              compact
            />
          </View>
        </Animated.View>
      )}

      {previewing && (
        <View style={styles.previewWrap}>
          <Text style={styles.previewEmoji}>{roundDef.icon}</Text>
          <Text style={styles.previewText}>{roundDef.name}</Text>
          <Text style={styles.previewBurst}>Lock effort {targetPct}%</Text>
        </View>
      )}

      {roundActive && inZone && !tooReckless && peakBurst >= 0.3 && !locking && (
        <View style={styles.holdRingWrap}>
          <View style={styles.holdRing}>
            <View style={[styles.holdFill, { width: `${holdProgress * 100}%` }]} />
          </View>
        </View>
      )}

      {locking && (
        <Text style={styles.lockText}>LOCKING {Math.round(lockProgress * 100)}%</Text>
      )}

      {banner ? (
        <View style={[styles.banner, { backgroundColor: inZone && !tooReckless ? MOVEMENT_CALIBRATION_SHELL.good : theme.accentDeep }]}>
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
    backgroundColor: 'rgba(28,25,23,0.92)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.35)',
  },
  hudTitle: { color: '#FFEDD5', fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
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
  qualityText: { color: '#FDE68A', fontSize: 11, fontWeight: '700' },
  zoneBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  roundText: { color: MOVEMENT_CALIBRATION_SHELL.gold, fontSize: 11, fontWeight: '800' },
  segRow: { flexDirection: 'row', gap: 5, marginTop: 6, flexWrap: 'wrap' },
  segChip: {
    color: '#FFEDD5',
    fontSize: 8,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(251,146,60,0.18)',
  },
  dashesRow: {
    position: 'absolute',
    top: 124,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(28,25,23,0.55)',
    borderRadius: 16,
  },
  dashDot: { fontSize: 14 },
  circuitWrap: { position: 'absolute', top: '18%', left: 14, right: 14 },
  circuitLabel: { color: '#FDE68A', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  circuitBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  circuitFill: { height: '100%', borderRadius: 4 },
  checkpointWrap: { position: 'absolute', top: '24%', left: 14, right: 14 },
  checkpointLabel: { color: '#FDBA74', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  checkpointBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  checkpointFill: { height: '100%', borderRadius: 3 },
  figureRow: {
    position: 'absolute',
    top: '36%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  figureCol: { alignItems: 'center' },
  figureLabel: { color: '#FDE68A', fontSize: 7, fontWeight: '900', letterSpacing: 0.6, marginBottom: 3 },
  arrow: { color: MOVEMENT_CALIBRATION_SHELL.gold, fontSize: 18, fontWeight: '900' },
  previewWrap: { position: 'absolute', top: '40%', alignSelf: 'center', alignItems: 'center' },
  previewEmoji: { fontSize: 68 },
  previewText: { color: '#FFEDD5', fontSize: 14, fontWeight: '800', marginTop: 8 },
  previewBurst: { color: '#FDBA74', fontSize: 12, fontWeight: '900', marginTop: 4 },
  holdRingWrap: { position: 'absolute', bottom: '18%', alignSelf: 'center' },
  holdRing: {
    width: 120,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', backgroundColor: MOVEMENT_CALIBRATION_SHELL.good, borderRadius: 4 },
  lockText: {
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
