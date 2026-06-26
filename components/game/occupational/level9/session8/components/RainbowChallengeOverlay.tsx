/** Rainbow Challenge overlay — OT L9 S8 Game 5 */
import { FullBodyFigure } from '@/components/game/occupational/level9/session3/components/FullBodyFigure';
import type { FullBodyReadout } from '@/components/game/occupational/level9/session3/jointUtils';
import type { RainbowChallengeTheme } from '@/components/game/occupational/level9/session8/proprioceptiveSequencingTheme';
import { PROPRIO_SEQUENCING_SHELL } from '@/components/game/occupational/level9/session8/proprioceptiveSequencingTheme';
import type { RainbowChallengeRound, SequenceZoneStatus } from '@/components/game/occupational/level9/session8/proprioceptiveSequencingUtils';
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
  theme: RainbowChallengeTheme;
  roundDef: RainbowChallengeRound;
  stepIndex: 0 | 1;
  effort: number;
  form: number;
  armsScore: number;
  legsScore: number;
  readout: FullBodyReadout;
  targetEffort: number;
  zoneStatus: SequenceZoneStatus;
  holdProgress: number;
  completeProgress: number;
  completing: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  challengeCount: number;
  challengeProgress: number;
  leftHand: { x: number; y: number } | null;
  rightHand: { x: number; y: number } | null;
  banner: string;
  quality: number;
  bandHalf: number;
};

const pctLeft = (x: number) => `${Math.max(0, Math.min(1, x)) * 100}%` as const;
const pctTop = (y: number) => `${Math.max(0, Math.min(1, y)) * 100}%` as const;

const StepChip: React.FC<{
  n: number;
  icon: string;
  label: string;
  state: 'done' | 'active' | 'pending';
  accent: string;
}> = ({ n, icon, label, state, accent }) => (
  <View
    style={[
      styles.chip,
      state === 'active' && { borderColor: accent, backgroundColor: 'rgba(255,255,255,0.16)' },
      state === 'done' && { borderColor: PROPRIO_SEQUENCING_SHELL.good, backgroundColor: 'rgba(52,211,153,0.2)' },
      state === 'pending' && { borderColor: 'rgba(255,255,255,0.25)' },
    ]}
  >
    <Text style={styles.chipNum}>{state === 'done' ? '✓' : n}</Text>
    <Text style={styles.chipIcon}>{icon}</Text>
    <Text style={styles.chipLabel}>{label}</Text>
  </View>
);

