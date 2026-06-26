/** Gorilla Power overlay — OT L9 S4 Game 3 */
import type { GorillaPowerTheme } from '@/components/game/occupational/level9/session4/heavyWorkTheme';
import { HEAVY_WORK_SHELL } from '@/components/game/occupational/level9/session4/heavyWorkTheme';
import type { CarryZoneStatus } from '@/components/game/occupational/level9/session4/heavyWorkUtils';
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
  theme: GorillaPowerTheme;
  power: number;
  form: number;
  targetPower: number;
  zoneStatus: CarryZoneStatus;
  holdProgress: number;
  roarProgress: number;
  roaring: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  beatCount: number;
  groveProgress: number;
  leftHand: { x: number; y: number } | null;
  rightHand: { x: number; y: number } | null;
  banner: string;
  quality: number;
  bandHalf: number;
};

export function GorillaPowerOverlay({
  theme,
  power,
  form,
  targetPower,
  zoneStatus,
  holdProgress,
  roarProgress,
  roaring,
  previewing,
  roundActive,
  round,
  totalRounds,
  beatCount,
  groveProgress,
  leftHand,
  rightHand,
  banner,
  quality,
  bandHalf,
}: Props) {
  const pulse = useSharedValue(0);
  const beat = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  useEffect(() => {
    if (roundActive && zoneStatus === 'zone') {
      beat.value = withRepeat(
        withSequence(withTiming(1, { duration: 280 }), withTiming(0.3, { duration: 280 })),
        -1,
        false,
      );
    } else {
      beat.value = withTiming(0, { duration: 200 });
    }
  }, [roundActive, zoneStatus, beat]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.22 + pulse.value * 0.38,
  }));

  const beatStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + beat.value * 0.12 }],
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
          key={`jungle-${i}`}
          style={[styles.decor, pulseStyle, { left: `${3 + (i * 16) % 90}%`, top: `${2 + (i % 5) * 6}%` }]}
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
        <View style={[styles.handDot, { left: `${rightHand.x * 100}%`, top: `${rightHand.y * 100}%`, borderColor: theme.jungle }]}>
          <Text style={styles.handLabel}>R</Text>
        </View>
      )}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          POWER {powerPct}% · TARGET {targetPct}% · FORM {formPct}%
        </Text>
        <View style={styles.meterTrack}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${Math.min(100, powerPct)}%`,
                backgroundColor: inZone ? HEAVY_WORK_SHELL.good : zoneStatus === 'heavy' ? HEAVY_WORK_SHELL.warn : theme.accent,
              },
            ]}
          />
          <View style={[styles.zoneBand, { left: `${low * 100}%`, width: `${bandHalf * 2 * 100}%` }]} />
          <View style={[styles.targetTick, { left: `${targetPct}%` }]} />
        </View>
        <View style={styles.hudRow}>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={[styles.zoneBadge, { color: inZone ? HEAVY_WORK_SHELL.good : theme.jungle }]}>
            {inZone ? 'GORILLA' : zoneStatus === 'heavy' ? 'TOO STRONG' : 'TOO SOFT'}
          </Text>
          <Text style={styles.roundText}>
            Beat {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      <View style={styles.beatRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.beatDot, { opacity: i < beatCount ? 1 : 0.25 }]}>
            {i < beatCount ? theme.beats[i % theme.beats.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.groveWrap}>
        <Text style={styles.groveLabel}>🌿 GROVE {Math.round(groveProgress * 100)}%</Text>
        <View style={styles.groveTrack}>
          <LinearGradient
            colors={[theme.accentDeep, theme.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.groveFill, { width: `${groveProgress * 100}%` }]}
          />
        </View>
      </View>

      {!previewing && (
        <Animated.View style={[styles.gorillaWrap, beatStyle]}>
          <Text style={styles.gorillaEmoji}>🦍</Text>
          <Text style={styles.gorillaLabel}>CHEST BEAT</Text>
          <Text style={styles.beatIcon}>{theme.beats[round % theme.beats.length]}</Text>
          {roundActive && inZone && !roaring && (
            <View style={styles.holdRing}>
              <View style={[styles.holdFill, { width: `${holdProgress * 100}%` }]} />
            </View>
          )}
        </Animated.View>
      )}

      {previewing && (
        <View style={styles.previewWrap}>
          <Text style={styles.previewEmoji}>🦍</Text>
          <Text style={styles.previewText}>Power level {targetPct}%</Text>
        </View>
      )}

      {roaring && (
        <Text style={styles.roarText}>ROARING {Math.round(roarProgress * 100)}%</Text>
      )}

      {banner ? (
        <View style={[styles.banner, { backgroundColor: inZone ? HEAVY_WORK_SHELL.good : theme.accentDeep }]}>
          <Text style={styles.bannerText}>{banner}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  decor: { position: 'absolute', fontSize: 19 },
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
  handLabel: { fontSize: 10, fontWeight: '900', color: '#3F6212' },
  hudWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(22,101,52,0.92)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(132,204,22,0.35)',
  },
  hudTitle: { color: '#F7FEE7', fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
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
    backgroundColor: HEAVY_WORK_SHELL.gold,
    borderRadius: 1,
  },
  hudRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  qualityText: { color: '#BEF264', fontSize: 11, fontWeight: '700' },
  zoneBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  roundText: { color: HEAVY_WORK_SHELL.gold, fontSize: 11, fontWeight: '800' },
  beatRow: {
    position: 'absolute',
    top: 92,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(22,101,52,0.55)',
    borderRadius: 16,
  },
  beatDot: { fontSize: 14 },
  groveWrap: { position: 'absolute', top: '22%', left: 14, right: 14 },
  groveLabel: { color: '#BEF264', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  groveTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  groveFill: { height: '100%', borderRadius: 4 },
  gorillaWrap: { position: 'absolute', top: '38%', alignSelf: 'center', alignItems: 'center' },
  gorillaEmoji: { fontSize: 64 },
  gorillaLabel: { color: '#BEF264', fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginTop: 4 },
  beatIcon: { fontSize: 28, marginTop: 6 },
  holdRing: {
    marginTop: 10,
    width: 110,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', backgroundColor: HEAVY_WORK_SHELL.good, borderRadius: 4 },
  previewWrap: { position: 'absolute', top: '40%', alignSelf: 'center', alignItems: 'center' },
  previewEmoji: { fontSize: 72 },
  previewText: { color: '#BEF264', fontSize: 14, fontWeight: '800', marginTop: 8 },
  roarText: {
    position: 'absolute',
    bottom: '14%',
    alignSelf: 'center',
    color: HEAVY_WORK_SHELL.gold,
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
