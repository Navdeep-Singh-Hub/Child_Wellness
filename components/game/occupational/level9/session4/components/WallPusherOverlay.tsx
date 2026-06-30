/** Wall Pusher overlay — OT L9 S4 Game 2 */
import type { WallPusherTheme } from '@/components/game/occupational/level9/session4/heavyWorkTheme';
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
  theme: WallPusherTheme;
  effort: number;
  form: number;
  targetEffort: number;
  zoneStatus: CarryZoneStatus;
  holdProgress: number;
  breachProgress: number;
  breaching: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  breachedCount: number;
  corridorProgress: number;
  leftPalm: { x: number; y: number } | null;
  rightPalm: { x: number; y: number } | null;
  banner: string;
  quality: number;
  bandHalf: number;
};

export function WallPusherOverlay({
  theme,
  effort,
  form,
  targetEffort,
  zoneStatus,
  holdProgress,
  breachProgress,
  breaching,
  previewing,
  roundActive,
  round,
  totalRounds,
  breachedCount,
  corridorProgress,
  leftPalm,
  rightPalm,
  banner,
  quality,
  bandHalf,
}: Props) {
  const rumble = useSharedValue(0);
  const wallShift = useSharedValue(0);

  useEffect(() => {
    rumble.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [rumble]);

  useEffect(() => {
    const pushRatio = Math.min(1, effort / Math.max(0.35, targetEffort));
    wallShift.value = withTiming(breaching ? 1 : pushRatio * 0.55, { duration: breaching ? 600 : 200 });
  }, [effort, targetEffort, breaching, wallShift]);

  const rumbleStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + rumble.value * 0.35,
  }));

  const wallStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: wallShift.value * 28 }],
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
          key={`fortress-${i}`}
          style={[styles.decor, rumbleStyle, { left: `${4 + (i * 15) % 88}%`, top: `${3 + (i % 4) * 7}%` }]}
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
        <View style={[styles.palmDot, { left: `${rightPalm.x * 100}%`, top: `${rightPalm.y * 100}%`, borderColor: theme.stone }]}>
          <Text style={styles.palmLabel}>R</Text>
        </View>
      )}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          PUSH {effortPct}% · TARGET {targetPct}% · FORM {formPct}%
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
          <Text style={[styles.zoneBadge, { color: inZone ? HEAVY_WORK_SHELL.good : theme.stone }]}>
            {inZone ? 'STEADY' : zoneStatus === 'heavy' ? 'TOO HARD' : 'TOO SOFT'}
          </Text>
          <Text style={styles.roundText}>
            Wall {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      <View style={styles.breachedRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.breachedDot, { opacity: i < breachedCount ? 1 : 0.25 }]}>
            {i < breachedCount ? theme.walls[i % theme.walls.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.corridorWrap}>
        <Text style={styles.corridorLabel}>🏰 CORRIDOR {Math.round(corridorProgress * 100)}%</Text>
        <View style={styles.corridorTrack}>
          <LinearGradient
            colors={[theme.accentDeep, theme.stone]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.corridorFill, { width: `${corridorProgress * 100}%` }]}
          />
        </View>
      </View>

      {!previewing && (
        <View style={styles.wallScene}>
          <Animated.View style={[styles.wall, wallStyle, { borderColor: inZone ? HEAVY_WORK_SHELL.good : theme.stone }]}>
            <Text style={styles.wallEmoji}>{theme.walls[round % theme.walls.length]}</Text>
            <Text style={styles.wallLabel}>FORTRESS WALL</Text>
            {roundActive && inZone && !breaching && (
              <View style={styles.holdRing}>
                <View style={[styles.holdFill, { width: `${holdProgress * 100}%` }]} />
              </View>
            )}
          </Animated.View>
          <Text style={styles.pushArrows}>👐 ➡️ 🧱</Text>
        </View>
      )}

      {previewing && (
        <View style={styles.previewWrap}>
          <Text style={styles.previewEmoji}>{theme.walls[round % theme.walls.length]}</Text>
          <Text style={styles.previewText}>Resistance target {targetPct}%</Text>
        </View>
      )}

      {breaching && (
        <Text style={styles.breachText}>BREACHING {Math.round(breachProgress * 100)}%</Text>
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
  palmDot: {
    position: 'absolute',
    width: 28,
    height: 28,
    marginLeft: -14,
    marginTop: -14,
    borderRadius: 14,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  palmLabel: { fontSize: 10, fontWeight: '900', color: '#334155' },
  hudWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(30,41,59,0.92)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
  },
  hudTitle: { color: '#F8FAFC', fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
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
  qualityText: { color: '#CBD5E1', fontSize: 11, fontWeight: '700' },
  zoneBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  roundText: { color: HEAVY_WORK_SHELL.gold, fontSize: 11, fontWeight: '800' },
  breachedRow: {
    position: 'absolute',
    top: 92,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(30,41,59,0.55)',
    borderRadius: 16,
  },
  breachedDot: { fontSize: 14 },
  corridorWrap: { position: 'absolute', top: '22%', left: 14, right: 14 },
  corridorLabel: { color: '#CBD5E1', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  corridorTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  corridorFill: { height: '100%', borderRadius: 4 },
  wallScene: { position: 'absolute', top: '36%', alignSelf: 'center', alignItems: 'center' },
  wall: {
    width: 130,
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 4,
    backgroundColor: 'rgba(51,65,85,0.85)',
    alignItems: 'center',
  },
  wallEmoji: { fontSize: 40 },
  wallLabel: { color: '#CBD5E1', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginTop: 4 },
  holdRing: {
    marginTop: 10,
    width: 100,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', backgroundColor: HEAVY_WORK_SHELL.good, borderRadius: 4 },
  pushArrows: { color: '#94A3B8', fontSize: 16, fontWeight: '900', marginTop: 10 },
  previewWrap: { position: 'absolute', top: '40%', alignSelf: 'center', alignItems: 'center' },
  previewEmoji: { fontSize: 52 },
  previewText: { color: '#CBD5E1', fontSize: 14, fontWeight: '800', marginTop: 8 },
  breachText: {
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
