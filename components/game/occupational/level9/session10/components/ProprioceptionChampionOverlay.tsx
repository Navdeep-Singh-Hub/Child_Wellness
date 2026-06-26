/** Proprioception Champion overlay — OT L9 S10 Game 5 */
import type { ProprioceptionChampionTheme } from '@/components/game/occupational/level9/session10/proprioceptiveAdventureTheme';
import { PROPRIOCEPTIVE_ADVENTURE_SHELL } from '@/components/game/occupational/level9/session10/proprioceptiveAdventureTheme';
import type { AdventureZoneStatus, ProprioceptionChampionRound } from '@/components/game/occupational/level9/session10/proprioceptiveAdventureUtils';
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
  theme: ProprioceptionChampionTheme;
  roundDef: ProprioceptionChampionRound;
  effort: number;
  form: number;
  targetEffort: number;
  zoneStatus: AdventureZoneStatus;
  holdProgress: number;
  crownProgress: number;
  crowning: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  crownedCount: number;
  colosseumProgress: number;
  holdSeconds: number;
  leftHand: { x: number; y: number } | null;
  rightHand: { x: number; y: number } | null;
  banner: string;
  quality: number;
  bandHalf: number;
};

export function ProprioceptionChampionOverlay({
  theme,
  roundDef,
  effort,
  form,
  targetEffort,
  zoneStatus,
  holdProgress,
  crownProgress,
  crowning,
  previewing,
  roundActive,
  round,
  totalRounds,
  crownedCount,
  colosseumProgress,
  holdSeconds,
  leftHand,
  rightHand,
  banner,
  quality,
  bandHalf,
}: Props) {
  const shimmer = useSharedValue(0);
  const crownGlow = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [shimmer]);

  useEffect(() => {
    const ratio = Math.min(1, effort / Math.max(0.35, targetEffort));
    crownGlow.value = withTiming(crowning ? 1 : ratio * 0.62, { duration: crowning ? 560 : 220 });
  }, [crowning, effort, crownGlow, targetEffort]);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + shimmer.value * 0.42,
  }));

  const crownStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + crownGlow.value * 0.5,
    transform: [{ scale: 1 + crownGlow.value * 0.06 }],
  }));

  const effortPct = Math.round(effort * 100);
  const targetPct = Math.round(targetEffort * 100);
  const formPct = Math.round(form * 100);
  const inZone = zoneStatus === 'zone';
  const low = targetEffort - bandHalf;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`champion-${i}`}
          style={[styles.decor, shimmerStyle, { left: `${5 + (i * 16) % 85}%`, top: `${3 + (i % 4) * 7}%` }]}
        >
          {d}
        </Animated.Text>
      ))}

      {leftHand && (
        <View style={[styles.handDot, { left: `${leftHand.x * 100}%`, top: `${leftHand.y * 100}%`, borderColor: theme.accent }]}>
          <Text style={styles.handLabel}>L</Text>
        </View>
      )}
      {rightHand && (
        <View style={[styles.handDot, { left: `${rightHand.x * 100}%`, top: `${rightHand.y * 100}%`, borderColor: theme.crown }]}>
          <Text style={styles.handLabel}>R</Text>
        </View>
      )}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          POWER {effortPct}% · TARGET {targetPct}% · FORM {formPct}%
        </Text>
        <View style={styles.meterTrack}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${Math.min(100, effortPct)}%`,
                backgroundColor: inZone ? PROPRIOCEPTIVE_ADVENTURE_SHELL.good : zoneStatus === 'heavy' ? PROPRIOCEPTIVE_ADVENTURE_SHELL.warn : theme.accent,
              },
            ]}
          />
          <View style={[styles.zoneBand, { left: `${low * 100}%`, width: `${bandHalf * 2 * 100}%` }]} />
          <View style={[styles.targetTick, { left: `${targetPct}%` }]} />
        </View>
        <View style={styles.hudRow}>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={[styles.zoneBadge, { color: inZone ? PROPRIOCEPTIVE_ADVENTURE_SHELL.good : theme.crown }]}>
            {inZone ? 'STEADY POWER' : zoneStatus === 'heavy' ? 'TOO STRONG' : 'POWER FIRMER'}
          </Text>
          <Text style={styles.roundText}>
            Trial {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      <View style={styles.crownedRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.crownedDot, { opacity: i < crownedCount ? 1 : 0.25 }]}>
            {i < crownedCount ? theme.trials[i % theme.trials.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.colosseumWrap}>
        <Text style={styles.colosseumLabel}>🏆 CHAMPION PATH {Math.round(colosseumProgress * 100)}%</Text>
        <View style={styles.colosseumTrack}>
          <LinearGradient
            colors={[theme.accentDeep, theme.accent, theme.crown]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.colosseumFill, { width: `${colosseumProgress * 100}%` }]}
          />
        </View>
      </View>

      {!previewing && (
        <View style={styles.trialWrap}>
          <Animated.View style={[styles.trialCard, crownStyle, { borderColor: inZone ? PROPRIOCEPTIVE_ADVENTURE_SHELL.good : theme.crown }]}>
            <Text style={styles.trialEmoji}>{roundDef.icon}</Text>
            <Text style={styles.trialLabel}>{roundDef.trial}</Text>
            <Text style={styles.holdHint}>Hold {holdSeconds.toFixed(1)}s</Text>
          </Animated.View>
          {roundActive && inZone && !crowning && (
            <View style={styles.holdRing}>
              <View style={[styles.holdFill, { width: `${holdProgress * 100}%` }]} />
            </View>
          )}
        </View>
      )}

      {previewing && (
        <View style={styles.previewWrap}>
          <Text style={styles.previewEmoji}>{roundDef.icon}</Text>
          <Text style={styles.previewText}>{roundDef.name}</Text>
          <Text style={styles.previewSub}>Power target {targetPct}% · Hold {holdSeconds.toFixed(1)}s</Text>
        </View>
      )}

      {crowning && (
        <Text style={styles.crownText}>CROWNING {Math.round(crownProgress * 100)}%</Text>
      )}

      {banner ? (
        <View style={[styles.banner, { backgroundColor: inZone ? PROPRIOCEPTIVE_ADVENTURE_SHELL.good : theme.accentDeep }]}>
          <Text style={styles.bannerText}>{banner}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  decor: { position: 'absolute', fontSize: 20 },
  handDot: {
    position: 'absolute',
    width: 26,
    height: 26,
    marginLeft: -13,
    marginTop: -13,
    borderRadius: 13,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  handLabel: { fontSize: 10, fontWeight: '900', color: '#6D28D9' },
  hudWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(30,27,75,0.92)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.35)',
  },
  hudTitle: { color: '#F3E8FF', fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
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
    backgroundColor: 'rgba(168,85,247,0.25)',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.45)',
  },
  targetTick: {
    position: 'absolute',
    top: -3,
    width: 3,
    height: 16,
    marginLeft: -1,
    backgroundColor: PROPRIOCEPTIVE_ADVENTURE_SHELL.gold,
    borderRadius: 1,
  },
  hudRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  qualityText: { color: '#E9D5FF', fontSize: 11, fontWeight: '700' },
  zoneBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  roundText: { color: PROPRIOCEPTIVE_ADVENTURE_SHELL.gold, fontSize: 11, fontWeight: '800' },
  crownedRow: {
    position: 'absolute',
    top: 92,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(30,27,75,0.55)',
    borderRadius: 16,
  },
  crownedDot: { fontSize: 14 },
  colosseumWrap: {
    position: 'absolute',
    top: '22%',
    left: 14,
    right: 14,
  },
  colosseumLabel: { color: '#E9D5FF', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  colosseumTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  colosseumFill: { height: '100%', borderRadius: 4 },
  trialWrap: { position: 'absolute', top: '38%', alignSelf: 'center', alignItems: 'center' },
  trialCard: {
    width: 120,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 3,
    backgroundColor: 'rgba(88,28,135,0.75)',
    alignItems: 'center',
  },
  trialEmoji: { fontSize: 36 },
  trialLabel: { color: '#F3E8FF', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginTop: 4 },
  holdHint: { color: '#FDE68A', fontSize: 8, fontWeight: '800', marginTop: 3 },
  holdRing: {
    marginTop: 10,
    width: 100,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', backgroundColor: PROPRIOCEPTIVE_ADVENTURE_SHELL.good, borderRadius: 4 },
  previewWrap: { position: 'absolute', top: '40%', alignSelf: 'center', alignItems: 'center' },
  previewEmoji: { fontSize: 52 },
  previewText: { color: '#F3E8FF', fontSize: 14, fontWeight: '800', marginTop: 8 },
  previewSub: { color: '#E9D5FF', fontSize: 11, fontWeight: '700', marginTop: 4 },
  crownText: {
    position: 'absolute',
    bottom: '14%',
    alignSelf: 'center',
    color: PROPRIOCEPTIVE_ADVENTURE_SHELL.gold,
    fontSize: 13,
    fontWeight: '900',
  },
  banner: {
    position: 'absolute',
    bottom: '22%',
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bannerText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
