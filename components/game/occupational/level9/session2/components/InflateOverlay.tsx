/** Inflate Carefully overlay — OT L9 S2 Game 4 */
import type { InflateCarefullyTheme } from '@/components/game/occupational/level9/session2/pressureTheme';
import { INFLATE_SHELL } from '@/components/game/occupational/level9/session2/pressureTheme';
import type { InflateFillStatus } from '@/components/game/occupational/level9/session2/pressureUtils';
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
  theme: InflateCarefullyTheme;
  force: number;
  targetForce: number;
  fill: number;
  targetFill: number;
  fillStatus: InflateFillStatus;
  holdProgress: number;
  sealProgress: number;
  sealing: boolean;
  popped: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  sealedCount: number;
  balloon: string;
  leftHand: { x: number; y: number } | null;
  rightHand: { x: number; y: number } | null;
  banner: string;
  quality: number;
};

export function InflateOverlay({
  theme,
  force,
  targetForce,
  fill,
  targetFill,
  fillStatus,
  holdProgress,
  sealProgress,
  sealing,
  popped,
  roundActive,
  round,
  totalRounds,
  sealedCount,
  balloon,
  leftHand,
  rightHand,
  banner,
  quality,
}: Props) {
  const drift = useSharedValue(0);
  const popScale = useSharedValue(1);

  useEffect(() => {
    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [drift]);

  useEffect(() => {
    if (popped) {
      popScale.value = withSequence(withSpring(1.4), withTiming(0.3, { duration: 280 }));
    } else {
      popScale.value = withSpring(1);
    }
  }, [popped, popScale]);

  const driftStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -6 + drift.value * 10 }],
  }));

  const popStyle = useAnimatedStyle(() => ({
    transform: [{ scale: popScale.value }],
    opacity: popped ? 0.5 : 1,
  }));

  const forcePct = Math.round(force * 100);
  const targetForcePct = Math.round(targetForce * 100);
  const fillPct = Math.round(fill * 100);
  const targetFillPct = Math.round(targetFill * 100);
  const inZone = fillStatus === 'zone';
  const atRisk = fillStatus === 'overfill' || fillStatus === 'popped';

  const balloonScale = 0.42 + fill * 0.72;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Text
          key={`cloud-${i}`}
          style={[styles.decor, { left: `${6 + (i * 16) % 86}%`, top: `${4 + (i % 4) * 8}%`, opacity: 0.28 }]}
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
          FILL {fillPct}% · GOAL {targetFillPct}% · FORCE {forcePct}%
        </Text>
        <View style={styles.fillTrack}>
          <LinearGradient
            colors={
              atRisk ? [INFLATE_SHELL.warn, '#BE123C'] : inZone ? ['#34D399', '#10B981'] : [theme.accent, theme.accentDeep]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.fillBar, { width: `${Math.min(100, fillPct)}%` }]}
          />
          <View style={[styles.targetLine, { left: `${targetFillPct}%` }]} />
          <View style={[styles.dangerLine, { left: `${Math.min(98, targetFillPct + 8)}%` }]} />
        </View>
        <View style={styles.forceTrack}>
          <View
            style={[
              styles.forceBar,
              {
                width: `${Math.min(100, forcePct)}%`,
                backgroundColor: force > targetForce + 0.1 ? INFLATE_SHELL.warn : theme.balloon,
              },
            ]}
          />
          <View style={[styles.forceTarget, { left: `${targetForcePct}%` }]} />
        </View>
        <View style={styles.hudRow}>
          <Text
            style={[
              styles.statusBadge,
              { color: atRisk ? INFLATE_SHELL.warn : inZone ? INFLATE_SHELL.good : theme.cloud },
            ]}
          >
            {popped ? 'POP!' : inZone ? 'PERFECT' : fillStatus === 'overfill' ? 'EASE OFF' : 'INFLATING'}
          </Text>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={styles.roundText}>
            Balloon {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      <View style={styles.sealedRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.sealedDot, { opacity: i < sealedCount ? 1 : 0.25 }]}>
            {i < sealedCount ? theme.balloons[i % theme.balloons.length] : '·'}
          </Text>
        ))}
      </View>

      <Animated.View style={[styles.balloonWrap, driftStyle, popStyle]}>
        <View
          style={[
            styles.balloonOuter,
            {
              transform: [{ scale: balloonScale }],
              borderColor: inZone ? INFLATE_SHELL.good : atRisk ? INFLATE_SHELL.warn : theme.accent,
            },
          ]}
        >
          <LinearGradient colors={[theme.cloud, theme.accent]} style={styles.balloonGrad}>
            <Text style={styles.balloonEmoji}>{popped ? '💥' : sealing ? '✨' : balloon}</Text>
          </LinearGradient>
          <View style={[styles.targetRing, { top: `${(1 - targetFill) * 72}%` }]} />
          <View style={styles.balloonString} />
        </View>
        {roundActive && inZone && !sealing && !popped && (
          <View style={styles.holdRing}>
            <LinearGradient
              colors={[INFLATE_SHELL.gold, INFLATE_SHELL.good]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.holdFill, { width: `${holdProgress * 100}%` }]}
            />
          </View>
        )}
        {sealing && (
          <Text style={styles.sealText}>SEAL {Math.round(sealProgress * 100)}%</Text>
        )}
      </Animated.View>

      <View style={styles.pumpWrap}>
        <Text style={styles.pumpEmoji}>{theme.hero}</Text>
        <Text style={styles.pumpLabel}>CLOUD PUMP</Text>
      </View>

      {banner ? (
        <View style={[styles.banner, { backgroundColor: atRisk ? INFLATE_SHELL.warn : theme.accentDeep }]}>
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
  handLabel: { fontSize: 10, fontWeight: '900', color: '#0C4A6E' },
  hudWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(12,74,110,0.88)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.35)',
  },
  hudLabel: { color: '#F0F9FF', fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  fillTrack: {
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 6,
    overflow: 'visible',
  },
  fillBar: { height: '100%', borderRadius: 8 },
  targetLine: {
    position: 'absolute',
    top: -4,
    width: 3,
    height: 24,
    marginLeft: -1,
    backgroundColor: INFLATE_SHELL.gold,
    borderRadius: 2,
  },
  dangerLine: {
    position: 'absolute',
    top: -2,
    width: 2,
    height: 20,
    marginLeft: -1,
    backgroundColor: INFLATE_SHELL.warn,
    opacity: 0.7,
  },
  forceTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 8,
    overflow: 'visible',
  },
  forceBar: { height: '100%', borderRadius: 4 },
  forceTarget: {
    position: 'absolute',
    top: -2,
    width: 2,
    height: 12,
    marginLeft: -1,
    backgroundColor: '#fff',
    opacity: 0.8,
  },
  hudRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, alignItems: 'center' },
  statusBadge: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  qualityText: { color: '#BAE6FD', fontSize: 11, fontWeight: '700' },
  roundText: { color: INFLATE_SHELL.gold, fontSize: 11, fontWeight: '800' },
  sealedRow: {
    position: 'absolute',
    top: 88,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(12,74,110,0.55)',
    borderRadius: 16,
  },
  sealedDot: { fontSize: 14 },
  balloonWrap: {
    position: 'absolute',
    top: '36%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  balloonOuter: {
    width: 110,
    height: 130,
    borderRadius: 55,
    borderWidth: 3,
    overflow: 'hidden',
    alignItems: 'center',
    shadowColor: '#38BDF8',
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 12,
  },
  balloonGrad: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
  balloonEmoji: { fontSize: 40 },
  targetRing: {
    position: 'absolute',
    left: 4,
    right: 4,
    height: 3,
    backgroundColor: INFLATE_SHELL.gold,
    borderRadius: 2,
    opacity: 0.85,
  },
  balloonString: {
    position: 'absolute',
    bottom: -28,
    width: 2,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  holdRing: {
    marginTop: 36,
    width: 90,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', borderRadius: 4 },
  sealText: { color: INFLATE_SHELL.gold, fontSize: 11, fontWeight: '900', marginTop: 8 },
  pumpWrap: {
    position: 'absolute',
    bottom: '8%',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(12,74,110,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(186,230,253,0.35)',
  },
  pumpEmoji: { fontSize: 22 },
  pumpLabel: { color: '#BAE6FD', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  banner: {
    position: 'absolute',
    top: '52%',
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bannerText: { color: '#fff', fontSize: 17, fontWeight: '900' },
});
