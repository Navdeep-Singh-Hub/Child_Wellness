/** Energy Trail overlay — OT L9 S9 Game 1 */
import type { EnergyTrailTheme } from '@/components/game/occupational/level9/session9/enduranceEffortTheme';
import { ENDURANCE_EFFORT_SHELL } from '@/components/game/occupational/level9/session9/enduranceEffortTheme';
import type { EnergyTrailRound } from '@/components/game/occupational/level9/session9/enduranceEffortUtils';
import type { EnduranceZoneStatus } from '@/components/game/occupational/level9/session9/enduranceEffortUtils';
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
  theme: EnergyTrailTheme;
  roundDef: EnergyTrailRound;
  effort: number;
  form: number;
  stability: number;
  targetEffort: number;
  zoneStatus: EnduranceZoneStatus;
  holdProgress: number;
  captureProgress: number;
  capturing: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  capturedCount: number;
  trailProgress: number;
  holdSeconds: number;
  leftHand: { x: number; y: number } | null;
  rightHand: { x: number; y: number } | null;
  banner: string;
  quality: number;
  bandHalf: number;
};

export function EnergyTrailOverlay({
  theme,
  roundDef,
  effort,
  form,
  stability,
  targetEffort,
  zoneStatus,
  holdProgress,
  captureProgress,
  capturing,
  previewing,
  roundActive,
  round,
  totalRounds,
  capturedCount,
  trailProgress,
  holdSeconds,
  leftHand,
  rightHand,
  banner,
  quality,
  bandHalf,
}: Props) {
  const pulse = useSharedValue(0);
  const orbGlow = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  useEffect(() => {
    const ratio = Math.min(1, effort / Math.max(0.35, targetEffort));
    orbGlow.value = withTiming(capturing ? 1 : ratio, { duration: 220 });
  }, [capturing, effort, orbGlow, targetEffort]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: 0.22 + pulse.value * 0.38 }));
  const orbStyle = useAnimatedStyle(() => ({
    opacity: 0.42 + orbGlow.value * 0.52,
    transform: [{ scale: 1 + orbGlow.value * 0.08 }],
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
          key={`trail-${i}`}
          style={[styles.decor, pulseStyle, { left: `${5 + (i * 16) % 85}%`, top: `${3 + (i % 4) * 7}%` }]}
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
        <View style={[styles.handDot, { left: `${rightHand.x * 100}%`, top: `${rightHand.y * 100}%`, borderColor: theme.orb }]}>
          <Text style={styles.handLabel}>R</Text>
        </View>
      )}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          ENERGY {effortPct}% · TARGET {targetPct}% · FORM {formPct}% · STEADY {Math.round(stability * 100)}%
        </Text>
        <View style={styles.meterTrack}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${Math.min(100, effortPct)}%`,
                backgroundColor: inZone ? ENDURANCE_EFFORT_SHELL.good : zoneStatus === 'heavy' ? ENDURANCE_EFFORT_SHELL.warn : theme.accent,
              },
            ]}
          />
          <View style={[styles.zoneBand, { left: `${low * 100}%`, width: `${bandHalf * 2 * 100}%` }]} />
          <View style={[styles.targetTick, { left: `${targetPct}%` }]} />
        </View>
        <View style={styles.hudRow}>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={[styles.zoneBadge, { color: inZone ? ENDURANCE_EFFORT_SHELL.good : theme.orb }]}>
            {inZone ? 'STEADY' : zoneStatus === 'heavy' ? 'TOO STRONG' : 'POWER UP'}
          </Text>
          <Text style={styles.roundText}>
            Node {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      <View style={styles.waypointRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.waypointDot, { opacity: i < capturedCount ? 1 : 0.25 }]}>
            {i < capturedCount ? theme.waypoints[i % theme.waypoints.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.trailWrap}>
        <Text style={styles.trailLabel}>🛤️ ENERGY TRAIL {Math.round(trailProgress * 100)}%</Text>
        <View style={styles.trailTrack}>
          <LinearGradient
            colors={[theme.accentDeep, theme.accent, theme.orb]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.trailFill, { width: `${trailProgress * 100}%` }]}
          />
        </View>
      </View>

      {!previewing && (
        <Animated.View style={[styles.orbWrap, orbStyle]}>
          <View style={[styles.orb, { borderColor: inZone ? ENDURANCE_EFFORT_SHELL.good : theme.orb }]}>
            <Text style={styles.orbEmoji}>{roundDef.icon}</Text>
            <Text style={styles.orbLabel}>{roundDef.waypoint}</Text>
            <Text style={styles.holdHint}>Hold {holdSeconds.toFixed(1)}s</Text>
          </View>
          {roundActive && inZone && !capturing && (
            <View style={styles.holdRing}>
              <View style={[styles.holdFill, { width: `${holdProgress * 100}%` }]} />
            </View>
          )}
        </Animated.View>
      )}

      {previewing && (
        <View style={styles.previewWrap}>
          <Text style={styles.previewEmoji}>{roundDef.icon}</Text>
          <Text style={styles.previewText}>{roundDef.name}</Text>
          <Text style={styles.previewSub}>Energy target {targetPct}% · Hold {holdSeconds.toFixed(1)}s</Text>
        </View>
      )}

      {capturing && (
        <Text style={styles.captureText}>CAPTURING {Math.round(captureProgress * 100)}%</Text>
      )}

      {banner ? (
        <View style={[styles.banner, { backgroundColor: inZone ? ENDURANCE_EFFORT_SHELL.good : theme.accentDeep }]}>
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
  handLabel: { fontSize: 10, fontWeight: '900', color: '#0E7490' },
  hudWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(4,47,46,0.92)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.35)',
  },
  hudTitle: { color: '#CFFAFE', fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
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
    backgroundColor: ENDURANCE_EFFORT_SHELL.gold,
    borderRadius: 1,
  },
  hudRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  qualityText: { color: '#A7F3D0', fontSize: 11, fontWeight: '700' },
  zoneBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  roundText: { color: ENDURANCE_EFFORT_SHELL.gold, fontSize: 11, fontWeight: '800' },
  waypointRow: {
    position: 'absolute',
    top: 92,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(4,47,46,0.55)',
    borderRadius: 16,
  },
  waypointDot: { fontSize: 14 },
  trailWrap: {
    position: 'absolute',
    top: '22%',
    left: 14,
    right: 14,
  },
  trailLabel: { color: '#A7F3D0', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  trailTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  trailFill: { height: '100%', borderRadius: 4 },
  orbWrap: { position: 'absolute', top: '38%', alignSelf: 'center', alignItems: 'center' },
  orb: {
    width: 124,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 3,
    backgroundColor: 'rgba(4,47,46,0.75)',
    alignItems: 'center',
  },
  orbEmoji: { fontSize: 36 },
  orbLabel: { color: '#A7F3D0', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginTop: 4 },
  holdHint: { color: '#67E8F9', fontSize: 8, fontWeight: '800', marginTop: 3 },
  holdRing: {
    marginTop: 10,
    width: 110,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', backgroundColor: ENDURANCE_EFFORT_SHELL.good, borderRadius: 4 },
  previewWrap: { position: 'absolute', top: '40%', alignSelf: 'center', alignItems: 'center' },
  previewEmoji: { fontSize: 52 },
  previewText: { color: '#CFFAFE', fontSize: 14, fontWeight: '800', marginTop: 8 },
  previewSub: { color: '#67E8F9', fontSize: 11, fontWeight: '700', marginTop: 4 },
  captureText: {
    position: 'absolute',
    bottom: '14%',
    alignSelf: 'center',
    color: ENDURANCE_EFFORT_SHELL.gold,
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
