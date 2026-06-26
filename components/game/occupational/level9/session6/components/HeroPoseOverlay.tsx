/** Hero Pose overlay — OT L9 S6 Game 4 */
import type { HeroPoseTheme } from '@/components/game/occupational/level9/session6/bodyAwarenessTheme';
import { BODY_AWARENESS_SHELL } from '@/components/game/occupational/level9/session6/bodyAwarenessTheme';
import type { HeroPoseRound, ResistanceZoneStatus } from '@/components/game/occupational/level9/session6/bodyAwarenessUtils';
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
  theme: HeroPoseTheme;
  roundDef: HeroPoseRound;
  readout: FullBodyReadout;
  heroPower: number;
  poseMatch: number;
  armsScore: number;
  legsScore: number;
  targetPower: number;
  zoneStatus: ResistanceZoneStatus;
  holdProgress: number;
  unleashProgress: number;
  unleashing: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  heroCount: number;
  colosseumProgress: number;
  banner: string;
  quality: number;
  bandHalf: number;
};

export function HeroPoseOverlay({
  theme,
  roundDef,
  readout,
  heroPower,
  poseMatch,
  armsScore,
  legsScore,
  targetPower,
  zoneStatus,
  holdProgress,
  unleashProgress,
  unleashing,
  previewing,
  roundActive,
  round,
  totalRounds,
  heroCount,
  colosseumProgress,
  banner,
  quality,
  bandHalf,
}: Props) {
  const pulse = useSharedValue(0);
  const powerBurst = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 950, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 950, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  useEffect(() => {
    if (roundActive && zoneStatus === 'zone') {
      powerBurst.value = withRepeat(
        withSequence(withTiming(1, { duration: 220 }), withTiming(0.25, { duration: 220 })),
        -1,
        false,
      );
    } else {
      powerBurst.value = withTiming(0, { duration: 200 });
    }
  }, [roundActive, zoneStatus, powerBurst]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.24 + pulse.value * 0.4,
  }));

  const burstStyle = useAnimatedStyle(() => ({
    opacity: powerBurst.value,
    transform: [{ scale: 1 + powerBurst.value * 0.12 }],
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

  const powerPct = Math.round(heroPower * 100);
  const targetPct = Math.round(targetPower * 100);
  const matchPct = Math.round(poseMatch * 100);
  const inZone = zoneStatus === 'zone';
  const low = targetPower - bandHalf;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`hero-${i}`}
          style={[styles.decor, pulseStyle, { left: `${4 + (i * 15) % 88}%`, top: `${2 + (i % 4) * 7}%` }]}
        >
          {d}
        </Animated.Text>
      ))}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          POWER {powerPct}% · TARGET {targetPct}% · POSE {matchPct}%
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
          <Text style={[styles.zoneBadge, { color: inZone ? BODY_AWARENESS_SHELL.good : theme.cape }]}>
            {inZone ? 'CHANNELING' : zoneStatus === 'heavy' ? 'TOO STRONG' : 'TOO LIGHT'}
          </Text>
          <Text style={styles.roundText}>
            Pose {round + 1}/{totalRounds}
          </Text>
        </View>
        <View style={styles.segRow}>
          <Text style={styles.segChip}>ARMS {Math.round(armsScore * 100)}%</Text>
          <Text style={styles.segChip}>LEGS {Math.round(legsScore * 100)}%</Text>
        </View>
      </View>

      <View style={styles.posesRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.poseDot, { opacity: i < heroCount ? 1 : 0.25 }]}>
            {i < heroCount ? theme.poses[i % theme.poses.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.colosseumWrap}>
        <Text style={styles.colosseumLabel}>⚡ COLOSSEUM {Math.round(colosseumProgress * 100)}%</Text>
        <View style={styles.colosseumBar}>
          <LinearGradient
            colors={[theme.accentDeep, theme.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.colosseumFill, { width: `${colosseumProgress * 100}%` }]}
          />
        </View>
      </View>

      {!previewing && (
        <Animated.View style={[styles.figureRow, burstStyle]}>
          <View style={styles.figureCol}>
            <Text style={styles.figureLabel}>HERO</Text>
            <FullBodyFigure
              pose={roundDef.target}
              accent={theme.accent}
              jointColor={theme.cape}
              label={roundDef.label}
              compact
            />
          </View>
          <Text style={styles.vs}>→</Text>
          <View style={styles.figureCol}>
            <Text style={styles.figureLabel}>YOU</Text>
            <FullBodyFigure
              pose={playerPose}
              accent={inZone ? BODY_AWARENESS_SHELL.good : theme.accentDeep}
              jointColor={theme.cape}
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
          <Text style={styles.previewPower}>Hero power {targetPct}%</Text>
        </View>
      )}

      {roundActive && inZone && !unleashing && (
        <View style={styles.holdRingWrap}>
          <View style={styles.holdRing}>
            <View style={[styles.holdFill, { width: `${holdProgress * 100}%` }]} />
          </View>
        </View>
      )}

      {unleashing && (
        <Text style={styles.unleashText}>UNLEASHING {Math.round(unleashProgress * 100)}%</Text>
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
  hudWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(28,25,23,0.92)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.35)',
  },
  hudTitle: { color: '#FEF3C7', fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
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
  qualityText: { color: '#FDE68A', fontSize: 11, fontWeight: '700' },
  zoneBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  roundText: { color: BODY_AWARENESS_SHELL.gold, fontSize: 11, fontWeight: '800' },
  segRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  segChip: {
    color: '#FEF3C7',
    fontSize: 8,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(251,191,36,0.18)',
  },
  posesRow: {
    position: 'absolute',
    top: 108,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(28,25,23,0.55)',
    borderRadius: 16,
  },
  poseDot: { fontSize: 14 },
  colosseumWrap: { position: 'absolute', top: '20%', left: 14, right: 14 },
  colosseumLabel: { color: '#FDE68A', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  colosseumBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  colosseumFill: { height: '100%', borderRadius: 4 },
  figureRow: {
    position: 'absolute',
    top: '34%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  figureCol: { alignItems: 'center' },
  figureLabel: { color: '#FDE68A', fontSize: 8, fontWeight: '900', letterSpacing: 0.8, marginBottom: 4 },
  vs: { color: BODY_AWARENESS_SHELL.gold, fontSize: 22, fontWeight: '900' },
  previewWrap: { position: 'absolute', top: '40%', alignSelf: 'center', alignItems: 'center' },
  previewEmoji: { fontSize: 68 },
  previewText: { color: '#FEF3C7', fontSize: 14, fontWeight: '800', marginTop: 8 },
  previewPower: { color: '#F97316', fontSize: 12, fontWeight: '900', marginTop: 4 },
  holdRingWrap: { position: 'absolute', bottom: '18%', alignSelf: 'center' },
  holdRing: {
    width: 120,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', backgroundColor: BODY_AWARENESS_SHELL.good, borderRadius: 4 },
  unleashText: {
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
