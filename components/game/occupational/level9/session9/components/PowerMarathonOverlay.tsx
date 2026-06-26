/** Power Marathon overlay — OT L9 S9 Game 5 */
import type { PowerMarathonTheme } from '@/components/game/occupational/level9/session9/enduranceEffortTheme';
import { ENDURANCE_EFFORT_SHELL } from '@/components/game/occupational/level9/session9/enduranceEffortTheme';
import type { EnduranceZoneStatus, PowerMarathonRound } from '@/components/game/occupational/level9/session9/enduranceEffortUtils';
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
  theme: PowerMarathonTheme;
  roundDef: PowerMarathonRound;
  effort: number;
  form: number;
  stability: number;
  targetEffort: number;
  zoneStatus: EnduranceZoneStatus;
  holdProgress: number;
  finishProgress: number;
  finishing: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  milesCompleted: number;
  marathonProgress: number;
  holdSeconds: number;
  leftHand: { x: number; y: number } | null;
  rightHand: { x: number; y: number } | null;
  banner: string;
  quality: number;
  bandHalf: number;
};

export function PowerMarathonOverlay({
  theme,
  roundDef,
  effort,
  form,
  stability,
  targetEffort,
  zoneStatus,
  holdProgress,
  finishProgress,
  finishing,
  previewing,
  roundActive,
  round,
  totalRounds,
  milesCompleted,
  marathonProgress,
  holdSeconds,
  leftHand,
  rightHand,
  banner,
  quality,
  bandHalf,
}: Props) {
  const pulse = useSharedValue(0);
  const powerGlow = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 820, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 820, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  useEffect(() => {
    const ratio = Math.min(1, effort / Math.max(0.35, targetEffort));
    powerGlow.value = withTiming(finishing ? 1 : ratio, { duration: 220 });
  }, [effort, finishing, powerGlow, targetEffort]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: 0.24 + pulse.value * 0.4 }));
  const powerStyle = useAnimatedStyle(() => ({
    opacity: 0.44 + powerGlow.value * 0.54,
    transform: [{ scale: 1 + powerGlow.value * 0.04 }],
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
          key={`marathon-${i}`}
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
        <View style={[styles.handDot, { left: `${rightHand.x * 100}%`, top: `${rightHand.y * 100}%`, borderColor: theme.thunder }]}>
          <Text style={styles.handLabel}>R</Text>
        </View>
      )}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          POWER {effortPct}% · TARGET {targetPct}% · FORM {formPct}% · STEADY {Math.round(stability * 100)}%
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
          <Text style={[styles.zoneBadge, { color: inZone ? ENDURANCE_EFFORT_SHELL.good : theme.thunder }]}>
            {inZone ? 'STEADY POWER' : zoneStatus === 'heavy' ? 'TOO STRONG' : 'POWER UP'}
          </Text>
          <Text style={styles.roundText}>
            Mile {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      <View style={styles.milestoneRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.milestoneDot, { opacity: i < milesCompleted ? 1 : 0.25 }]}>
            {i < milesCompleted ? theme.milestones[i % theme.milestones.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.marathonWrap}>
        <Text style={styles.marathonLabel}>🏃 MARATHON ROUTE {Math.round(marathonProgress * 100)}%</Text>
        <View style={styles.marathonTrack}>
          <LinearGradient
            colors={[theme.accentDeep, theme.accent, theme.thunder]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.marathonFill, { width: `${marathonProgress * 100}%` }]}
          />
        </View>
      </View>

      {!previewing && (
        <Animated.View style={[styles.powerWrap, powerStyle]}>
          <View style={[styles.powerCard, { borderColor: inZone ? ENDURANCE_EFFORT_SHELL.good : theme.thunder }]}>
            <Text style={styles.powerEmoji}>{roundDef.icon}</Text>
            <Text style={styles.powerLabel}>{roundDef.mile}</Text>
            <Text style={styles.holdHint}>Power {holdSeconds.toFixed(1)}s</Text>
          </View>
          {roundActive && inZone && !finishing && (
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
          <Text style={styles.previewSub}>Power target {targetPct}% · Hold {holdSeconds.toFixed(1)}s</Text>
        </View>
      )}

      {finishing && (
        <Text style={styles.finishText}>FINISHING {Math.round(finishProgress * 100)}%</Text>
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
  handLabel: { fontSize: 10, fontWeight: '900', color: '#7F1D1D' },
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
    backgroundColor: ENDURANCE_EFFORT_SHELL.gold,
    borderRadius: 1,
  },
  hudRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  qualityText: { color: '#FECACA', fontSize: 11, fontWeight: '700' },
  zoneBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  roundText: { color: ENDURANCE_EFFORT_SHELL.gold, fontSize: 11, fontWeight: '800' },
  milestoneRow: {
    position: 'absolute',
    top: 92,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(69,10,10,0.55)',
    borderRadius: 16,
  },
  milestoneDot: { fontSize: 14 },
  marathonWrap: {
    position: 'absolute',
    top: '22%',
    left: 14,
    right: 14,
  },
  marathonLabel: { color: '#FECACA', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  marathonTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  marathonFill: { height: '100%', borderRadius: 4 },
  powerWrap: { position: 'absolute', top: '36%', alignSelf: 'center', alignItems: 'center' },
  powerCard: {
    width: 124,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 3,
    backgroundColor: 'rgba(69,10,10,0.75)',
    alignItems: 'center',
  },
  powerEmoji: { fontSize: 36 },
  powerLabel: { color: '#FEE2E2', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginTop: 4 },
  holdHint: { color: '#FCA5A5', fontSize: 8, fontWeight: '800', marginTop: 3 },
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
  previewText: { color: '#FEE2E2', fontSize: 14, fontWeight: '800', marginTop: 8 },
  previewSub: { color: '#FCA5A5', fontSize: 11, fontWeight: '700', marginTop: 4 },
  finishText: {
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
