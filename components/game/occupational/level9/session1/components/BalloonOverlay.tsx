/** Balloon Press overlay — OT L9 S1 */
import type { BalloonPressTheme } from '@/components/game/occupational/level9/session1/forceTheme';
import { FORCE_SHELL } from '@/components/game/occupational/level9/session1/forceTheme';
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
  theme: BalloonPressTheme;
  force: number;
  targetForce: number;
  holdProgress: number;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  leftHand: { x: number; y: number } | null;
  rightHand: { x: number; y: number } | null;
  banner: string;
  quality: number;
};

export function BalloonOverlay({
  theme,
  force,
  targetForce,
  holdProgress,
  roundActive,
  round,
  totalRounds,
  leftHand,
  rightHand,
  banner,
  quality,
}: Props) {
  const bob = useSharedValue(0);
  const pop = useSharedValue(1);

  useEffect(() => {
    bob.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [bob]);

  useEffect(() => {
    if (holdProgress >= 1) {
      pop.value = withSequence(withSpring(1.35), withTiming(0, { duration: 200 }));
    } else {
      pop.value = withSpring(1);
    }
  }, [holdProgress, pop]);

  const bobStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -8 + bob.value * 14 }],
  }));

  const balloonScale = 0.55 + Math.min(1, force / Math.max(0.35, targetForce)) * 0.55;
  const targetPct = Math.round(targetForce * 100);
  const forcePct = Math.round(force * 100);
  const atTarget = force >= targetForce * 0.92;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Floating decor */}
      {theme.decor.map((d, i) => (
        <Text
          key={i}
          style={[styles.decor, { left: `${8 + (i * 17) % 80}%`, top: `${6 + (i % 3) * 8}%`, opacity: 0.25 + (i % 2) * 0.1 }]}
        >
          {d}
        </Text>
      ))}

      {/* Hand trackers — absolute normalized coords */}
      {leftHand && (
        <View style={[styles.handDot, { left: `${leftHand.x * 100}%`, top: `${leftHand.y * 100}%`, borderColor: theme.accent }]}>
          <Text style={styles.handLabel}>L</Text>
        </View>
      )}
      {rightHand && (
        <View style={[styles.handDot, { left: `${rightHand.x * 100}%`, top: `${rightHand.y * 100}%`, borderColor: theme.accentDeep }]}>
          <Text style={styles.handLabel}>R</Text>
        </View>
      )}

      {/* Force meter */}
      <View style={styles.meterWrap}>
        <Text style={styles.meterLabel}>FORCE {forcePct}% · GOAL {targetPct}%</Text>
        <View style={styles.meterTrack}>
          <View style={[styles.meterFill, { width: `${Math.min(100, forcePct)}%`, backgroundColor: atTarget ? FORCE_SHELL.good : theme.accent }]} />
          <View style={[styles.targetMark, { left: `${targetPct}%` }]} />
        </View>
        <View style={styles.qualityRow}>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={styles.roundText}>Balloon {round + 1}/{totalRounds}</Text>
        </View>
      </View>

      {/* Balloon */}
      <Animated.View style={[styles.balloonWrap, bobStyle]}>
        <View style={[styles.balloon, { transform: [{ scale: balloonScale }], borderColor: atTarget ? '#34D399' : theme.accent }]}>
          <LinearGradient colors={[`${theme.accent}EE`, theme.accentDeep]} style={styles.balloonGrad}>
            <Text style={styles.balloonEmoji}>{theme.balloonEmoji}</Text>
          </LinearGradient>
          <View style={styles.balloonString} />
        </View>
        {roundActive && atTarget && (
          <View style={styles.holdRing}>
            <View style={[styles.holdFill, { width: `${holdProgress * 100}%` }]} />
          </View>
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
  decor: { position: 'absolute', fontSize: 22 },
  handDot: {
    position: 'absolute',
    width: 28,
    height: 28,
    marginLeft: -14,
    marginTop: -14,
    borderRadius: 14,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  handLabel: { fontSize: 10, fontWeight: '900', color: '#831843' },
  meterWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(15,23,42,0.72)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(244,114,182,0.35)',
  },
  meterLabel: { color: '#FDF2F8', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  meterTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: 6,
    overflow: 'visible',
  },
  meterFill: { height: '100%', borderRadius: 6 },
  targetMark: {
    position: 'absolute',
    top: -2,
    width: 3,
    height: 16,
    marginLeft: -1,
    backgroundColor: '#FDE68A',
    borderRadius: 2,
  },
  qualityRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  qualityText: { color: '#FBCFE8', fontSize: 11, fontWeight: '700' },
  roundText: { color: '#FDE68A', fontSize: 11, fontWeight: '800' },
  balloonWrap: { position: 'absolute', bottom: '18%', alignSelf: 'center', alignItems: 'center' },
  balloon: {
    width: 120,
    height: 140,
    borderRadius: 60,
    borderWidth: 4,
    overflow: 'hidden',
    shadowColor: '#F472B6',
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 14,
  },
  balloonGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  balloonEmoji: { fontSize: 52 },
  balloonString: {
    position: 'absolute',
    bottom: -28,
    alignSelf: 'center',
    width: 2,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  holdRing: {
    marginTop: 10,
    width: 100,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', backgroundColor: '#34D399', borderRadius: 4 },
  banner: {
    position: 'absolute',
    top: '42%',
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bannerText: { color: '#fff', fontSize: 18, fontWeight: '900' },
});
