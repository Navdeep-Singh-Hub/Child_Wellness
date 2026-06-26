/** Pirate Cargo Mission overlay — OT L9 S10 Game 3 */
import type { PirateCargoMissionTheme } from '@/components/game/occupational/level9/session10/proprioceptiveAdventureTheme';
import { PROPRIOCEPTIVE_ADVENTURE_SHELL } from '@/components/game/occupational/level9/session10/proprioceptiveAdventureTheme';
import type { AdventureZoneStatus, PirateCargoMissionRound } from '@/components/game/occupational/level9/session10/proprioceptiveAdventureUtils';
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
  theme: PirateCargoMissionTheme;
  roundDef: PirateCargoMissionRound;
  pull: number;
  form: number;
  targetPull: number;
  zoneStatus: AdventureZoneStatus;
  holdProgress: number;
  loadProgress: number;
  loading: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  loadedCount: number;
  voyageProgress: number;
  holdSeconds: number;
  leftRope: { x: number; y: number } | null;
  rightRope: { x: number; y: number } | null;
  banner: string;
  quality: number;
  bandHalf: number;
};

export function PirateCargoMissionOverlay({
  theme,
  roundDef,
  pull,
  form,
  targetPull,
  zoneStatus,
  holdProgress,
  loadProgress,
  loading,
  previewing,
  roundActive,
  round,
  totalRounds,
  loadedCount,
  voyageProgress,
  holdSeconds,
  leftRope,
  rightRope,
  banner,
  quality,
  bandHalf,
}: Props) {
  const wave = useSharedValue(0);
  const crateLift = useSharedValue(0);

  useEffect(() => {
    wave.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [wave]);

  useEffect(() => {
    const ratio = Math.min(1, pull / Math.max(0.35, targetPull));
    crateLift.value = withTiming(loading ? 1 : ratio * 0.55, { duration: loading ? 560 : 220 });
  }, [pull, targetPull, loading, crateLift]);

  const waveStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + wave.value * 0.38,
  }));

  const crateStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -crateLift.value * 28 }],
  }));

  const pullPct = Math.round(pull * 100);
  const targetPct = Math.round(targetPull * 100);
  const formPct = Math.round(form * 100);
  const inZone = zoneStatus === 'zone';
  const low = targetPull - bandHalf;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`pirate-${i}`}
          style={[styles.decor, waveStyle, { left: `${5 + (i * 16) % 85}%`, top: `${3 + (i % 4) * 7}%` }]}
        >
          {d}
        </Animated.Text>
      ))}

      {leftRope && (
        <View style={[styles.ropeDot, { left: `${leftRope.x * 100}%`, top: `${leftRope.y * 100}%`, borderColor: theme.accent }]}>
          <Text style={styles.ropeLabel}>L</Text>
        </View>
      )}
      {rightRope && (
        <View style={[styles.ropeDot, { left: `${rightRope.x * 100}%`, top: `${rightRope.y * 100}%`, borderColor: theme.rope }]}>
          <Text style={styles.ropeLabel}>R</Text>
        </View>
      )}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          PULL {pullPct}% · TARGET {targetPct}% · FORM {formPct}%
        </Text>
        <View style={styles.meterTrack}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${Math.min(100, pullPct)}%`,
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
            {inZone ? 'STEADY PULL' : zoneStatus === 'heavy' ? 'TOO STRONG' : 'PULL FIRMER'}
          </Text>
          <Text style={styles.roundText}>
            Deck {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      <View style={styles.loadedRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.loadedDot, { opacity: i < loadedCount ? 1 : 0.25 }]}>
            {i < loadedCount ? theme.cargo[i % theme.cargo.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.voyageWrap}>
        <Text style={styles.voyageLabel}>⚓ VOYAGE LOAD {Math.round(voyageProgress * 100)}%</Text>
        <View style={styles.voyageTrack}>
          <LinearGradient
            colors={[theme.accentDeep, theme.accent, theme.rope]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.voyageFill, { width: `${voyageProgress * 100}%` }]}
          />
        </View>
      </View>

      {!previewing && (
        <View style={styles.crateWrap}>
          <Animated.View style={[styles.crateCard, crateStyle, { borderColor: inZone ? PROPRIOCEPTIVE_ADVENTURE_SHELL.good : theme.rope }]}>
            <Text style={styles.crateEmoji}>{roundDef.icon}</Text>
            <Text style={styles.crateLabel}>{roundDef.crate}</Text>
            <Text style={styles.holdHint}>Pull {holdSeconds.toFixed(1)}s</Text>
          </Animated.View>
          {roundActive && inZone && !loading && (
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
          <Text style={styles.previewSub}>Pull target {targetPct}% · Hold {holdSeconds.toFixed(1)}s</Text>
        </View>
      )}

      {loading && (
        <Text style={styles.loadText}>LOADING {Math.round(loadProgress * 100)}%</Text>
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
  ropeDot: {
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
  ropeLabel: { fontSize: 10, fontWeight: '900', color: '#92400E' },
  hudWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(28,25,23,0.92)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
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
    backgroundColor: 'rgba(245,158,11,0.25)',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.45)',
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
  qualityText: { color: '#FDE68A', fontSize: 11, fontWeight: '700' },
  zoneBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  roundText: { color: PROPRIOCEPTIVE_ADVENTURE_SHELL.gold, fontSize: 11, fontWeight: '800' },
  loadedRow: {
    position: 'absolute',
    top: 92,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(28,25,23,0.55)',
    borderRadius: 16,
  },
  loadedDot: { fontSize: 14 },
  voyageWrap: {
    position: 'absolute',
    top: '22%',
    left: 14,
    right: 14,
  },
  voyageLabel: { color: '#FDE68A', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  voyageTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  voyageFill: { height: '100%', borderRadius: 4 },
  crateWrap: { position: 'absolute', top: '38%', alignSelf: 'center', alignItems: 'center' },
  crateCard: {
    width: 120,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 3,
    backgroundColor: 'rgba(120,53,15,0.75)',
    alignItems: 'center',
  },
  crateEmoji: { fontSize: 36 },
  crateLabel: { color: '#FEF3C7', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginTop: 4 },
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
  previewText: { color: '#FEF3C7', fontSize: 14, fontWeight: '800', marginTop: 8 },
  previewSub: { color: '#FDE68A', fontSize: 11, fontWeight: '700', marginTop: 4 },
  loadText: {
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
