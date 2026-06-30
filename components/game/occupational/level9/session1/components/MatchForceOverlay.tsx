/** Match The Force overlay — OT L9 S1 Game 5 */
import type { MatchForceTheme } from '@/components/game/occupational/level9/session1/forceTheme';
import { MATCH_SHELL } from '@/components/game/occupational/level9/session1/forceTheme';
import type { MatchDirection } from '@/components/game/occupational/level9/session1/forceUtils';
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
  theme: MatchForceTheme;
  force: number;
  targetForce: number;
  tolerance: number;
  direction: MatchDirection;
  holdProgress: number;
  syncProgress: number;
  syncing: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  crystal: string;
  leftHand: { x: number; y: number } | null;
  rightHand: { x: number; y: number } | null;
  banner: string;
  quality: number;
  matchAccuracy: number;
};

export function MatchForceOverlay({
  theme,
  force,
  targetForce,
  tolerance,
  direction,
  holdProgress,
  syncProgress,
  syncing,
  previewing,
  roundActive,
  round,
  totalRounds,
  crystal,
  leftHand,
  rightHand,
  banner,
  quality,
  matchAccuracy,
}: Props) {
  const holoPulse = useSharedValue(0);
  const mirrorGlow = useSharedValue(0);
  const lockScale = useSharedValue(1);

  useEffect(() => {
    holoPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [holoPulse]);

  useEffect(() => {
    if (previewing) {
      mirrorGlow.value = withRepeat(
        withSequence(withTiming(1, { duration: 500 }), withTiming(0.4, { duration: 500 })),
        -1,
        true,
      );
    } else if (direction === 'matched') {
      mirrorGlow.value = withRepeat(
        withSequence(withTiming(1, { duration: 350 }), withTiming(0.6, { duration: 350 })),
        -1,
        true,
      );
    } else {
      mirrorGlow.value = withTiming(0.3, { duration: 200 });
    }
  }, [previewing, direction, mirrorGlow]);

  useEffect(() => {
    if (syncing) {
      lockScale.value = withSequence(withSpring(1.2), withTiming(1, { duration: 300 }));
    } else {
      lockScale.value = withSpring(1);
    }
  }, [syncing, syncProgress, lockScale]);

  const holoStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + holoPulse.value * 0.35,
  }));

  const mirrorStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + mirrorGlow.value * 0.5,
    transform: [{ scale: syncing ? 1 + syncProgress * 0.15 : 1 }],
  }));

  const lockStyle = useAnimatedStyle(() => ({
    transform: [{ scale: lockScale.value }],
  }));

  const playerPct = Math.round(force * 100);
  const targetPct = Math.round(targetForce * 100);
  const deltaPct = Math.round(Math.abs(force - targetForce) * 100);

  const dirLabel =
    direction === 'matched' ? 'LOCKED' : direction === 'high' ? 'TOO HIGH' : 'TOO LOW';
  const dirColor =
    direction === 'matched' ? MATCH_SHELL.good : direction === 'high' ? MATCH_SHELL.warn : theme.mirror;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`holo-${i}`}
          style={[
            styles.decor,
            holoStyle,
            { left: `${5 + (i * 17) % 88}%`, top: `${4 + (i % 4) * 8}%` },
          ]}
        >
          {d}
        </Animated.Text>
      ))}

      {leftHand && (
        <View
          style={[
            styles.handDot,
            { left: `${leftHand.x * 100}%`, top: `${leftHand.y * 100}%`, borderColor: theme.mirror },
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

      {/* HUD */}
      <View style={styles.hudWrap}>
        <Text style={styles.hudLabel}>
          {previewing ? 'STUDY TARGET' : `DELTA ${deltaPct}% · MATCH ${Math.round(matchAccuracy * 100)}%`}
        </Text>
        <View style={styles.hudRow}>
          <Text style={[styles.dirBadge, { color: dirColor }]}>{previewing ? 'PREVIEW' : dirLabel}</Text>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={styles.roundText}>
            Mirror {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      {/* Dual force meters */}
      <View style={styles.metersWrap}>
        {/* Target meter */}
        <Animated.View style={[styles.meterBlock, mirrorStyle]}>
          <Text style={[styles.meterLabel, { color: MATCH_SHELL.target }]}>CRYSTAL TARGET</Text>
          <View style={styles.meterTrack}>
            <LinearGradient
              colors={[theme.mirror, theme.holo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.meterFill, { width: `${targetPct}%` }]}
            />
            <View style={[styles.needle, { left: `${targetPct}%`, backgroundColor: MATCH_SHELL.target }]} />
          </View>
          <Text style={styles.pctText}>{targetPct}%</Text>
        </Animated.View>

        {/* Mirror divider */}
        <View style={styles.divider}>
          <Text style={styles.dividerEmoji}>🪞</Text>
        </View>

        {/* Player meter */}
        <View style={styles.meterBlock}>
          <Text style={[styles.meterLabel, { color: theme.accent }]}>YOUR FORCE</Text>
          <View style={styles.meterTrack}>
            <LinearGradient
              colors={
                direction === 'matched'
                  ? [MATCH_SHELL.good, '#10B981']
                  : [theme.accent, theme.accentDeep]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.meterFill, { width: `${Math.min(100, playerPct)}%` }]}
            />
            <View style={[styles.needle, { left: `${Math.min(100, playerPct)}%`, backgroundColor: theme.accent }]} />
            {/* Ghost target line on player bar */}
            <View style={[styles.ghostMark, { left: `${targetPct}%` }]} />
          </View>
          <Text style={styles.pctText}>{playerPct}%</Text>
        </View>
      </View>

      {/* Crystal lock zone */}
      <Animated.View style={[styles.crystalWrap, lockStyle]}>
        <View
          style={[
            styles.crystal,
            {
              borderColor:
                direction === 'matched' || syncing ? MATCH_SHELL.good : previewing ? theme.mirror : theme.accent,
            },
          ]}
        >
          <LinearGradient
            colors={
              syncing
                ? [MATCH_SHELL.good, theme.mirror, theme.accent]
                : previewing
                  ? [theme.mirror, theme.holo]
                  : [theme.accentDeep, theme.accent]
            }
            style={styles.crystalGrad}
          >
            <Text style={styles.crystalEmoji}>{syncing ? '🔒' : crystal}</Text>
          </LinearGradient>
        </View>

        {roundActive && direction === 'matched' && !syncing && (
          <View style={styles.holdRing}>
            <LinearGradient
              colors={[theme.mirror, MATCH_SHELL.good]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.holdFill, { width: `${holdProgress * 100}%` }]}
            />
          </View>
        )}

        {syncing && (
          <Text style={styles.syncText}>MIRROR LOCK {Math.round(syncProgress * 100)}%</Text>
        )}
      </Animated.View>

      {banner ? (
        <View style={[styles.banner, { backgroundColor: theme.accentDeep }]}>
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
    borderRadius: 10,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  handLabel: { fontSize: 10, fontWeight: '900', color: '#581C87' },
  hudWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(12,10,26,0.88)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(217,70,239,0.35)',
  },
  hudLabel: { color: '#FAF5FF', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  hudRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  dirBadge: { fontSize: 11, fontWeight: '900', letterSpacing: 0.6 },
  qualityText: { color: '#C4B5FD', fontSize: 11, fontWeight: '700' },
  roundText: { color: MATCH_SHELL.gold, fontSize: 11, fontWeight: '800' },
  metersWrap: {
    position: 'absolute',
    top: '22%',
    left: 12,
    right: 12,
    gap: 8,
  },
  meterBlock: { gap: 4 },
  meterLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  meterTrack: {
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'visible',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  meterFill: { height: '100%', borderRadius: 9 },
  needle: {
    position: 'absolute',
    top: -4,
    width: 4,
    height: 26,
    marginLeft: -2,
    borderRadius: 2,
  },
  ghostMark: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    marginLeft: -1,
    backgroundColor: 'rgba(34,211,238,0.7)',
    borderRadius: 1,
  },
  pctText: { color: '#E9D5FF', fontSize: 12, fontWeight: '900', textAlign: 'right' },
  divider: { alignItems: 'center', marginVertical: 2 },
  dividerEmoji: { fontSize: 22, opacity: 0.7 },
  crystalWrap: {
    position: 'absolute',
    bottom: '14%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  crystal: {
    width: 100,
    height: 100,
    borderRadius: 24,
    borderWidth: 4,
    overflow: 'hidden',
    shadowColor: '#D946EF',
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 14,
    transform: [{ rotate: '45deg' }],
  },
  crystalGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  crystalEmoji: { fontSize: 36, transform: [{ rotate: '-45deg' }] },
  holdRing: {
    marginTop: 16,
    width: 130,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', borderRadius: 4 },
  syncText: { color: MATCH_SHELL.gold, fontSize: 13, fontWeight: '900', marginTop: 10, letterSpacing: 0.6 },
  banner: {
    position: 'absolute',
    top: '42%',
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bannerText: { color: '#fff', fontSize: 17, fontWeight: '900' },
});
