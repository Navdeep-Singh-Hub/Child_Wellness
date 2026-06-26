/** Launch Power overlay — OT L9 S5 Game 1 */
import type { LaunchPowerTheme } from '@/components/game/occupational/level9/session5/resistanceTheme';
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
  theme: LaunchPowerTheme;
  power: number;
  form: number;
  targetPower: number;
  zoneStatus: ResistanceZoneStatus;
  holdProgress: number;
  blastProgress: number;
  blasting: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  launchCount: number;
  bayProgress: number;
  leftPalm: { x: number; y: number } | null;
  rightPalm: { x: number; y: number } | null;
  banner: string;
  quality: number;
  bandHalf: number;
};

export function LaunchPowerOverlay({
  theme,
  power,
  form,
  targetPower,
  zoneStatus,
  holdProgress,
  blastProgress,
  blasting,
  previewing,
  roundActive,
  round,
  totalRounds,
  launchCount,
  bayProgress,
  leftPalm,
  rightPalm,
  banner,
  quality,
  bandHalf,
}: Props) {
  const glow = useSharedValue(0);
  const lift = useSharedValue(0);
  const flame = useSharedValue(0);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1050, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1050, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [glow]);

  useEffect(() => {
    const ratio = Math.min(1, power / Math.max(0.35, targetPower));
    lift.value = withTiming(blasting ? 1 : ratio * 0.42, { duration: blasting ? 600 : 220 });
  }, [power, targetPower, blasting, lift]);

  useEffect(() => {
    if (roundActive && zoneStatus === 'zone') {
      flame.value = withRepeat(
        withSequence(withTiming(1, { duration: 90 }), withTiming(0.35, { duration: 90 })),
        -1,
        false,
      );
    } else {
      flame.value = withTiming(0, { duration: 200 });
    }
  }, [roundActive, zoneStatus, flame]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + glow.value * 0.38,
  }));

  const rocketStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: blasting ? -90 - blastProgress * 200 : -lift.value * 52 },
      { scale: blasting ? 1 + blastProgress * 0.22 : 1 },
    ],
    opacity: blasting && blastProgress > 0.88 ? 1 - (blastProgress - 0.88) / 0.12 : 1,
  }));

  const flameStyle = useAnimatedStyle(() => ({
    opacity: flame.value,
    transform: [{ scaleY: 0.55 + flame.value * 0.55 }],
  }));

  const powerPct = Math.round(power * 100);
  const targetPct = Math.round(targetPower * 100);
  const formPct = Math.round(form * 100);
  const inZone = zoneStatus === 'zone';
  const low = targetPower - bandHalf;
  const high = targetPower + bandHalf;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`bay-${i}`}
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
        <View style={[styles.palmDot, { left: `${rightPalm.x * 100}%`, top: `${rightPalm.y * 100}%`, borderColor: theme.ignition }]}>
          <Text style={styles.palmLabel}>R</Text>
        </View>
      )}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          IGNITION {powerPct}% · TARGET {targetPct}% · FORM {formPct}%
        </Text>
        <View style={styles.meterTrack}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${Math.min(100, powerPct)}%`,
                backgroundColor: inZone ? RESISTANCE_SHELL.good : zoneStatus === 'heavy' ? RESISTANCE_SHELL.warn : theme.accent,
              },
            ]}
          />
          <View style={[styles.zoneBand, { left: `${low * 100}%`, width: `${bandHalf * 2 * 100}%` }]} />
          <View style={[styles.targetTick, { left: `${targetPct}%` }]} />
        </View>
        <View style={styles.hudRow}>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={[styles.zoneBadge, { color: inZone ? RESISTANCE_SHELL.good : theme.ignition }]}>
            {inZone ? 'IN ZONE' : zoneStatus === 'heavy' ? 'TOO HOT' : 'TOO LOW'}
          </Text>
          <Text style={styles.roundText}>
            Launch {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      <View style={styles.orbitRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.orbitDot, { opacity: i < launchCount ? 1 : 0.25 }]}>
            {i < launchCount ? theme.orbits[i % theme.orbits.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.bayWrap}>
        <Text style={styles.bayLabel}>🛸 BAY {Math.round(bayProgress * 100)}%</Text>
        <View style={styles.bayBar}>
          <LinearGradient
            colors={[theme.accentDeep, theme.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.bayFill, { width: `${bayProgress * 100}%` }]}
          />
        </View>
      </View>

      {!previewing && (
        <Animated.View style={[styles.rocketWrap, rocketStyle]}>
          <View style={[styles.launchPad, { borderColor: inZone ? RESISTANCE_SHELL.good : theme.accentDeep }]}>
            <Text style={styles.padLabel}>LAUNCH PAD</Text>
          </View>
          <Text style={styles.rocketEmoji}>{theme.emoji}</Text>
          <Text style={styles.orbitEmoji}>{theme.orbits[round % theme.orbits.length]}</Text>
          <Animated.Text style={[styles.flameEmoji, flameStyle]}>🔥</Animated.Text>
          {roundActive && inZone && !blasting && (
            <View style={styles.holdRing}>
              <View style={[styles.holdFill, { width: `${holdProgress * 100}%` }]} />
            </View>
          )}
        </Animated.View>
      )}

      {previewing && (
        <View style={styles.previewWrap}>
          <Text style={styles.previewEmoji}>🚀</Text>
          <Text style={styles.previewText}>Resistance target {targetPct}%</Text>
        </View>
      )}

      {blasting && (
        <Text style={styles.blastText}>BLAST OFF {Math.round(blastProgress * 100)}%</Text>
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
  palmLabel: { fontSize: 10, fontWeight: '900', color: '#5B21B6' },
  hudWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(15,10,30,0.92)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.35)',
  },
  hudTitle: { color: '#EDE9FE', fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
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
  qualityText: { color: '#C4B5FD', fontSize: 11, fontWeight: '700' },
  zoneBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  roundText: { color: RESISTANCE_SHELL.gold, fontSize: 11, fontWeight: '800' },
  orbitRow: {
    position: 'absolute',
    top: 92,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(15,10,30,0.55)',
    borderRadius: 16,
  },
  orbitDot: { fontSize: 14 },
  bayWrap: { position: 'absolute', top: '22%', left: 14, right: 14 },
  bayLabel: { color: '#C4B5FD', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  bayBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  bayFill: { height: '100%', borderRadius: 4 },
  rocketWrap: { position: 'absolute', top: '36%', alignSelf: 'center', alignItems: 'center' },
  launchPad: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: 'rgba(91,33,182,0.35)',
    marginBottom: 8,
  },
  padLabel: { color: '#EDE9FE', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  rocketEmoji: { fontSize: 56 },
  orbitEmoji: { fontSize: 24, marginTop: 4 },
  flameEmoji: { fontSize: 28, marginTop: 4 },
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
  previewText: { color: '#C4B5FD', fontSize: 14, fontWeight: '800', marginTop: 8 },
  blastText: {
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