export function RainbowChallengeOverlay({
  theme,
  roundDef,
  stepIndex,
  effort,
  form,
  armsScore,
  legsScore,
  readout,
  targetEffort,
  zoneStatus,
  holdProgress,
  completeProgress,
  completing,
  previewing,
  roundActive,
  round,
  totalRounds,
  challengeCount,
  challengeProgress,
  leftHand,
  rightHand,
  banner,
  quality,
  bandHalf,
}: Props) {
  const shimmer = useSharedValue(0);
  const glowPulse = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [shimmer]);

  useEffect(() => {
    const ratio = Math.min(1, effort / Math.max(0.35, targetEffort));
    glowPulse.value = withTiming(completing ? 1 : ratio, { duration: 200 });
  }, [completing, glowPulse, effort, targetEffort]);

  const shimmerStyle = useAnimatedStyle(() => ({ opacity: 0.24 + shimmer.value * 0.42 }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.38 + glowPulse.value * 0.58,
    transform: [{ scale: 1 + glowPulse.value * 0.1 }],
  }));

  const metricPct = Math.round((stepIndex === 0 ? form : effort) * 100);
  const formPct = Math.round(form * 100);
  const targetPct = Math.round(targetEffort * 100);
  const inZone = zoneStatus === 'zone';
  const effortLow = targetEffort - bandHalf;
  const stepAccent = stepIndex === 0 ? roundDef.color : theme.glow;

  const arms = readout.arms;
  const legs = readout.legs;
  const playerPose = {
    ...roundDef.arch,
    leftRaise: arms.left?.raise ?? 0,
    rightRaise: arms.right?.raise ?? 0,
    leftElbow: arms.left?.elbow ?? 0,
    rightElbow: arms.right?.elbow ?? 0,
    leftLift: legs.left?.lift ?? 0,
    rightLift: legs.right?.lift ?? 0,
    leftKnee: legs.left?.knee ?? 0,
    rightKnee: legs.right?.knee ?? 0,
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`rainbow-${i}`}
          style={[styles.decor, shimmerStyle, { left: `${4 + (i * 15) % 88}%`, top: `${2 + (i % 4) * 7}%` }]}
        >
          {d}
        </Animated.Text>
      ))}

      <View style={[styles.hudWrap, { borderColor: `${roundDef.color}55` }]}>
        <Text style={styles.hudTitle}>
          {stepIndex === 0 ? 'ARCH' : 'GLOW'} {metricPct}% · FORM {formPct}%
          {stepIndex === 1 ? ` · TARGET ${targetPct}%` : ''}
        </Text>
        <View style={styles.meterTrack}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${Math.min(100, metricPct)}%`,
                backgroundColor: inZone ? PROPRIO_SEQUENCING_SHELL.good : zoneStatus === 'heavy' ? PROPRIO_SEQUENCING_SHELL.warn : stepAccent,
              },
            ]}
          />
          {stepIndex === 1 && (
            <>
              <View style={[styles.zoneBand, { left: `${effortLow * 100}%`, width: `${bandHalf * 2 * 100}%` }]} />
              <View style={[styles.targetTick, { left: `${targetPct}%` }]} />
            </>
          )}
        </View>
        <View style={styles.hudRow}>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={[styles.zoneBadge, { color: inZone ? PROPRIO_SEQUENCING_SHELL.good : stepAccent }]}>
            {inZone ? (stepIndex === 0 ? 'ON ARCH' : 'IN ZONE') : zoneStatus === 'heavy' ? 'TOO STRONG' : stepIndex === 0 ? 'SHAPE MORE' : 'GLOW FIRMER'}
          </Text>
          <Text style={styles.roundText}>
            Color {round + 1}/{totalRounds}
          </Text>
        </View>
        {stepIndex === 0 && (
          <View style={styles.segRow}>
            <Text style={styles.segChip}>ARMS {Math.round(armsScore * 100)}%</Text>
            <Text style={styles.segChip}>LEGS {Math.round(legsScore * 100)}%</Text>
          </View>
        )}
      </View>

      <View style={styles.planRow}>
        <StepChip n={1} icon="🌈" label={roundDef.archLabel} state={stepIndex === 0 ? 'active' : stepIndex === 1 ? 'done' : 'pending'} accent={roundDef.color} />
        <Text style={styles.arrow}>→</Text>
        <StepChip n={2} icon="✨" label={roundDef.glowLabel} state={stepIndex === 1 ? 'active' : 'pending'} accent={theme.glow} />
      </View>

      <View style={styles.seqWrap}>
        <Text style={styles.seqLabel}>🌈 RAINBOW {Math.round(challengeProgress * 100)}%</Text>
        <View style={styles.seqBar}>
          <LinearGradient
            colors={[theme.accentDeep, theme.accent, theme.glow]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.seqFill, { width: `${challengeProgress * 100}%` }]}
          />
        </View>
      </View>

      <View style={styles.colorsRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.colorDot, { opacity: i < challengeCount ? 1 : 0.25 }]}>
            {i < challengeCount ? theme.colors[i % theme.colors.length] : '·'}
          </Text>
        ))}
      </View>

      {previewing && (
        <View style={styles.previewWrap}>
          <Text style={styles.previewEmoji}>{roundDef.icon}</Text>
          <Text style={[styles.previewText, { color: roundDef.color }]}>{roundDef.colorName} {roundDef.name}</Text>
          <Text style={styles.previewSeq}>🌈 Arch → ✨ Glow</Text>
        </View>
      )}

      {!previewing && stepIndex === 0 && (
        <View style={styles.figureRow}>
          <View style={styles.figureCol}>
            <Text style={styles.figureLabel}>TARGET</Text>
            <FullBodyFigure pose={roundDef.arch} accent={roundDef.color} jointColor={theme.accentDeep} label={roundDef.colorName} compact />
          </View>
          <Text style={styles.arrow}>→</Text>
          <View style={styles.figureCol}>
            <Text style={styles.figureLabel}>YOU</Text>
            <FullBodyFigure
              pose={playerPose}
              accent={inZone ? PROPRIO_SEQUENCING_SHELL.good : roundDef.color}
              jointColor={theme.arch}
              matched={inZone}
              compact
            />
          </View>
        </View>
      )}

      {!previewing && stepIndex === 1 && (
        <Animated.View style={[styles.glowWrap, glowStyle, { borderColor: `${roundDef.color}88` }]}>
          <Text style={styles.glowEmoji}>✨</Text>
          <Text style={styles.glowLabel}>RAINBOW GLOW</Text>
          <Text style={[styles.glowColor, { color: roundDef.color }]}>{roundDef.colorName}</Text>
        </Animated.View>
      )}

      {leftHand && roundActive && stepIndex === 1 && (
        <View style={[styles.hand, { left: pctLeft(leftHand.x), top: pctTop(leftHand.y), marginLeft: -14, marginTop: -14 }]}>
          <Text style={styles.handEmoji}>✨</Text>
        </View>
      )}
      {rightHand && roundActive && stepIndex === 1 && (
        <View style={[styles.hand, { left: pctLeft(rightHand.x), top: pctTop(rightHand.y), marginLeft: -14, marginTop: -14 }]}>
          <Text style={styles.handEmoji}>✨</Text>
        </View>
      )}

      {roundActive && inZone && !completing && holdProgress > 0 && (
        <View style={styles.holdRingWrap}>
          <View style={styles.holdRing}>
            <View style={[styles.holdFill, { width: `${holdProgress * 100}%`, backgroundColor: stepAccent }]} />
          </View>
        </View>
      )}

      {completing && (
        <Text style={styles.completeText}>RAINBOW {Math.round(completeProgress * 100)}%</Text>
      )}

      {banner ? (
        <View style={[styles.banner, { backgroundColor: inZone ? PROPRIO_SEQUENCING_SHELL.good : theme.accentDeep }]}>
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
  },
  hudTitle: { color: '#FDE68A', fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
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
    backgroundColor: PROPRIO_SEQUENCING_SHELL.gold,
    borderRadius: 1,
  },
  hudRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  qualityText: { color: '#E9D5FF', fontSize: 11, fontWeight: '700' },
  zoneBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  roundText: { color: PROPRIO_SEQUENCING_SHELL.gold, fontSize: 11, fontWeight: '800' },
  segRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  segChip: {
    color: '#FDE68A',
    fontSize: 8,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(168,85,247,0.22)',
  },
  planRow: {
    position: 'absolute',
    top: 118,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(30,27,75,0.55)',
    borderRadius: 16,
  },
  chip: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    minWidth: 72,
  },
  chipNum: { color: '#FDE68A', fontSize: 8, fontWeight: '900' },
  chipIcon: { fontSize: 18, marginTop: 2 },
  chipLabel: { color: '#E9D5FF', fontSize: 8, fontWeight: '900', letterSpacing: 0.5, marginTop: 2 },
  arrow: { color: PROPRIO_SEQUENCING_SHELL.gold, fontSize: 16, fontWeight: '900' },
  seqWrap: { position: 'absolute', top: '18%', left: 14, right: 14 },
  seqLabel: { color: '#E9D5FF', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  seqBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  seqFill: { height: '100%', borderRadius: 4 },
  colorsRow: {
    position: 'absolute',
    top: 174,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(30,27,75,0.45)',
    borderRadius: 16,
  },
  colorDot: { fontSize: 14 },
  previewWrap: { position: 'absolute', top: '40%', alignSelf: 'center', alignItems: 'center' },
  previewEmoji: { fontSize: 68 },
  previewText: { fontSize: 14, fontWeight: '800', marginTop: 8 },
  previewSeq: { color: '#E9D5FF', fontSize: 12, fontWeight: '900', marginTop: 4 },
  figureRow: {
    position: 'absolute',
    top: '42%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  figureCol: { alignItems: 'center' },
  figureLabel: { color: '#E9D5FF', fontSize: 7, fontWeight: '900', letterSpacing: 0.6, marginBottom: 3 },
  glowWrap: {
    position: 'absolute',
    top: '44%',
    alignSelf: 'center',
    alignItems: 'center',
    padding: 18,
    borderRadius: 22,
    backgroundColor: 'rgba(30,27,75,0.55)',
    borderWidth: 2,
  },
  glowEmoji: { fontSize: 52 },
  glowLabel: { color: '#FDE68A', fontSize: 11, fontWeight: '900', marginTop: 6, letterSpacing: 0.6 },
  glowColor: { fontSize: 10, fontWeight: '700', marginTop: 3 },
  hand: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(251,191,36,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FDE68A',
  },
  handEmoji: { fontSize: 12 },
  holdRingWrap: { position: 'absolute', bottom: '18%', alignSelf: 'center' },
  holdRing: {
    width: 120,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', borderRadius: 4 },
  completeText: {
    position: 'absolute',
    bottom: '14%',
    alignSelf: 'center',
    color: PROPRIO_SEQUENCING_SHELL.gold,
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
