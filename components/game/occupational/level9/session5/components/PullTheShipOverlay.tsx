/** Pull The Ship overlay — OT L9 S5 Game 2 */
import type { PullTheShipTheme } from '@/components/game/occupational/level9/session5/resistanceTheme';
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
  theme: PullTheShipTheme;
  pull: number;
  form: number;
  targetPull: number;
  zoneStatus: ResistanceZoneStatus;
  holdProgress: number;
  dockProgress: number;
  docking: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  dockedCount: number;
  harborProgress: number;
  leftRope: { x: number; y: number } | null;
  rightRope: { x: number; y: number } | null;
  banner: string;
  quality: number;
  bandHalf: number;
};

export function PullTheShipOverlay({
  theme,
  pull,
  form,
  targetPull,
  zoneStatus,
  holdProgress,
  dockProgress,
  docking,
  previewing,
  roundActive,
  round,
  totalRounds,
  dockedCount,
  harborProgress,
  leftRope,
  rightRope,
  banner,
  quality,
  bandHalf,
}: Props) {
  const wave = useSharedValue(0);
  const shipShift = useSharedValue(0);
  const ropeTension = useSharedValue(0);

  useEffect(() => {
    wave.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [wave]);

  useEffect(() => {
    const ratio = Math.min(1, pull / Math.max(0.35, targetPull));
    shipShift.value = withTiming(docking ? 1 : ratio * 0.58, { duration: docking ? 580 : 220 });
  }, [pull, targetPull, docking, shipShift]);

  useEffect(() => {
    if (roundActive && zoneStatus === 'zone') {
      ropeTension.value = withRepeat(
        withSequence(withTiming(1, { duration: 280 }), withTiming(0.3, { duration: 280 })),
        -1,
        false,
      );
    } else {
      ropeTension.value = withTiming(0, { duration: 200 });
    }
  }, [roundActive, zoneStatus, ropeTension]);

  const waveStyle = useAnimatedStyle(() => ({
    opacity: 0.22 + wave.value * 0.36,
  }));

  const shipStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shipShift.value * 36 }],
  }));

  const ropeStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + ropeTension.value * 0.55,
  }));

  const pullPct = Math.round(pull * 100);
  const targetPct = Math.round(targetPull * 100);
  const formPct = Math.round(form * 100);
  const inZone = zoneStatus === 'zone';
  const low = targetPull - bandHalf;
  const high = targetPull + bandHalf;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`harbor-${i}`}
          style={[styles.decor, waveStyle, { left: `${4 + (i * 15) % 88}%`, top: `${2 + (i % 4) * 7}%` }]}
        >
          {d}
        </Animated.Text>
      ))}

      {leftRope && (
        <View style={[styles.ropeDot, { left: `${leftRope.x * 100}%`, top: `${leftRope.y * 100}%`, borderColor: theme.accent }]}>
          <Text style={styles.ropeLabel}>L</Text>
        </View>
      )}
      {rightRope && (
        <View style={[styles.ropeDot, { left: `${rightRope.x * 100}%`, top: `${rightRope.y * 100}%`, borderColor: theme.rope }]}>
          <Text style={styles.ropeLabel}>R</Text>
        </View>
      )}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          TOW {pullPct}% · TARGET {targetPct}% · FORM {formPct}%
        </Text>
        <View style={styles.meterTrack}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${Math.min(100, pullPct)}%`,
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
            {inZone ? 'HAULING' : zoneStatus === 'heavy' ? 'TOO HARD' : 'TOO LIGHT'}
          </Text>
          <Text style={styles.roundText}>
            Ship {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      <View style={styles.shipRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.shipDot, { opacity: i < dockedCount ? 1 : 0.25 }]}>
            {i < dockedCount ? theme.ships[i % theme.ships.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.harborWrap}>
        <Text style={styles.harborLabel}>⚓ HARBOR {Math.round(harborProgress * 100)}%</Text>
        <View style={styles.harborBar}>
          <LinearGradient
            colors={[theme.accentDeep, theme.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.harborFill, { width: `${harborProgress * 100}%` }]}
          />
        </View>
      </View>

      {!previewing && (
        <Animated.View style={[styles.towWrap, shipStyle]}>
          <Animated.Text style={[styles.ropeLine, ropeStyle]}>🪢🪢🪢</Animated.Text>
          <Text style={styles.shipEmoji}>{theme.ships[round % theme.ships.length]}</Text>
          <Text style={styles.waveEmoji}>🌊</Text>
          <Text style={styles.pullLabel}>PULL PULL</Text>
          {roundActive && inZone && !docking && (
            <View style={styles.holdRing}>
              <View style={[styles.holdFill, { width: `${holdProgress * 100}%` }]} />
            </View>
          )}
        </Animated.View>
      )}

      {previewing && (
        <View style={styles.previewWrap}>
          <Text style={styles.previewEmoji}>🚢</Text>
          <Text style={styles.previewText}>Tow resistance {targetPct}%</Text>
        </View>
      )}

      {docking && (
        <Text style={styles.dockText}>DOCKING {Math.round(dockProgress * 100)}%</Text>
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
  ropeDot: {
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
  ropeLabel: { fontSize: 10, fontWeight: '900', color: '#0C4A6E' },
  hudWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(12,25,41,0.92)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.35)',
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
  qualityText: { color: '#BAE6FD', fontSize: 11, fontWeight: '700' },
  zoneBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  roundText: { color: RESISTANCE_SHELL.gold, fontSize: 11, fontWeight: '800' },
  shipRow: {
    position: 'absolute',
    top: 92,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(12,25,41,0.55)',
    borderRadius: 16,
  },
  shipDot: { fontSize: 14 },
  harborWrap: { position: 'absolute', top: '22%', left: 14, right: 14 },
  harborLabel: { color: '#BAE6FD', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  harborBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  harborFill: { height: '100%', borderRadius: 4 },
  towWrap: { position: 'absolute', top: '38%', alignSelf: 'center', alignItems: 'center' },
  ropeLine: { fontSize: 22, marginBottom: 6, letterSpacing: 2 },
  shipEmoji: { fontSize: 58 },
  waveEmoji: { fontSize: 24, marginTop: 4 },
  pullLabel: { color: '#BAE6FD', fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginTop: 6 },
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
  previewText: { color: '#BAE6FD', fontSize: 14, fontWeight: '800', marginTop: 8 },
  dockText: {
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
