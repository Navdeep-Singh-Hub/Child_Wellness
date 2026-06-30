/** Power Sequence overlay — OT L9 S8 Game 3 */
import type { PowerSequenceTheme } from '@/components/game/occupational/level9/session8/proprioceptiveSequencingTheme';
import { PROPRIO_SEQUENCING_SHELL } from '@/components/game/occupational/level9/session8/proprioceptiveSequencingTheme';
import type { PowerSequenceRound, SequenceZoneStatus } from '@/components/game/occupational/level9/session8/proprioceptiveSequencingUtils';
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
  theme: PowerSequenceTheme;
  roundDef: PowerSequenceRound;
  stepIndex: 0 | 1;
  effort: number;
  form: number;
  targetEffort: number;
  zoneStatus: SequenceZoneStatus;
  holdProgress: number;
  completeProgress: number;
  completing: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  sequenceCount: number;
  sequenceProgress: number;
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

export function PowerSequenceOverlay({
  theme,
  roundDef,
  stepIndex,
  effort,
  form,
  targetEffort,
  zoneStatus,
  holdProgress,
  completeProgress,
  completing,
  previewing,
  roundActive,
  round,
  totalRounds,
  sequenceCount,
  sequenceProgress,
  leftHand,
  rightHand,
  banner,
  quality,
  bandHalf,
}: Props) {
  const spark = useSharedValue(0);
  const coreGlow = useSharedValue(0);

  useEffect(() => {
    spark.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 760, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 760, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [spark]);

  useEffect(() => {
    const ratio = Math.min(1, effort / Math.max(0.35, targetEffort));
    coreGlow.value = withTiming(completing ? 1 : ratio, { duration: 200 });
  }, [completing, coreGlow, effort, targetEffort]);

  const sparkStyle = useAnimatedStyle(() => ({ opacity: 0.24 + spark.value * 0.42 }));
  const coreStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + coreGlow.value * 0.55,
    transform: [{ scale: 1 + coreGlow.value * (stepIndex === 1 ? 0.14 : 0.1) }],
  }));

  const effortPct = Math.round(effort * 100);
  const targetPct = Math.round(targetEffort * 100);
  const formPct = Math.round(form * 100);
  const inZone = zoneStatus === 'zone';
  const effortLow = targetEffort - bandHalf;
  const stepAccent = stepIndex === 0 ? theme.charge : theme.blast;
  const stepIcon = stepIndex === 0 ? '🔋' : '💥';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`vault-${i}`}
          style={[styles.decor, sparkStyle, { left: `${4 + (i * 15) % 88}%`, top: `${2 + (i % 4) * 7}%` }]}
        >
          {d}
        </Animated.Text>
      ))}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          {stepIndex === 0 ? 'CHARGE' : 'BLAST'} {effortPct}% · FORM {formPct}% · TARGET {targetPct}%
        </Text>
        <View style={styles.meterTrack}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${Math.min(100, effortPct)}%`,
                backgroundColor: inZone ? PROPRIO_SEQUENCING_SHELL.good : zoneStatus === 'heavy' ? PROPRIO_SEQUENCING_SHELL.warn : stepAccent,
              },
            ]}
          />
          <View style={[styles.zoneBand, { left: `${effortLow * 100}%`, width: `${bandHalf * 2 * 100}%` }]} />
          <View style={[styles.targetTick, { left: `${targetPct}%` }]} />
        </View>
        <View style={styles.hudRow}>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={[styles.zoneBadge, { color: inZone ? PROPRIO_SEQUENCING_SHELL.good : stepAccent }]}>
            {inZone ? 'IN ZONE' : zoneStatus === 'heavy' ? 'TOO STRONG' : 'POWER UP'}
          </Text>
          <Text style={styles.roundText}>
            Core {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      <View style={styles.planRow}>
        <StepChip n={1} icon="🔋" label={roundDef.chargeLabel} state={stepIndex === 0 ? 'active' : stepIndex === 1 ? 'done' : 'pending'} accent={theme.charge} />
        <Text style={styles.arrow}>→</Text>
        <StepChip n={2} icon="💥" label={roundDef.blastLabel} state={stepIndex === 1 ? 'active' : 'pending'} accent={theme.blast} />
      </View>

      <View style={styles.seqWrap}>
        <Text style={styles.seqLabel}>⚡ POWER {Math.round(sequenceProgress * 100)}%</Text>
        <View style={styles.seqBar}>
          <LinearGradient
            colors={[theme.accentDeep, theme.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.seqFill, { width: `${sequenceProgress * 100}%` }]}
          />
        </View>
      </View>

      <View style={styles.coresRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.coreDot, { opacity: i < sequenceCount ? 1 : 0.25 }]}>
            {i < sequenceCount ? theme.cores[i % theme.cores.length] : '·'}
          </Text>
        ))}
      </View>

      {previewing && (
        <View style={styles.previewWrap}>
          <Text style={styles.previewEmoji}>{roundDef.icon}</Text>
          <Text style={styles.previewText}>{roundDef.name}</Text>
          <Text style={styles.previewSeq}>🔋 Charge → 💥 Blast</Text>
        </View>
      )}

      {!previewing && (
        <Animated.View style={[styles.coreWrap, coreStyle]}>
          <Text style={styles.coreEmoji}>{stepIndex === 0 ? roundDef.icon : '💥'}</Text>
          <Text style={styles.coreLabel}>{stepIndex === 0 ? 'CHARGE' : 'BLAST'}</Text>
          <Text style={styles.coreName}>{roundDef.core}</Text>
        </Animated.View>
      )}

      {leftHand && roundActive && (
        <View style={[styles.hand, { left: pctLeft(leftHand.x), top: pctTop(leftHand.y), marginLeft: -14, marginTop: -14 }]}>
          <Text style={styles.handEmoji}>{stepIcon}</Text>
        </View>
      )}
      {rightHand && roundActive && (
        <View style={[styles.hand, { left: pctLeft(rightHand.x), top: pctTop(rightHand.y), marginLeft: -14, marginTop: -14 }]}>
          <Text style={styles.handEmoji}>{stepIcon}</Text>
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
        <Text style={styles.completeText}>POWER {Math.round(completeProgress * 100)}%</Text>
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
    backgroundColor: 'rgba(67,20,7,0.92)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.35)',
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
    backgroundColor: PROPRIO_SEQUENCING_SHELL.gold,
    borderRadius: 1,
  },
  hudRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  qualityText: { color: '#FDE68A', fontSize: 11, fontWeight: '700' },
  zoneBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  roundText: { color: PROPRIO_SEQUENCING_SHELL.gold, fontSize: 11, fontWeight: '800' },
  planRow: {
    position: 'absolute',
    top: 112,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(67,20,7,0.55)',
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
  chipNum: { color: '#FFEDD5', fontSize: 8, fontWeight: '900' },
  chipIcon: { fontSize: 18, marginTop: 2 },
  chipLabel: { color: '#FDE68A', fontSize: 8, fontWeight: '900', letterSpacing: 0.5, marginTop: 2 },
  arrow: { color: PROPRIO_SEQUENCING_SHELL.gold, fontSize: 16, fontWeight: '900' },
  seqWrap: { position: 'absolute', top: '18%', left: 14, right: 14 },
  seqLabel: { color: '#FDE68A', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  seqBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  seqFill: { height: '100%', borderRadius: 4 },
  coresRow: {
    position: 'absolute',
    top: 168,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(67,20,7,0.45)',
    borderRadius: 16,
  },
  coreDot: { fontSize: 14 },
  previewWrap: { position: 'absolute', top: '40%', alignSelf: 'center', alignItems: 'center' },
  previewEmoji: { fontSize: 68 },
  previewText: { color: '#FFEDD5', fontSize: 14, fontWeight: '800', marginTop: 8 },
  previewSeq: { color: '#FDE68A', fontSize: 12, fontWeight: '900', marginTop: 4 },
  coreWrap: {
    position: 'absolute',
    top: '44%',
    alignSelf: 'center',
    alignItems: 'center',
    padding: 18,
    borderRadius: 22,
    backgroundColor: 'rgba(67,20,7,0.55)',
    borderWidth: 2,
    borderColor: 'rgba(249,115,22,0.5)',
  },
  coreEmoji: { fontSize: 52 },
  coreLabel: { color: '#FDE68A', fontSize: 11, fontWeight: '900', marginTop: 6, letterSpacing: 0.6 },
  coreName: { color: '#FFEDD5', fontSize: 10, fontWeight: '700', marginTop: 3 },
  hand: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(249,115,22,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFEDD5',
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
