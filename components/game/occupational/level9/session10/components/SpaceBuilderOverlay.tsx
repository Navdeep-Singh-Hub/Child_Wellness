/** Space Builder overlay — OT L9 S10 Game 2 */
import type { SpaceBuilderTheme } from '@/components/game/occupational/level9/session10/proprioceptiveAdventureTheme';
import { PROPRIOCEPTIVE_ADVENTURE_SHELL } from '@/components/game/occupational/level9/session10/proprioceptiveAdventureTheme';
import type { AdventureZoneStatus, SpaceBuilderRound } from '@/components/game/occupational/level9/session10/proprioceptiveAdventureUtils';
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
  theme: SpaceBuilderTheme;
  roundDef: SpaceBuilderRound;
  effort: number;
  form: number;
  targetEffort: number;
  zoneStatus: AdventureZoneStatus;
  holdProgress: number;
  lockProgress: number;
  locking: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  lockedCount: number;
  buildProgress: number;
  holdSeconds: number;
  leftPalm: { x: number; y: number } | null;
  rightPalm: { x: number; y: number } | null;
  banner: string;
  quality: number;
  bandHalf: number;
};

export function SpaceBuilderOverlay({
  theme,
  roundDef,
  effort,
  form,
  targetEffort,
  zoneStatus,
  holdProgress,
  lockProgress,
  locking,
  previewing,
  roundActive,
  round,
  totalRounds,
  lockedCount,
  buildProgress,
  holdSeconds,
  leftPalm,
  rightPalm,
  banner,
  quality,
  bandHalf,
}: Props) {
  const starPulse = useSharedValue(0);

  useEffect(() => {
    starPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [starPulse]);

  const starStyle = useAnimatedStyle(() => ({
    opacity: 0.22 + starPulse.value * 0.4,
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
          key={`space-${i}`}
          style={[styles.decor, starStyle, { left: `${5 + (i * 16) % 85}%`, top: `${3 + (i % 4) * 7}%` }]}
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
        <View style={[styles.palmDot, { left: `${rightPalm.x * 100}%`, top: `${rightPalm.y * 100}%`, borderColor: theme.panel }]}>
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
                backgroundColor: inZone ? PROPRIOCEPTIVE_ADVENTURE_SHELL.good : zoneStatus === 'heavy' ? PROPRIOCEPTIVE_ADVENTURE_SHELL.warn : theme.accent,
              },
            ]}
          />
          <View style={[styles.zoneBand, { left: `${low * 100}%`, width: `${bandHalf * 2 * 100}%` }]} />
          <View style={[styles.targetTick, { left: `${targetPct}%` }]} />
        </View>
        <View style={styles.hudRow}>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={[styles.zoneBadge, { color: inZone ? PROPRIOCEPTIVE_ADVENTURE_SHELL.good : theme.panel }]}>
            {inZone ? 'STEADY PUSH' : zoneStatus === 'heavy' ? 'TOO STRONG' : 'PUSH FIRMER'}
          </Text>
          <Text style={styles.roundText}>
            Bay {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      <View style={styles.lockedRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.lockedDot, { opacity: i < lockedCount ? 1 : 0.25 }]}>
            {i < lockedCount ? theme.modules[i % theme.modules.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.buildWrap}>
        <Text style={styles.buildLabel}>🚀 STATION BUILD {Math.round(buildProgress * 100)}%</Text>
        <View style={styles.buildTrack}>
          <LinearGradient
            colors={[theme.accentDeep, theme.accent, theme.panel]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.buildFill, { width: `${buildProgress * 100}%` }]}
          />
        </View>
      </View>

      {!previewing && (
        <View style={styles.moduleWrap}>
          <View style={[styles.moduleCard, { borderColor: inZone ? PROPRIOCEPTIVE_ADVENTURE_SHELL.good : theme.panel }]}>
            <Text style={styles.moduleEmoji}>{roundDef.icon}</Text>
            <Text style={styles.moduleLabel}>{roundDef.module}</Text>
            <Text style={styles.holdHint}>Push {holdSeconds.toFixed(1)}s</Text>
          </View>
          {roundActive && inZone && !locking && (
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
          <Text style={styles.previewSub}>Push target {targetPct}% · Hold {holdSeconds.toFixed(1)}s</Text>
        </View>
      )}

      {locking && (
        <Text style={styles.lockText}>LOCKING {Math.round(lockProgress * 100)}%</Text>
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
  palmLabel: { fontSize: 10, fontWeight: '900', color: '#0369A1' },
  hudWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.35)',
  },
  hudTitle: { color: '#E0F2FE', fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
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
    backgroundColor: 'rgba(56,189,248,0.25)',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.45)',
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
  qualityText: { color: '#BAE6FD', fontSize: 11, fontWeight: '700' },
  zoneBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  roundText: { color: PROPRIOCEPTIVE_ADVENTURE_SHELL.gold, fontSize: 11, fontWeight: '800' },
  lockedRow: {
    position: 'absolute',
    top: 92,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(15,23,42,0.55)',
    borderRadius: 16,
  },
  lockedDot: { fontSize: 14 },
  buildWrap: {
    position: 'absolute',
    top: '22%',
    left: 14,
    right: 14,
  },
  buildLabel: { color: '#BAE6FD', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  buildTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  buildFill: { height: '100%', borderRadius: 4 },
  moduleWrap: { position: 'absolute', top: '38%', alignSelf: 'center', alignItems: 'center' },
  moduleCard: {
    width: 120,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 3,
    backgroundColor: 'rgba(30,58,138,0.75)',
    alignItems: 'center',
  },
  moduleEmoji: { fontSize: 36 },
  moduleLabel: { color: '#E0F2FE', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginTop: 4 },
  holdHint: { color: '#7DD3FC', fontSize: 8, fontWeight: '800', marginTop: 3 },
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
  previewText: { color: '#E0F2FE', fontSize: 14, fontWeight: '800', marginTop: 8 },
  previewSub: { color: '#7DD3FC', fontSize: 11, fontWeight: '700', marginTop: 4 },
  lockText: {
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
