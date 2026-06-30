/** Goldilocks Pressure overlay — OT L9 S2 Game 5 */
import type { GoldilocksPressureTheme } from '@/components/game/occupational/level9/session2/pressureTheme';
import { GOLDILOCKS_SHELL } from '@/components/game/occupational/level9/session2/pressureTheme';
import type { GoldilocksZone } from '@/components/game/occupational/level9/session2/pressureUtils';
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
  theme: GoldilocksPressureTheme;
  force: number;
  targetForce: number;
  tolerance: number;
  zone: GoldilocksZone;
  holdProgress: number;
  tasteProgress: number;
  tasting: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  tastedCount: number;
  bowl: string;
  bear: string;
  leftHand: { x: number; y: number } | null;
  rightHand: { x: number; y: number } | null;
  banner: string;
  quality: number;
  matchAccuracy: number;
};

const BOWL_ZONES: { id: GoldilocksZone; label: string; sub: string; emoji: string; fill: number }[] = [
  { id: 'too_soft', label: 'TOO SOFT', sub: 'Papa Bear', emoji: '🐻', fill: 0.28 },
  { id: 'just_right', label: 'JUST RIGHT', sub: 'Baby Bear', emoji: '🧸', fill: 0.55 },
  { id: 'too_hard', label: 'TOO HARD', sub: 'Mama Bear', emoji: '🐻‍❄️', fill: 0.88 },
];

