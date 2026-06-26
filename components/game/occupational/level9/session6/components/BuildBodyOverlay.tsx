/** Build The Body overlay — OT L9 S6 Game 1 */
import type { BuildTheBodyTheme } from '@/components/game/occupational/level9/session6/bodyAwarenessTheme';
import { BODY_AWARENESS_SHELL } from '@/components/game/occupational/level9/session6/bodyAwarenessTheme';
import type { BodyBuildRound } from '@/components/game/occupational/level9/session6/bodyAwarenessUtils';
import type { ResistanceZoneStatus } from '@/components/game/occupational/level9/session6/bodyAwarenessUtils';
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

type Marker = { x: number; y: number } | null;

type Props = {
  theme: BuildTheBodyTheme;
  roundDef: BodyBuildRound;
  readout: FullBodyReadout;
  buildPower: number;
  matchScore: number;
  trunkScore: number;
  armsScore: number;
  legsScore: number;
  targetPower: number;
  zoneStatus: ResistanceZoneStatus;
  holdProgress: number;
  snapProgress: number;
  snapping: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  builtCount: number;
  workshopProgress: number;
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
  bandHalf: number;
};

export function BuildBodyOverlay({
  theme,
  roundDef,
  readout,
  buildPower,
  matchScore,
  trunkScore,
  armsScore,
  legsScore,
  targetPower,
  zoneStatus,
  holdProgress,
  snapProgress,
  snapping,
  previewing,
  roundActive,
  round,
  totalRounds,
  builtCount,
  workshopProgress,
  markers,
  banner,
  quality,
  bandHalf,
}: Props) {
  const pulse = useSharedValue(0);
  const snapScale = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1050, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1050, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  useEffect(() => {
    snapScale.value = withTiming(snapping ? 1.08 - snapProgress * 0.06 : 1, { duration: snapping ? 520 : 200 });
  }, [snapping, snapProgress, snapScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.22 + pulse.value * 0.36,
  }));

  const figureStyle = useAnimatedStyle(() => ({
    transform: [{ scale: snapScale.value }],
  }));

  const arms = readout.arms;
  const legs = readout.legs;
  const playerPose = {
    ...roundDef.target,
    leftRaise: arms.left?.raise ?? 0,
    rightRaise: arms.right?.raise ?? 0,
    leftElbow: arms.left?.elbow ?? 0,
    rightElbow: arms.right?.elbow ?? 0,
    leftLift: legs.left?.lift ?? 0,
    rightLift: legs.right?.lift ?? 0,
    leftKnee: legs.left?.knee ?? 0,
    rightKnee: legs.right?.knee ?? 0,
  };

  const powerPct = Math.round(buildPower * 100);
  const targetPct = Math.round(targetPower * 100);
  const matchPct = Math.round(matchScore * 100);
  const inZone = zoneStatus === 'zone';
  const low = targetPower - bandHalf;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`workshop-${i}`}
          style={[styles.decor, pulseStyle, { left: `${4 + (i * 15) % 88}%`, top: `${2 + (i % 4) * 7}%` }]}
        >
          {d}
        </Animated.Text>
      ))}

      {Object.entries(markers).map(([key, pt]) =>
        pt ? (
          <View
            key={key}
            style={[styles.markerDot, { left: `${pt.x * 100}%`, top: `${pt.y * 100}%`, borderColor: theme.accent }]}
          />
        ) : null,
      )}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          BUILD {powerPct}% · TARGET {targetPct}% · MATCH {matchPct}%
        </Text>
        <View style={styles.meterTrack}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${Math.min(100, powerPct)}%`,
                backgroundColor: inZone ? BODY_AWARENESS_SHELL.good : zoneStatus === 'heavy' ? BODY_AWARENESS_SHELL.warn : theme.accent,
              },
            ]}
          />
          <View style={[styles.zoneBand, { left: `${low * 100}%`, width: `${bandHalf * 2 * 100}%` }]} />
          <View style={[styles.targetTick, { left: `${targetPct}%` }]} />
        </View>
        <View style={styles.hudRow}>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={[styles.zoneBadge, { color: inZone ? BODY_AWARENESS_SHELL.good : theme.segment }]}>
            {inZone ? 'PLACING' : zoneStatus === 'heavy' ? 'TOO STRONG' : 'TOO LIGHT'}
          </Text>
          <Text style={styles.roundText}>
            Part {round + 1}/{totalRounds}
          </Text>
        </View>
        <View style={styles.segRow}>
          <Text style={[styles.segChip, roundDef.segments.includes('trunk') && styles.segOn]}>
            TRUNK {Math.round(trunkScore * 100)}%
          </Text>
          <Text style={[styles.segChip, roundDef.segments.includes('arms') && styles.segOn]}>
            ARMS {Math.round(armsScore * 100)}%
          </Text>
          <Text style={[styles.segChip, roundDef.segments.includes('legs') && styles.segOn]}>
            LEGS {Math.round(legsScore * 100)}%
          </Text>
        </View>
      </View>

      <View style={styles.partsRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.partDot, { opacity: i < builtCount ? 1 : 0.25 }]}>
            {i < builtCount ? theme.parts[i % theme.parts.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.workshopWrap}>
        <Text style={styles.workshopLabel}>🧩 BLUEPRINT {Math.round(workshopProgress * 100)}%</Text>
        <View style={styles.workshopBar}>
          <LinearGradient
            colors={[theme.accentDeep, theme.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.workshopFill, { width: `${workshopProgress * 100}%` }]}
          />
        </View>
      </View>

      {!previewing && (
        <Animated.View style={[styles.figureRow, figureStyle]}>
          <View style={styles.figureCol}>
            <Text style={styles.figureLabel}>BLUEPRINT</Text>
            <FullBodyFigure
              pose={roundDef.target}
              accent={theme.accent}
              jointColor={theme.segment}
              label={roundDef.segmentLabel}
              compact
            />
          </View>
          <Text style={styles.vs}>→</Text>
          <View style={styles.figureCol}>
            <Text style={styles.figureLabel}>YOU</Text>
            <FullBodyFigure
              pose={playerPose}
              accent={inZone ? BODY_AWARENESS_SHELL.good : theme.accentDeep}
              jointColor={theme.segment}
              matched={inZone}
              compact
            />
          </View>
        </Animated.View>
      )}

      {previewing && (
        <View style={styles.previewWrap}>
          <Text style={styles.previewEmoji}>{roundDef.icon}</Text>
          <Text style={styles.previewText}>
            {roundDef.name} · placement {targetPct}%
          </Text>
          <Text style={styles.previewSeg}>Build: {roundDef.segmentLabel}</Text>
        </View>
      )}

      {roundActive && inZone && !snapping && (
        <View style={styles.holdRingWrap}>
          <View style={styles.holdRing}>
            <View style={[styles.holdFill, { width: `${holdProgress * 100}%` }]} />
          </View>
        </View>
      )}

      {snapping && (
        <Text style={styles.snapText}>SNAPPING {Math.round(snapProgress * 100)}%</Text>
      )}

      {banner ? (
        <View style={[styles.banner, { backgroundColor: inZone ? BODY_AWARENESS_SHELL.good : theme.accentDeep }]}>
          <Text style={styles.bannerText}>{banner}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  decor: { position: 'absolute', fontSize: 18 },
  markerDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    marginLeft: -5,
    marginTop: -5,
    borderRadius: 5,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
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
    backgroundColor: BODY_AWARENESS_SHELL.gold,
    borderRadius: 1,
  },
  hudRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  qualityText: { color: '#99F6E4', fontSize: 11, fontWeight: '700' },
  zoneBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  roundText: { color: BODY_AWARENESS_SHELL.gold, fontSize: 11, fontWeight: '800' },
  segRow: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  segChip: {
    color: 'rgba(204,251,241,0.45)',
    fontSize: 8,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  segOn: { color: '#CCFBF1', backgroundColor: 'rgba(45,212,191,0.2)' },
  partsRow: {
    position: 'absolute',
    top: 108,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(4,47,46,0.55)',
    borderRadius: 16,
  },
  partDot: { fontSize: 14 },
  workshopWrap: { position: 'absolute', top: '20%', left: 14, right: 14 },
  workshopLabel: { color: '#99F6E4', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  workshopBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  workshopFill: { height: '100%', borderRadius: 4 },
  figureRow: {
    position: 'absolute',
    top: '34%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  figureCol: { alignItems: 'center' },
  figureLabel: { color: '#99F6E4', fontSize: 8, fontWeight: '900', letterSpacing: 0.8, marginBottom: 4 },
  vs: { color: BODY_AWARENESS_SHELL.gold, fontSize: 22, fontWeight: '900' },
  previewWrap: { position: 'absolute', top: '40%', alignSelf: 'center', alignItems: 'center' },
  previewEmoji: { fontSize: 68 },
  previewText: { color: '#99F6E4', fontSize: 14, fontWeight: '800', marginTop: 8 },
  previewSeg: { color: themeSegmentColor(), fontSize: 12, fontWeight: '900', marginTop: 4 },
  holdRingWrap: { position: 'absolute', bottom: '18%', alignSelf: 'center' },
  holdRing: {
    width: 120,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', backgroundColor: BODY_AWARENESS_SHELL.good, borderRadius: 4 },
  snapText: {
    position: 'absolute',
    bottom: '14%',
    alignSelf: 'center',
    color: BODY_AWARENESS_SHELL.gold,
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

function themeSegmentColor() {
  return '#F9A8D4';
}
