/** Mountain Rescue overlay — OT L9 S10 Game 4 */
import type { MountainRescueTheme } from '@/components/game/occupational/level9/session10/proprioceptiveAdventureTheme';
import { PROPRIOCEPTIVE_ADVENTURE_SHELL } from '@/components/game/occupational/level9/session10/proprioceptiveAdventureTheme';
import type { AdventureZoneStatus, MountainRescueRound } from '@/components/game/occupational/level9/session10/proprioceptiveAdventureUtils';
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
  theme: MountainRescueTheme;
  roundDef: MountainRescueRound;
  effort: number;
  form: number;
  targetEffort: number;
  zoneStatus: AdventureZoneStatus;
  holdProgress: number;
  saveProgress: number;
  saving: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  rescuedCount: number;
  ridgeProgress: number;
  holdSeconds: number;
  leftPalm: { x: number; y: number } | null;
  rightPalm: { x: number; y: number } | null;
  banner: string;
  quality: number;
  bandHalf: number;
};

export function MountainRescueOverlay({
  theme,
  roundDef,
  effort,
  form,
  targetEffort,
  zoneStatus,
  holdProgress,
  saveProgress,
  saving,
  previewing,
  roundActive,
  round,
  totalRounds,
  rescuedCount,
  ridgeProgress,
  holdSeconds,
  leftPalm,
  rightPalm,
  banner,
  quality,
  bandHalf,
}: Props) {
  const snow = useSharedValue(0);
  const climberLift = useSharedValue(0);

  useEffect(() => {
    snow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1300, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [snow]);

  useEffect(() => {
    const ratio = Math.min(1, effort / Math.max(0.35, targetEffort));
    climberLift.value = withTiming(saving ? 1 : ratio * 0.5, { duration: saving ? 580 : 220 });
  }, [effort, saving, targetEffort, climberLift]);

  const snowStyle = useAnimatedStyle(() => ({
    opacity: 0.18 + snow.value * 0.36,
  }));

  const climberStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -climberLift.value * 32 }],
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
          key={`mountain-${i}`}
          style={[styles.decor, snowStyle, { left: `${5 + (i * 16) % 85}%`, top: `${3 + (i % 4) * 7}%` }]}
        >
          {d}
        </Animated.Text>
      ))}

      {leftPalm && (
        <View style={[styles.palmDot, { left: `${leftPalm.x * 100}%`, top: `${leftPalm.y * 100}%`, borderColor: theme.accent }]}>
          <Text style={styles.palmLabel}>L</Text>
        </View>
      )}
      {rightPalm && (
        <View style={[styles.palmDot, { left: `${rightPalm.x * 100}%`, top: `${rightPalm.y * 100}%`, borderColor: theme.rope }]}>
          <Text style={styles.palmLabel}>R</Text>
        </View>
      )}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          BRACE {effortPct}% · TARGET {targetPct}% · FORM {formPct}%
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
          <Text style={[styles.zoneBadge, { color: inZone ? PROPRIOCEPTIVE_ADVENTURE_SHELL.good : theme.rope }]}>
            {inZone ? 'STEADY BRACE' : zoneStatus === 'heavy' ? 'TOO STRONG' : 'BRACE FIRMER'}
          </Text>
          <Text style={styles.roundText}>
            Ridge {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      <View style={styles.rescuedRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.rescuedDot, { opacity: i < rescuedCount ? 1 : 0.25 }]}>
            {i < rescuedCount ? theme.rescues[i % theme.rescues.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.ridgeWrap}>
        <Text style={styles.ridgeLabel}>⛰️ RESCUE RIDGE {Math.round(ridgeProgress * 100)}%</Text>
        <View style={styles.ridgeTrack}>
          <LinearGradient
            colors={[theme.accentDeep, theme.accent, theme.rope]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.ridgeFill, { width: `${ridgeProgress * 100}%` }]}
          />
        </View>
      </View>

      {!previewing && (
        <View style={styles.ledgeWrap}>
          <Animated.View style={[styles.ledgeCard, climberStyle, { borderColor: inZone ? PROPRIOCEPTIVE_ADVENTURE_SHELL.good : theme.rope }]}>
            <Text style={styles.ledgeEmoji}>{roundDef.icon}</Text>
            <Text style={styles.ledgeLabel}>{roundDef.ledge}</Text>
            <Text style={styles.holdHint}>Brace {holdSeconds.toFixed(1)}s</Text>
          </Animated.View>
          {roundActive && inZone && !saving && (
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
          <Text style={styles.previewSub}>Brace target {targetPct}% · Hold {holdSeconds.toFixed(1)}s</Text>
        </View>
      )}

      {saving && (
        <Text style={styles.saveText}>RESCUING {Math.round(saveProgress * 100)}%</Text>
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
  palmDot: {
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
  palmLabel: { fontSize: 10, fontWeight: '900', color: '#1E40AF' },
  hudWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.35)',
  },
  hudTitle: { color: '#E0F2FE', fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
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
    backgroundColor: 'rgba(96,165,250,0.25)',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.45)',
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
  qualityText: { color: '#BAE6FD', fontSize: 11, fontWeight: '700' },
  zoneBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  roundText: { color: PROPRIOCEPTIVE_ADVENTURE_SHELL.gold, fontSize: 11, fontWeight: '800' },
  rescuedRow: {
    position: 'absolute',
    top: 92,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(15,23,42,0.55)',
    borderRadius: 16,
  },
  rescuedDot: { fontSize: 14 },
  ridgeWrap: {
    position: 'absolute',
    top: '22%',
    left: 14,
    right: 14,
  },
  ridgeLabel: { color: '#BAE6FD', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  ridgeTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  ridgeFill: { height: '100%', borderRadius: 4 },
  ledgeWrap: { position: 'absolute', top: '38%', alignSelf: 'center', alignItems: 'center' },
  ledgeCard: {
    width: 120,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 3,
    backgroundColor: 'rgba(51,65,85,0.75)',
    alignItems: 'center',
  },
  ledgeEmoji: { fontSize: 36 },
  ledgeLabel: { color: '#E0F2FE', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginTop: 4 },
  holdHint: { color: '#93C5FD', fontSize: 8, fontWeight: '800', marginTop: 3 },
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
  previewText: { color: '#E0F2FE', fontSize: 14, fontWeight: '800', marginTop: 8 },
  previewSub: { color: '#93C5FD', fontSize: 11, fontWeight: '700', marginTop: 4 },
  saveText: {
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