export function GoldilocksOverlay({
  theme,
  force,
  targetForce,
  tolerance,
  zone,
  holdProgress,
  tasteProgress,
  tasting,
  previewing,
  roundActive,
  round,
  totalRounds,
  tastedCount,
  bowl,
  bear,
  leftHand,
  rightHand,
  banner,
  quality,
  matchAccuracy,
}: Props) {
  const steam = useSharedValue(0);
  const glow = useSharedValue(0);
  const spoonBob = useSharedValue(0);

  useEffect(() => {
    steam.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [steam]);

  useEffect(() => {
    if (previewing || zone === 'just_right') {
      glow.value = withRepeat(
        withSequence(withTiming(1, { duration: 450 }), withTiming(0.45, { duration: 450 })),
        -1,
        true,
      );
    } else {
      glow.value = withTiming(0.25, { duration: 200 });
    }
  }, [previewing, zone, glow]);

  useEffect(() => {
    spoonBob.value = withRepeat(
      withSequence(withTiming(1, { duration: 800 }), withTiming(0, { duration: 800 })),
      -1,
      false,
    );
  }, [spoonBob]);

  const steamStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + steam.value * 0.45,
    transform: [{ translateY: -4 - steam.value * 8 }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + glow.value * 0.55,
  }));

  const spoonStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -4 + spoonBob.value * 8 }, { rotate: `${-8 + spoonBob.value * 16}deg` }],
  }));

  const forcePct = Math.round(force * 100);
  const targetPct = Math.round(targetForce * 100);
  const justRight = zone === 'just_right';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Text
          key={`cottage-${i}`}
          style={[styles.decor, { left: `${5 + (i * 15) % 88}%`, top: `${3 + (i % 4) * 7}%`, opacity: 0.3 }]}
        >
          {d}
        </Text>
      ))}

      {leftHand && (
        <View
          style={[
            styles.handDot,
            { left: `${leftHand.x * 100}%`, top: `${leftHand.y * 100}%`, borderColor: theme.accent },
          ]}
        >
          <Text style={styles.handLabel}>L</Text>
        </View>
      )}
      {rightHand && (
        <View
          style={[
            styles.handDot,
            { left: `${rightHand.x * 100}%`, top: `${rightHand.y * 100}%`, borderColor: theme.accentDeep },
          ]}
        >
          <Text style={styles.handLabel}>R</Text>
        </View>
      )}

      <View style={styles.hudWrap}>
        <Text style={styles.hudLabel}>
          PRESSURE {forcePct}% · JUST RIGHT {targetPct}% ±{Math.round(tolerance * 100)}%
        </Text>
        <View style={styles.meterTrack}>
          <LinearGradient
            colors={
              zone === 'too_hard'
                ? [GOLDILOCKS_SHELL.warn, '#BE123C']
                : justRight
                  ? ['#34D399', '#10B981']
                  : [theme.porridge, theme.accent]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.meterFill, { width: `${Math.min(100, forcePct)}%` }]}
          />
          <View style={[styles.targetLo, { left: `${(targetForce - tolerance) * 100}%` }]} />
          <View style={[styles.targetHi, { left: `${(targetForce + tolerance) * 100}%` }]} />
          <View style={[styles.targetMid, { left: `${targetPct}%` }]} />
        </View>
        <View style={styles.hudRow}>
          <Text
            style={[
              styles.zoneBadge,
              {
                color:
                  zone === 'too_hard'
                    ? GOLDILOCKS_SHELL.warn
                    : justRight
                      ? GOLDILOCKS_SHELL.good
                      : theme.porridge,
              },
            ]}
          >
            {zone === 'too_soft' ? 'TOO SOFT' : zone === 'too_hard' ? 'TOO HARD' : 'JUST RIGHT'}
          </Text>
          <Text style={styles.accText}>Match {Math.round(matchAccuracy * 100)}%</Text>
          <Text style={styles.roundText}>
            Bowl {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      <View style={styles.tastedRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.tastedDot, { opacity: i < tastedCount ? 1 : 0.25 }]}>
            {i < tastedCount ? theme.bowls[i % theme.bowls.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.bowlsRow}>
        {BOWL_ZONES.map((b) => {
          const active = previewing ? b.id === 'just_right' : zone === b.id;
          const isTarget = b.id === 'just_right';
          return (
            <Animated.View
              key={b.id}
              style={[
                styles.bowlCard,
                isTarget && glowStyle,
                {
                  borderColor: active
                    ? isTarget
                      ? GOLDILOCKS_SHELL.good
                      : b.id === 'too_hard'
                        ? GOLDILOCKS_SHELL.warn
                        : theme.accent
                    : 'rgba(255,255,255,0.2)',
                  opacity: previewing && !isTarget ? 0.55 : 1,
                },
              ]}
            >
              <Text style={styles.bowlEmoji}>{b.emoji}</Text>
              <View style={styles.porridgeCup}>
                <View
                  style={[
                    styles.porridgeFill,
                    {
                      height: `${b.fill * 100}%`,
                      backgroundColor:
                        b.id === 'just_right'
                          ? theme.porridge
                          : b.id === 'too_soft'
                            ? '#93C5FD'
                            : '#FCA5A5',
                    },
                  ]}
                />
                {isTarget && previewing && (
                  <View style={[styles.targetMark, { bottom: `${(1 - targetForce) * 88}%` }]} />
                )}
              </View>
              <Text style={styles.bowlLabel}>{b.label}</Text>
              <Text style={styles.bowlSub}>{b.sub}</Text>
            </Animated.View>
          );
        })}
      </View>

      <Animated.View style={[styles.spoonWrap, spoonStyle]}>
        <Text style={styles.spoonEmoji}>🥄</Text>
        <Text style={styles.spoonLabel}>TASTE PRESSURE</Text>
      </Animated.View>

      <View style={styles.heroBowl}>
        <Animated.Text style={[styles.steam, steamStyle]}>💨 💨</Animated.Text>
        <View style={[styles.mainBowl, { borderColor: justRight ? GOLDILOCKS_SHELL.good : theme.accent }]}>
          <LinearGradient colors={[theme.bowl, theme.porridge]} style={styles.mainGrad}>
            <Text style={styles.mainEmoji}>{tasting ? '✨' : bowl}</Text>
            <Text style={styles.bearEmoji}>{bear}</Text>
          </LinearGradient>
        </View>
        {roundActive && justRight && !tasting && (
          <View style={styles.holdRing}>
            <LinearGradient
              colors={[GOLDILOCKS_SHELL.gold, GOLDILOCKS_SHELL.good]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.holdFill, { width: `${holdProgress * 100}%` }]}
            />
          </View>
        )}
        {tasting && (
          <Text style={styles.tasteText}>TASTING {Math.round(tasteProgress * 100)}%</Text>
        )}
        <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
      </View>

      {banner ? (
        <View
          style={[
            styles.banner,
            {
              backgroundColor:
                zone === 'too_hard' ? GOLDILOCKS_SHELL.warn : justRight ? GOLDILOCKS_SHELL.good : theme.accentDeep,
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
  decor: { position: 'absolute', fontSize: 18 },
  handDot: {
    position: 'absolute',
    width: 28,
    height: 28,
    marginLeft: -14,
    marginTop: -14,
    borderRadius: 14,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  handLabel: { fontSize: 10, fontWeight: '900', color: '#78350F' },
  hudWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(69,26,3,0.88)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
  },
  hudLabel: { color: '#FFFBEB', fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  meterTrack: {
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 6,
    overflow: 'visible',
  },
  meterFill: { height: '100%', borderRadius: 7 },
  targetLo: {
    position: 'absolute',
    top: -3,
    width: 2,
    height: 20,
    backgroundColor: GOLDILOCKS_SHELL.gold,
    opacity: 0.7,
  },
  targetHi: {
    position: 'absolute',
    top: -3,
    width: 2,
    height: 20,
    backgroundColor: GOLDILOCKS_SHELL.gold,
    opacity: 0.7,
  },
  targetMid: {
    position: 'absolute',
    top: -4,
    width: 3,
    height: 22,
    marginLeft: -1,
    backgroundColor: GOLDILOCKS_SHELL.good,
    borderRadius: 2,
  },
  hudRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, alignItems: 'center' },
  zoneBadge: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  accText: { color: '#FDE68A', fontSize: 11, fontWeight: '700' },
  roundText: { color: GOLDILOCKS_SHELL.gold, fontSize: 11, fontWeight: '800' },
  tastedRow: {
    position: 'absolute',
    top: 82,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(69,26,3,0.55)',
    borderRadius: 16,
  },
  tastedDot: { fontSize: 14 },
  bowlsRow: {
    position: 'absolute',
    top: '18%',
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  bowlCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: 'rgba(69,26,3,0.55)',
  },
  bowlEmoji: { fontSize: 16, marginBottom: 4 },
  porridgeCup: {
    width: 36,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  porridgeFill: { width: '100%', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  targetMark: {
    position: 'absolute',
    left: 2,
    right: 2,
    height: 3,
    backgroundColor: GOLDILOCKS_SHELL.good,
    borderRadius: 2,
  },
  bowlLabel: { color: '#FFFBEB', fontSize: 7, fontWeight: '900', marginTop: 4, letterSpacing: 0.3 },
  bowlSub: { color: '#FCD34D', fontSize: 7, fontWeight: '700' },
  spoonWrap: {
    position: 'absolute',
    bottom: '10%',
    right: '12%',
    alignItems: 'center',
    backgroundColor: 'rgba(69,26,3,0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(253,230,138,0.35)',
  },
  spoonEmoji: { fontSize: 22 },
  spoonLabel: { color: '#FDE68A', fontSize: 7, fontWeight: '900', letterSpacing: 0.8 },
  heroBowl: {
    position: 'absolute',
    top: '48%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  steam: { fontSize: 16, marginBottom: 2 },
  mainBowl: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    overflow: 'hidden',
    elevation: 10,
  },
  mainGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mainEmoji: { fontSize: 34 },
  bearEmoji: { fontSize: 18, marginTop: 2 },
  holdRing: {
    marginTop: 12,
    width: 88,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', borderRadius: 4 },
  tasteText: { color: GOLDILOCKS_SHELL.gold, fontSize: 11, fontWeight: '900', marginTop: 6 },
  qualityText: { color: '#FDE68A', fontSize: 10, fontWeight: '700', marginTop: 4 },
  banner: {
    position: 'absolute',
    top: '36%',
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bannerText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
