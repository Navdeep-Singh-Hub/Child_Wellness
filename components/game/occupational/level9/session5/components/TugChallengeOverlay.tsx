/** Tug Challenge overlay — OT L9 S5 Game 3 */
import type { TugChallengeTheme } from '@/components/game/occupational/level9/session5/resistanceTheme';
import { RESISTANCE_SHELL } from '@/components/game/occupational/level9/session5/resistanceTheme';
import type { ResistanceZoneStatus } from '@/components/game/occupational/level9/session5/resistanceUtils';
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
  theme: TugChallengeTheme;
  tug: number;
  form: number;
  targetTug: number;
  zoneStatus: ResistanceZoneStatus;
  holdProgress: number;
  winProgress: number;
  winning: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  winCount: number;
  arenaProgress: number;
  leftHandle: { x: number; y: number } | null;
  rightHandle: { x: number; y: number } | null;
  banner: string;
  quality: number;
  bandHalf: number;
};

export function TugChallengeOverlay({
  theme,
  tug,
  form,
  targetTug,
  zoneStatus,
  holdProgress,
  winProgress,
  winning,
  previewing,
  roundActive,
  round,
  totalRounds,
  winCount,
  arenaProgress,
  leftHandle,
  rightHandle,
  banner,
  quality,
  bandHalf,
}: Props) {
  const pulse = useSharedValue(0);
  const ropeShift = useSharedValue(0);
  const strain = useSharedValue(0);

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
    const ratio = Math.min(1, tug / Math.max(0.35, targetTug));
    ropeShift.value = withTiming(winning ? 1 : ratio * 0.62, { duration: winning ? 560 : 220 });
  }, [tug, targetTug, winning, ropeShift]);

  useEffect(() => {
    if (roundActive && zoneStatus === 'zone') {
      strain.value = withRepeat(
        withSequence(withTiming(1, { duration: 260 }), withTiming(0.25, { duration: 260 })),
        -1,
        false,
      );
    } else {
      strain.value = withTiming(0, { duration: 200 });
    }
  }, [roundActive, zoneStatus, strain]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.22 + pulse.value * 0.36,
  }));

  const ropeStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: 1 + ropeShift.value * 0.18 }, { translateX: ropeShift.value * 22 }],
  }));

  const strainStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + strain.value * 0.55,
  }));

  const tugPct = Math.round(tug * 100);
  const targetPct = Math.round(targetTug * 100);
  const formPct = Math.round(form * 100);
  const inZone = zoneStatus === 'zone';
  const low = targetTug - bandHalf;
  const high = targetTug + bandHalf;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`arena-${i}`}
          style={[styles.decor, pulseStyle, { left: `${4 + (i * 15) % 88}%`, top: `${2 + (i % 4) * 7}%` }]}
        >
          {d}
        </Animated.Text>
      ))}

      {leftHandle && (
        <View style={[styles.handleDot, { left: `${leftHandle.x * 100}%`, top: `${leftHandle.y * 100}%`, borderColor: theme.accent }]}>
          <Text style={styles.handleLabel}>L</Text>
        </View>
      )}
      {rightHandle && (
        <View style={[styles.handleDot, { left: `${rightHandle.x * 100}%`, top: `${rightHandle.y * 100}%`, borderColor: theme.rope }]}>
          <Text style={styles.handleLabel}>R</Text>
        </View>
      )}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          TUG {tugPct}% · TARGET {targetPct}% · FORM {formPct}%
        </Text>
        <View style={styles.meterTrack}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${Math.min(100, tugPct)}%`,
                backgroundColor: inZone ? RESISTANCE_SHELL.good : zoneStatus === 'heavy' ? RESISTANCE_SHELL.warn : theme.accent,
              },
            ]}
          />
          <View style={[styles.zoneBand, { left: `${low * 100}%`, width: `${bandHalf * 2 * 100}%` }]} />
          <View style={[styles.targetTick, { left: `${targetPct}%` }]} />
        </View>
        <View style={styles.hudRow}>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={[styles.zoneBadge, { color: inZone ? RESISTANCE_SHELL.good : theme.rope }]}>
            {inZone ? 'TUGGING' : zoneStatus === 'heavy' ? 'TOO HARD' : 'TOO LIGHT'}
          </Text>
          <Text style={styles.roundText}>
            Round {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      <View style={styles.winRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.winDot, { opacity: i < winCount ? 1 : 0.25 }]}>
            {i < winCount ? theme.rounds[i % theme.rounds.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.arenaWrap}>
        <Text style={styles.arenaLabel}>🏆 ARENA {Math.round(arenaProgress * 100)}%</Text>
        <View style={styles.arenaBar}>
          <LinearGradient
            colors={[theme.accentDeep, theme.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.arenaFill, { width: `${arenaProgress * 100}%` }]}
          />
        </View>
      </View>

      {!previewing && (
        <Animated.View style={[styles.tugWrap, ropeStyle]}>
          <Animated.Text style={[styles.ropeLine, strainStyle]}>🪢━━━━━━🪢</Animated.Text>
          <Text style={styles.battleEmoji}>{theme.rounds[round % theme.rounds.length]}</Text>
          <Text style={styles.trophyEmoji}>🏆</Text>
          <Text style={styles.tugLabel}>TUG TUG</Text>
          {roundActive && inZone && !winning && (
            <View style={styles.holdRing}>
              <View style={[styles.holdFill, { width: `${holdProgress * 100}%` }]} />
            </View>
          )}
        </Animated.View>
      )}

      {previewing && (
        <View style={styles.previewWrap}>
          <Text style={styles.previewEmoji}>🪢</Text>
          <Text style={styles.previewText}>Tug resistance {targetPct}%</Text>
        </View>
      )}

      {winning && (
        <Text style={styles.winText}>YOU WIN {Math.round(winProgress * 100)}%</Text>
      )}

      {banner ? (
        <View style={[styles.banner, { backgroundColor: inZone ? RESISTANCE_SHELL.good : theme.accentDeep }]}>
          <Text style={styles.bannerText}>{banner}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  decor: { position: 'absolute', fontSize: 18 },
  handleDot: {
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
  handleLabel: { fontSize: 10, fontWeight: '900', color: '#991B1B' },
  hudWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(28,25,23,0.92)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
  },
  hudTitle: { color: '#FEE2E2', fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
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
    backgroundColor: RESISTANCE_SHELL.gold,
    borderRadius: 1,
  },
  hudRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  qualityText: { color: '#FECACA', fontSize: 11, fontWeight: '700' },
  zoneBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  roundText: { color: RESISTANCE_SHELL.gold, fontSize: 11, fontWeight: '800' },
  winRow: {
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
  winDot: { fontSize: 14 },
  arenaWrap: { position: 'absolute', top: '22%', left: 14, right: 14 },
  arenaLabel: { color: '#FECACA', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  arenaBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  arenaFill: { height: '100%', borderRadius: 4 },
  tugWrap: { position: 'absolute', top: '38%', alignSelf: 'center', alignItems: 'center' },
  ropeLine: { fontSize: 20, marginBottom: 8, letterSpacing: 1 },
  battleEmoji: { fontSize: 52 },
  trophyEmoji: { fontSize: 28, marginTop: 4 },
  tugLabel: { color: '#FECACA', fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginTop: 6 },
  holdRing: {
    marginTop: 10,
    width: 110,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', backgroundColor: RESISTANCE_SHELL.good, borderRadius: 4 },
  previewWrap: { position: 'absolute', top: '40%', alignSelf: 'center', alignItems: 'center' },
  previewEmoji: { fontSize: 68 },
  previewText: { color: '#FECACA', fontSize: 14, fontWeight: '800', marginTop: 8 },
  winText: {
    position: 'absolute',
    bottom: '14%',
    alignSelf: 'center',
    color: RESISTANCE_SHELL.gold,
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
