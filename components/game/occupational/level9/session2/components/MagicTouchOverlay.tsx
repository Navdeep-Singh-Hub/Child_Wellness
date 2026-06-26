/** Magic Touch overlay — OT L9 S2 Game 3 */
import type { MagicTouchTheme } from '@/components/game/occupational/level9/session2/pressureTheme';
import { MAGIC_SHELL } from '@/components/game/occupational/level9/session2/pressureTheme';
import { MAGIC_CRYSTAL_SPOTS } from '@/components/game/occupational/level9/session2/pressureUtils';
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
  theme: MagicTouchTheme;
  force: number;
  targetForce: number;
  crushLevel: number;
  tooHard: boolean;
  holdProgress: number;
  activateProgress: number;
  activating: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  awakenedCount: number;
  crystal: string;
  crystalSpot: { x: number; y: number };
  touchHand: { x: number; y: number } | null;
  leftHand: { x: number; y: number } | null;
  rightHand: { x: number; y: number } | null;
  reachDist: number;
  banner: string;
  quality: number;
};

export function MagicTouchOverlay({
  theme,
  force,
  targetForce,
  crushLevel,
  tooHard,
  holdProgress,
  activateProgress,
  activating,
  roundActive,
  round,
  totalRounds,
  awakenedCount,
  crystal,
  crystalSpot,
  touchHand,
  leftHand,
  rightHand,
  reachDist,
  banner,
  quality,
}: Props) {
  const starFloat = useSharedValue(0);
  const crystalPulse = useSharedValue(0);

  useEffect(() => {
    starFloat.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1300, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [starFloat]);

  useEffect(() => {
    if (roundActive || activating) {
      crystalPulse.value = withRepeat(
        withSequence(withTiming(1, { duration: 500 }), withTiming(0.5, { duration: 500 })),
        -1,
        true,
      );
    } else {
      crystalPulse.value = withTiming(0.4, { duration: 200 });
    }
  }, [roundActive, activating, crystalPulse]);

  const starStyle = useAnimatedStyle(() => ({
    opacity: 0.22 + starFloat.value * 0.35,
    transform: [{ translateY: -6 + starFloat.value * 12 }],
  }));

  const crystalStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: activating ? 1 + activateProgress * 0.5 : 0.9 + crystalPulse.value * 0.2 },
    ],
    opacity: activating ? 1 - activateProgress * 0.3 : 1,
  }));

  const touchPct = Math.round(force * 100);
  const targetPct = Math.round(targetForce * 100);
  const atTarget = force >= targetForce * 0.9 && !tooHard;
  const reachPct = Math.round(Math.max(0, 1 - reachDist / 0.35) * 100);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`magic-${i}`}
          style={[styles.decor, starStyle, { left: `${4 + (i * 17) % 88}%`, top: `${3 + (i % 4) * 9}%` }]}
        >
          {d}
        </Animated.Text>
      ))}

      {leftHand && (
        <View
          style={[
            styles.handDot,
            styles.handGhost,
            { left: `${leftHand.x * 100}%`, top: `${leftHand.y * 100}%`, borderColor: theme.crystal },
          ]}
        >
          <Text style={styles.handLabel}>L</Text>
        </View>
      )}
      {rightHand && (
        <View
          style={[
            styles.handDot,
            styles.handGhost,
            { left: `${rightHand.x * 100}%`, top: `${rightHand.y * 100}%`, borderColor: theme.accent },
          ]}
        >
          <Text style={styles.handLabel}>R</Text>
        </View>
      )}
      {touchHand && (
        <View
          style={[
            styles.handDot,
            styles.leadHand,
            { left: `${touchHand.x * 100}%`, top: `${touchHand.y * 100}%`, borderColor: theme.wand },
          ]}
        >
          <Text style={styles.handLabel}>✋</Text>
        </View>
      )}

      <View style={styles.hudWrap}>
        <Text style={styles.hudLabel}>
          TOUCH {touchPct}% · GENTLE {targetPct}% · REACH {reachPct}%
        </Text>
        <View style={styles.meterTrack}>
          <LinearGradient
            colors={
              tooHard ? [MAGIC_SHELL.warn, '#BE123C'] : atTarget ? ['#34D399', '#10B981'] : [theme.accent, theme.accentDeep]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.meterFill, { width: `${Math.min(100, touchPct)}%` }]}
          />
          <View style={[styles.targetMark, { left: `${targetPct}%` }]} />
        </View>
        <View style={styles.hudRow}>
          <Text style={[styles.statusBadge, { color: tooHard ? MAGIC_SHELL.warn : atTarget ? MAGIC_SHELL.good : theme.crystal }]}>
            {tooHard ? 'TOO HARD' : atTarget ? 'GENTLE' : 'TOO SOFT'}
          </Text>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={styles.roundText}>
            Crystal {round + 1}/{totalRounds}
          </Text>
        </View>
        {crushLevel > 0.5 && (
          <Text style={styles.crushText}>Crush {Math.round(crushLevel * 100)}% — ease off!</Text>
        )}
      </View>

      {/* Awakened crystals trail */}
      <View style={styles.awakenedRow}>
        {MAGIC_CRYSTAL_SPOTS.map((_, i) => (
          <Text key={i} style={[styles.awakenedDot, { opacity: i < awakenedCount ? 1 : 0.25 }]}>
            {i < awakenedCount ? theme.crystals[i % theme.crystals.length] : '·'}
          </Text>
        ))}
      </View>

      {/* Active crystal */}
      <Animated.View
        style={[
          styles.crystalWrap,
          crystalStyle,
          { left: `${crystalSpot.x * 100}%`, top: `${crystalSpot.y * 100}%` },
        ]}
      >
        <View style={[styles.crystalOuter, { borderColor: atTarget ? MAGIC_SHELL.good : theme.accent }]}>
          <LinearGradient colors={[theme.crystal, theme.accentDeep]} style={styles.crystalGrad}>
            <Text style={styles.crystalEmoji}>{activating ? '✨' : crystal}</Text>
          </LinearGradient>
        </View>
        {roundActive && atTarget && !activating && (
          <View style={styles.holdRing}>
            <LinearGradient
              colors={[theme.wand, MAGIC_SHELL.good]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.holdFill, { width: `${holdProgress * 100}%` }]}
            />
          </View>
        )}
        {activating && (
          <Text style={styles.activateText}>AWAKEN {Math.round(activateProgress * 100)}%</Text>
        )}
      </Animated.View>

      {/* Reach guide line */}
      {touchHand && roundActive && (
        <View
          style={[
            styles.reachGuide,
            {
              left: `${Math.min(touchHand.x, crystalSpot.x) * 100}%`,
              top: `${Math.min(touchHand.y, crystalSpot.y) * 100}%`,
              width: `${Math.abs(crystalSpot.x - touchHand.x) * 100}%`,
              height: `${Math.abs(crystalSpot.y - touchHand.y) * 100}%`,
              opacity: 0.15 + (1 - Math.min(1, reachDist / 0.35)) * 0.25,
            },
          ]}
        />
      )}

      {/* Wand */}
      <View style={styles.wandWrap}>
        <Text style={styles.wandEmoji}>{theme.hero}</Text>
        <Text style={styles.wandLabel}>MAGIC WAND</Text>
      </View>

      {banner ? (
        <View style={[styles.banner, { backgroundColor: tooHard ? MAGIC_SHELL.warn : theme.accentDeep }]}>
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
    backgroundColor: 'rgba(255,255,255,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  handGhost: { opacity: 0.65 },
  leadHand: { width: 34, height: 34, marginLeft: -17, marginTop: -17, borderRadius: 17, elevation: 10 },
  handLabel: { fontSize: 10, fontWeight: '900', color: '#4C1D95' },
  hudWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(26,10,46,0.88)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.35)',
  },
  hudLabel: { color: '#FAF5FF', fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  meterTrack: {
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 6,
    overflow: 'visible',
  },
  meterFill: { height: '100%', borderRadius: 7 },
  targetMark: {
    position: 'absolute',
    top: -3,
    width: 3,
    height: 20,
    marginLeft: -1,
    backgroundColor: MAGIC_SHELL.gold,
    borderRadius: 2,
  },
  hudRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, alignItems: 'center' },
  statusBadge: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  qualityText: { color: '#C4B5FD', fontSize: 11, fontWeight: '700' },
  roundText: { color: MAGIC_SHELL.gold, fontSize: 11, fontWeight: '800' },
  crushText: { color: MAGIC_SHELL.warn, fontSize: 10, fontWeight: '800', marginTop: 4 },
  awakenedRow: {
    position: 'absolute',
    top: 72,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(26,10,46,0.6)',
    borderRadius: 16,
  },
  awakenedDot: { fontSize: 14 },
  crystalWrap: {
    position: 'absolute',
    width: 80,
    marginLeft: -40,
    marginTop: -40,
    alignItems: 'center',
  },
  crystalOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    overflow: 'hidden',
    shadowColor: '#A78BFA',
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 14,
  },
  crystalGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  crystalEmoji: { fontSize: 34 },
  holdRing: {
    marginTop: 10,
    width: 70,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', borderRadius: 4 },
  activateText: { color: MAGIC_SHELL.gold, fontSize: 11, fontWeight: '900', marginTop: 6 },
  reachGuide: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderStyle: 'dashed',
    borderRadius: 4,
  },
  wandWrap: {
    position: 'absolute',
    bottom: '8%',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(26,10,46,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(253,224,71,0.35)',
  },
  wandEmoji: { fontSize: 22 },
  wandLabel: { color: '#FDE68A', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
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
