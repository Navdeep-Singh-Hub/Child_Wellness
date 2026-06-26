/** Mountain Push overlay — OT L9 S9 Game 3 */
import type { MountainPushTheme } from '@/components/game/occupational/level9/session9/enduranceEffortTheme';
import { ENDURANCE_EFFORT_SHELL } from '@/components/game/occupational/level9/session9/enduranceEffortTheme';
import type { EnduranceZoneStatus, MountainPushRound } from '@/components/game/occupational/level9/session9/enduranceEffortUtils';
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
  theme: MountainPushTheme;
  roundDef: MountainPushRound;
  effort: number;
  form: number;
  stability: number;
  targetEffort: number;
  zoneStatus: EnduranceZoneStatus;
  holdProgress: number;
  summitProgress: number;
  summiting: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  summitedCount: number;
  ridgeProgress: number;
  holdSeconds: number;
  leftPalm: { x: number; y: number } | null;
  rightPalm: { x: number; y: number } | null;
  banner: string;
  quality: number;
  bandHalf: number;
};

export function MountainPushOverlay({
  theme,
  roundDef,
  effort,
  form,
  stability,
  targetEffort,
  zoneStatus,
  holdProgress,
  summitProgress,
  summiting,
  previewing,
  roundActive,
  round,
  totalRounds,
  summitedCount,
  ridgeProgress,
  holdSeconds,
  leftPalm,
  rightPalm,
  banner,
  quality,
  bandHalf,
}: Props) {
  const mist = useSharedValue(0);
  const boulderPress = useSharedValue(0);

  useEffect(() => {
    mist.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 940, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 940, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [mist]);

  useEffect(() => {
    const ratio = Math.min(1, effort / Math.max(0.35, targetEffort));
    boulderPress.value = withTiming(summiting ? 1 : ratio, { duration: 220 });
  }, [boulderPress, effort, summiting, targetEffort]);

  const mistStyle = useAnimatedStyle(() => ({ opacity: 0.2 + mist.value * 0.36 }));
  const boulderStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + boulderPress.value * 0.54,
    transform: [{ scale: 1 - boulderPress.value * 0.04 }],
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
          key={`ridge-${i}`}
          style={[styles.decor, mistStyle, { left: `${5 + (i * 16) % 85}%`, top: `${3 + (i % 4) * 7}%` }]}
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
        <View style={[styles.palmDot, { left: `${rightPalm.x * 100}%`, top: `${rightPalm.y * 100}%`, borderColor: theme.boulder }]}>
          <Text style={styles.palmLabel}>R</Text>
        </View>
      )}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          PUSH {effortPct}% · TARGET {targetPct}% · FORM {formPct}% · STEADY {Math.round(stability * 100)}%
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
          <Text style={[styles.zoneBadge, { color: inZone ? ENDURANCE_EFFORT_SHELL.good : theme.boulder }]}>
            {inZone ? 'STEADY PUSH' : zoneStatus === 'heavy' ? 'TOO STRONG' : 'PUSH FIRMER'}
          </Text>
          <Text style={styles.roundText}>
            Peak {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      <View style={styles.peakRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.peakDot, { opacity: i < summitedCount ? 1 : 0.25 }]}>
            {i < summitedCount ? theme.peaks[i % theme.peaks.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.ridgeWrap}>
        <Text style={styles.ridgeLabel}>🏔️ RIDGE CLIMB {Math.round(ridgeProgress * 100)}%</Text>
        <View style={styles.ridgeTrack}>
          <LinearGradient
            colors={[theme.accentDeep, theme.accent, theme.boulder]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.ridgeFill, { width: `${ridgeProgress * 100}%` }]}
          />
        </View>
      </View>

      {!previewing && (
        <Animated.View style={[styles.boulderWrap, boulderStyle]}>
          <View style={[styles.boulder, { borderColor: inZone ? ENDURANCE_EFFORT_SHELL.good : theme.boulder }]}>
            <Text style={styles.boulderEmoji}>{roundDef.icon}</Text>
            <Text style={styles.boulderLabel}>{roundDef.peak}</Text>
            <Text style={styles.holdHint}>Push {holdSeconds.toFixed(1)}s</Text>
          </View>
          {roundActive && inZone && !summiting && (
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
          <Text style={styles.previewSub}>Push target {targetPct}% · Hold {holdSeconds.toFixed(1)}s</Text>
        </View>
      )}

      {summiting && (
        <Text style={styles.summitText}>SUMMIT {Math.round(summitProgress * 100)}%</Text>
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
  palmLabel: { fontSize: 10, fontWeight: '900', color: '#44403C' },
  hudWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(28,25,23,0.92)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(120,113,108,0.35)',
  },
  hudTitle: { color: '#E7E5E4', fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
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
  qualityText: { color: '#D6D3D1', fontSize: 11, fontWeight: '700' },
  zoneBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  roundText: { color: ENDURANCE_EFFORT_SHELL.gold, fontSize: 11, fontWeight: '800' },
  peakRow: {
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
  peakDot: { fontSize: 14 },
  ridgeWrap: {
    position: 'absolute',
    top: '22%',
    left: 14,
    right: 14,
  },
  ridgeLabel: { color: '#D6D3D1', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  ridgeTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  ridgeFill: { height: '100%', borderRadius: 4 },
  boulderWrap: { position: 'absolute', top: '38%', alignSelf: 'center', alignItems: 'center' },
  boulder: {
    width: 124,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 3,
    backgroundColor: 'rgba(41,37,36,0.75)',
    alignItems: 'center',
  },
  boulderEmoji: { fontSize: 36 },
  boulderLabel: { color: '#D6D3D1', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginTop: 4 },
  holdHint: { color: '#A8A29E', fontSize: 8, fontWeight: '800', marginTop: 3 },
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
  previewText: { color: '#E7E5E4', fontSize: 14, fontWeight: '800', marginTop: 8 },
  previewSub: { color: '#A8A29E', fontSize: 11, fontWeight: '700', marginTop: 4 },
  summitText: {
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
