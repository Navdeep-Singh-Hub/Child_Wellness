/** Carry The Treasure overlay — OT L9 S4 Game 1 */
import type { CarryTreasureTheme } from '@/components/game/occupational/level9/session4/heavyWorkTheme';
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
  theme: CarryTreasureTheme;
  effort: number;
  form: number;
  targetEffort: number;
  zoneStatus: CarryZoneStatus;
  holdProgress: number;
  deliverProgress: number;
  delivering: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  deliveredCount: number;
  journeyProgress: number;
  leftHand: { x: number; y: number } | null;
  rightHand: { x: number; y: number } | null;
  banner: string;
  quality: number;
  bandHalf: number;
};

export function CarryTreasureOverlay({
  theme,
  effort,
  form,
  targetEffort,
  zoneStatus,
  holdProgress,
  deliverProgress,
  delivering,
  previewing,
  roundActive,
  round,
  totalRounds,
  deliveredCount,
  journeyProgress,
  leftHand,
  rightHand,
  banner,
  quality,
  bandHalf,
}: Props) {
  const glow = useSharedValue(0);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1300, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [glow]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + glow.value * 0.35,
  }));

  const effortPct = Math.round(effort * 100);
  const targetPct = Math.round(targetEffort * 100);
  const formPct = Math.round(form * 100);
  const inZone = zoneStatus === 'zone';
  const low = targetEffort - bandHalf;
  const high = targetEffort + bandHalf;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`cavern-${i}`}
          style={[styles.decor, glowStyle, { left: `${5 + (i * 16) % 85}%`, top: `${3 + (i % 4) * 7}%` }]}
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
        <View style={[styles.handDot, { left: `${rightHand.x * 100}%`, top: `${rightHand.y * 100}%`, borderColor: theme.chest }]}>
          <Text style={styles.handLabel}>R</Text>
        </View>
      )}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          HAUL {effortPct}% · TARGET {targetPct}% · FORM {formPct}%
        </Text>
        <View style={styles.meterTrack}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${Math.min(100, effortPct)}%`,
                backgroundColor: inZone ? HEAVY_WORK_SHELL.good : zoneStatus === 'heavy' ? HEAVY_WORK_SHELL.warn : theme.accent,
              },
            ]}
          />
          <View style={[styles.zoneBand, { left: `${low * 100}%`, width: `${bandHalf * 2 * 100}%` }]} />
          <View style={[styles.targetTick, { left: `${targetPct}%` }]} />
        </View>
        <View style={styles.hudRow}>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={[styles.zoneBadge, { color: inZone ? HEAVY_WORK_SHELL.good : theme.chest }]}>
            {inZone ? 'STEADY' : zoneStatus === 'heavy' ? 'TOO HEAVY' : 'TOO LIGHT'}
          </Text>
          <Text style={styles.roundText}>
            Chest {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      <View style={styles.deliveredRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.deliveredDot, { opacity: i < deliveredCount ? 1 : 0.25 }]}>
            {i < deliveredCount ? theme.treasures[i % theme.treasures.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.journeyWrap}>
        <Text style={styles.journeyLabel}>🗺️ CAVERN PATH {Math.round(journeyProgress * 100)}%</Text>
        <View style={styles.journeyTrack}>
          <LinearGradient
            colors={[theme.accentDeep, theme.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.journeyFill, { width: `${journeyProgress * 100}%` }]}
          />
        </View>
      </View>

      {!previewing && (
        <View style={styles.chestWrap}>
          <View style={[styles.chest, { borderColor: inZone ? HEAVY_WORK_SHELL.good : theme.chest }]}>
            <Text style={styles.chestEmoji}>{theme.treasures[round % theme.treasures.length]}</Text>
            <Text style={styles.chestLabel}>TREASURE CHEST</Text>
          </View>
          {roundActive && inZone && !delivering && (
            <View style={styles.holdRing}>
              <View style={[styles.holdFill, { width: `${holdProgress * 100}%` }]} />
            </View>
          )}
        </View>
      )}

      {previewing && (
        <View style={styles.previewWrap}>
          <Text style={styles.previewEmoji}>{theme.treasures[round % theme.treasures.length]}</Text>
          <Text style={styles.previewText}>Weight target {targetPct}%</Text>
        </View>
      )}

      {delivering && (
        <Text style={styles.deliverText}>DELIVERING {Math.round(deliverProgress * 100)}%</Text>
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
  handLabel: { fontSize: 10, fontWeight: '900', color: '#78350F' },
  hudWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(120,53,15,0.92)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
  },
  hudTitle: { color: '#FFFBEB', fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
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
  qualityText: { color: '#FDE68A', fontSize: 11, fontWeight: '700' },
  zoneBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  roundText: { color: HEAVY_WORK_SHELL.gold, fontSize: 11, fontWeight: '800' },
  deliveredRow: {
    position: 'absolute',
    top: 92,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(120,53,15,0.55)',
    borderRadius: 16,
  },
  deliveredDot: { fontSize: 14 },
  journeyWrap: {
    position: 'absolute',
    top: '22%',
    left: 14,
    right: 14,
  },
  journeyLabel: { color: '#FDE68A', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  journeyTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  journeyFill: { height: '100%', borderRadius: 4 },
  chestWrap: { position: 'absolute', top: '38%', alignSelf: 'center', alignItems: 'center' },
  chest: {
    width: 120,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 3,
    backgroundColor: 'rgba(120,53,15,0.75)',
    alignItems: 'center',
  },
  chestEmoji: { fontSize: 36 },
  chestLabel: { color: '#FDE68A', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginTop: 4 },
  holdRing: {
    marginTop: 10,
    width: 100,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', backgroundColor: HEAVY_WORK_SHELL.good, borderRadius: 4 },
  previewWrap: { position: 'absolute', top: '40%', alignSelf: 'center', alignItems: 'center' },
  previewEmoji: { fontSize: 52 },
  previewText: { color: '#FDE68A', fontSize: 14, fontWeight: '800', marginTop: 8 },
  deliverText: {
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
