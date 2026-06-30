/** Energy Meter overlay — OT L9 S1 Game 4 */
import type { EnergyMeterTheme } from '@/components/game/occupational/level9/session1/forceTheme';
import { ENERGY_SHELL } from '@/components/game/occupational/level9/session1/forceTheme';
import type { EnergyZoneStatus } from '@/components/game/occupational/level9/session1/forceUtils';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  theme: EnergyMeterTheme;
  force: number;
  targetForce: number;
  bandHalf: number;
  zoneStatus: EnergyZoneStatus;
  holdProgress: number;
  surgeProgress: number;
  surging: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  cellIcon: string;
  leftHand: { x: number; y: number } | null;
  rightHand: { x: number; y: number } | null;
  banner: string;
  quality: number;
};

export function EnergyMeterOverlay({
  theme,
  force,
  targetForce,
  bandHalf,
  zoneStatus,
  holdProgress,
  surgeProgress,
  surging,
  roundActive,
  round,
  totalRounds,
  cellIcon,
  leftHand,
  rightHand,
  banner,
  quality,
}: Props) {
  const boltPulse = useSharedValue(0);
  const coreGlow = useSharedValue(0);
  const meterShake = useSharedValue(0);

  useEffect(() => {
    boltPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [boltPulse]);

  useEffect(() => {
    if (zoneStatus === 'zone' && roundActive) {
      coreGlow.value = withRepeat(
        withSequence(withTiming(1, { duration: 400 }), withTiming(0.5, { duration: 400 })),
        -1,
        true,
      );
    } else if (zoneStatus === 'high') {
      coreGlow.value = withRepeat(
        withSequence(withTiming(1, { duration: 120 }), withTiming(0.3, { duration: 120 })),
        -1,
        true,
      );
      meterShake.value = withSequence(withTiming(1, { duration: 80 }), withTiming(0, { duration: 80 }));
    } else {
      coreGlow.value = withTiming(zoneStatus === 'low' ? 0.2 : 0.4, { duration: 200 });
    }
  }, [zoneStatus, roundActive, coreGlow, meterShake]);

  useEffect(() => {
    if (surging) {
      coreGlow.value = withTiming(1.5, { duration: 500 });
    }
  }, [surging, surgeProgress, coreGlow]);

  const boltStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + boltPulse.value * 0.4,
    transform: [{ scale: 0.9 + boltPulse.value * 0.15 }],
  }));

  const coreStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.4 + coreGlow.value * 0.5,
    transform: [{ scale: surging ? 1 + surgeProgress * 0.4 : 1 + coreGlow.value * 0.08 }],
  }));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: meterShake.value * 6 * (zoneStatus === 'high' ? 1 : 0) }],
  }));

  const energyPct = Math.round(force * 100);
  const targetPct = Math.round(targetForce * 100);
  const bandLow = Math.round((targetForce - bandHalf) * 100);
  const bandHigh = Math.round((targetForce + bandHalf) * 100);
  const fillPct = Math.min(100, energyPct);

  const zoneColor =
    zoneStatus === 'zone' ? ENERGY_SHELL.good : zoneStatus === 'high' ? ENERGY_SHELL.over : theme.neon;
  const zoneLabel = zoneStatus === 'zone' ? 'IN ZONE' : zoneStatus === 'high' ? 'TOO HIGH' : 'TOO LOW';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`bolt-${i}`}
          style={[
            styles.decor,
            i % 2 === 0 ? boltStyle : undefined,
            { left: `${6 + (i * 18) % 84}%`, top: `${5 + (i % 3) * 10}%` },
          ]}
        >
          {d}
        </Animated.Text>
      ))}

      {leftHand && (
        <View
          style={[
            styles.handDot,
            { left: `${leftHand.x * 100}%`, top: `${leftHand.y * 100}%`, borderColor: theme.neon },
          ]}
        >
          <Text style={styles.handLabel}>L</Text>
        </View>
      )}
      {rightHand && (
        <View
          style={[
            styles.handDot,
            { left: `${rightHand.x * 100}%`, top: `${rightHand.y * 100}%`, borderColor: theme.accent },
          ]}
        >
          <Text style={styles.handLabel}>R</Text>
        </View>
      )}

      {/* Top stats bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsLabel}>
          ENERGY {energyPct}% · ZONE {bandLow}–{bandHigh}%
        </Text>
        <View style={styles.statsRow}>
          <Text style={[styles.zoneBadge, { color: zoneColor }]}>{zoneLabel}</Text>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={styles.roundText}>
            Cell {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      {/* Vertical energy meter */}
      <Animated.View style={[styles.meterColumn, shakeStyle]}>
        <Text style={styles.meterTitle}>VOLTAGE</Text>
        <View style={styles.meterBody}>
          {/* Green target band */}
          <View
            style={[
              styles.targetBand,
              {
                bottom: `${bandLow}%`,
                height: `${bandHigh - bandLow}%`,
              },
            ]}
          />
          {/* Fill */}
          <LinearGradient
            colors={
              zoneStatus === 'high'
                ? [ENERGY_SHELL.over, '#B91C1C']
                : zoneStatus === 'zone'
                  ? [ENERGY_SHELL.good, '#059669']
                  : [theme.neon, theme.accent]
            }
            style={[styles.meterFill, { height: `${fillPct}%` }]}
          />
          {/* Target line */}
          <View style={[styles.targetLine, { bottom: `${targetPct}%` }]} />
          {/* Tick marks */}
          {[25, 50, 75].map((t) => (
            <View key={t} style={[styles.tick, { bottom: `${t}%` }]}>
              <Text style={styles.tickLabel}>{t}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.targetLabel}>TARGET {targetPct}%</Text>
      </Animated.View>

      {/* Power core */}
      <View style={styles.coreWrap}>
        <Animated.View style={[styles.coreOuter, coreStyle, { borderColor: zoneColor }]}>
          <LinearGradient
            colors={
              surging
                ? [theme.accent, theme.pulse, theme.neon]
                : zoneStatus === 'zone'
                  ? [`${ENERGY_SHELL.good}CC`, theme.accent]
                  : [theme.accentDeep, theme.pulse]
            }
            style={styles.coreGrad}
          >
            <Text style={styles.coreEmoji}>{surging ? '⚡' : cellIcon}</Text>
          </LinearGradient>
        </Animated.View>

        {roundActive && zoneStatus === 'zone' && !surging && (
          <View style={styles.holdRing}>
            <LinearGradient
              colors={[theme.neon, ENERGY_SHELL.good]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.holdFill, { width: `${holdProgress * 100}%` }]}
            />
          </View>
        )}

        {surging && (
          <Text style={styles.surgeText}>SURGE! {Math.round(surgeProgress * 100)}%</Text>
        )}
      </View>

      {banner ? (
        <View
          style={[
            styles.banner,
            {
              backgroundColor:
                zoneStatus === 'high' ? ENERGY_SHELL.over : zoneStatus === 'zone' ? theme.accentDeep : theme.pulse,
            },
          ]}
        >
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
    width: 30,
    height: 30,
    marginLeft: -15,
    marginTop: -15,
    borderRadius: 8,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  handLabel: { fontSize: 10, fontWeight: '900', color: '#1E1B4B' },
  statsBar: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 88,
    backgroundColor: 'rgba(3,7,18,0.85)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(234,179,8,0.35)',
  },
  statsLabel: { color: '#FFFBEB', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, alignItems: 'center' },
  zoneBadge: { fontSize: 11, fontWeight: '900', letterSpacing: 0.6 },
  qualityText: { color: '#A5F3FC', fontSize: 11, fontWeight: '700' },
  roundText: { color: ENERGY_SHELL.gold, fontSize: 11, fontWeight: '800' },
  meterColumn: {
    position: 'absolute',
    right: 12,
    top: '18%',
    bottom: '22%',
    width: 56,
    alignItems: 'center',
  },
  meterTitle: { color: '#FDE047', fontSize: 8, fontWeight: '900', letterSpacing: 1.2, marginBottom: 6 },
  meterBody: {
    flex: 1,
    width: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderWidth: 2,
    borderColor: 'rgba(34,211,238,0.4)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  targetBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(52,211,153,0.28)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(52,211,153,0.55)',
  },
  meterFill: { width: '100%', borderRadius: 8 },
  targetLine: {
    position: 'absolute',
    left: -4,
    right: -4,
    height: 3,
    backgroundColor: ENERGY_SHELL.gold,
    borderRadius: 2,
  },
  tick: {
    position: 'absolute',
    left: -22,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tickLabel: { color: '#64748B', fontSize: 8, fontWeight: '700' },
  targetLabel: { color: '#FDE047', fontSize: 8, fontWeight: '800', marginTop: 6, letterSpacing: 0.5 },
  coreWrap: {
    position: 'absolute',
    bottom: '15%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  coreOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    overflow: 'hidden',
    shadowColor: '#EAB308',
    shadowRadius: 20,
    elevation: 16,
  },
  coreGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  coreEmoji: { fontSize: 46 },
  holdRing: {
    marginTop: 12,
    width: 130,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', borderRadius: 4 },
  surgeText: { color: ENERGY_SHELL.gold, fontSize: 14, fontWeight: '900', marginTop: 10, letterSpacing: 0.8 },
  banner: {
    position: 'absolute',
    top: '38%',
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bannerText: { color: '#fff', fontSize: 17, fontWeight: '900' },
});
