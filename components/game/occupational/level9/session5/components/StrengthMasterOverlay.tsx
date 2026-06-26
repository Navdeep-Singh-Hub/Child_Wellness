/** Strength Master overlay — OT L9 S5 Game 5 */
import type { StrengthMasterTheme } from '@/components/game/occupational/level9/session5/resistanceTheme';
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
  theme: StrengthMasterTheme;
  hold: number;
  form: number;
  targetHold: number;
  zoneStatus: ResistanceZoneStatus;
  holdProgress: number;
  crownProgress: number;
  crowning: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  crownedCount: number;
  colosseumProgress: number;
  leftPalm: { x: number; y: number } | null;
  rightPalm: { x: number; y: number } | null;
  banner: string;
  quality: number;
  bandHalf: number;
};

export function StrengthMasterOverlay({
  theme,
  hold,
  form,
  targetHold,
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
  leftPalm,
  rightPalm,
  banner,
  quality,
  bandHalf,
}: Props) {
  const glow = useSharedValue(0);
  const pillarPress = useSharedValue(0);
  const crownBurst = useSharedValue(0);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 980, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 980, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [glow]);

  useEffect(() => {
    const ratio = Math.min(1, hold / Math.max(0.35, targetHold));
    pillarPress.value = withTiming(crowning ? 1 : ratio * 0.5, { duration: crowning ? 540 : 220 });
  }, [hold, targetHold, crowning, pillarPress]);

  useEffect(() => {
    if (roundActive && zoneStatus === 'zone') {
      crownBurst.value = withRepeat(
        withSequence(withTiming(1, { duration: 210 }), withTiming(0.25, { duration: 210 })),
        -1,
        false,
      );
    } else {
      crownBurst.value = withTiming(0, { duration: 200 });
    }
  }, [roundActive, zoneStatus, crownBurst]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + glow.value * 0.36,
  }));

  const pillarStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -pillarPress.value * 8 }, { scale: crowning ? 1 + crownProgress * 0.08 : 1 }],
  }));

  const crownStyle = useAnimatedStyle(() => ({
    opacity: crownBurst.value,
    transform: [{ scale: 0.8 + crownBurst.value * 0.35 }],
  }));

  const holdPct = Math.round(hold * 100);
  const targetPct = Math.round(targetHold * 100);
  const formPct = Math.round(form * 100);
  const inZone = zoneStatus === 'zone';
  const low = targetHold - bandHalf;
  const high = targetHold + bandHalf;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`colosseum-${i}`}
          style={[styles.decor, glowStyle, { left: `${4 + (i * 15) % 88}%`, top: `${2 + (i % 4) * 7}%` }]}
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
        <View style={[styles.palmDot, { left: `${rightPalm.x * 100}%`, top: `${rightPalm.y * 100}%`, borderColor: theme.pillar }]}>
          <Text style={styles.palmLabel}>R</Text>
        </View>
      )}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          HOLD {holdPct}% · TARGET {targetPct}% · FORM {formPct}%
        </Text>
        <View style={styles.meterTrack}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${Math.min(100, holdPct)}%`,
                backgroundColor: inZone ? RESISTANCE_SHELL.good : zoneStatus === 'heavy' ? RESISTANCE_SHELL.warn : theme.accent,
              },
            ]}
          />
          <View style={[styles.zoneBand, { left: `${low * 100}%`, width: `${bandHalf * 2 * 100}%` }]} />
          <View style={[styles.targetTick, { left: `${targetPct}%` }]} />
        </View>
        <View style={styles.hudRow}>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={[styles.zoneBadge, { color: inZone ? RESISTANCE_SHELL.good : theme.pillar }]}>
            {inZone ? 'HOLDING' : zoneStatus === 'heavy' ? 'TOO STRONG' : 'TOO LIGHT'}
          </Text>
          <Text style={styles.roundText}>
            Pillar {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      <View style={styles.crownRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.crownDot, { opacity: i < crownedCount ? 1 : 0.25 }]}>
            {i < crownedCount ? theme.crowns[i % theme.crowns.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.colosseumWrap}>
        <Text style={styles.colosseumLabel}>🏛️ COLOSSEUM {Math.round(colosseumProgress * 100)}%</Text>
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
        <Animated.View style={[styles.pillarWrap, pillarStyle]}>
          <Text style={styles.pillarEmoji}>🏛️</Text>
          <Text style={styles.strengthEmoji}>{theme.emoji}</Text>
          <Animated.Text style={[styles.crownEmoji, crownStyle]}>👑✨</Animated.Text>
          <Text style={styles.roundEmoji}>{theme.crowns[round % theme.crowns.length]}</Text>
          <Text style={styles.holdLabel}>HOLD OVERHEAD</Text>
          {roundActive && inZone && !crowning && (
            <View style={styles.holdRing}>
              <View style={[styles.holdFill, { width: `${holdProgress * 100}%` }]} />
            </View>
          )}
        </Animated.View>
      )}

      {previewing && (
        <View style={styles.previewWrap}>
          <Text style={styles.previewEmoji}>💪</Text>
          <Text style={styles.previewText}>Pillar resistance {targetPct}%</Text>
        </View>
      )}

      {crowning && (
        <Text style={styles.crownText}>CROWNING {Math.round(crownProgress * 100)}%</Text>
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
  palmLabel: { fontSize: 10, fontWeight: '900', color: '#A16207' },
  hudWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(28,25,23,0.92)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(234,179,8,0.35)',
  },
  hudTitle: { color: '#FEF9C3', fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
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
  qualityText: { color: '#FDE047', fontSize: 11, fontWeight: '700' },
  zoneBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  roundText: { color: RESISTANCE_SHELL.gold, fontSize: 11, fontWeight: '800' },
  crownRow: {
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
  crownDot: { fontSize: 14 },
  colosseumWrap: { position: 'absolute', top: '22%', left: 14, right: 14 },
  colosseumLabel: { color: '#FDE047', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  colosseumBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  colosseumFill: { height: '100%', borderRadius: 4 },
  pillarWrap: { position: 'absolute', top: '36%', alignSelf: 'center', alignItems: 'center' },
  pillarEmoji: { fontSize: 52 },
  strengthEmoji: { fontSize: 34, marginTop: 2 },
  crownEmoji: { fontSize: 24, marginTop: 4 },
  roundEmoji: { fontSize: 22, marginTop: 4 },
  holdLabel: { color: '#FDE047', fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginTop: 6 },
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
  previewText: { color: '#FDE047', fontSize: 14, fontWeight: '800', marginTop: 8 },
  crownText: {
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
