/** Berry Squish overlay — OT L9 S1 Game 3 */
import type { BerrySquishTheme } from '@/components/game/occupational/level9/session1/forceTheme';
import { BERRY_SHELL } from '@/components/game/occupational/level9/session1/forceTheme';
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
  theme: BerrySquishTheme;
  force: number;
  targetForce: number;
  holdProgress: number;
  squishProgress: number;
  squishing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  berry: string;
  leftHand: { x: number; y: number } | null;
  rightHand: { x: number; y: number } | null;
  banner: string;
  quality: number;
};

export function BerrySquishOverlay({
  theme,
  force,
  targetForce,
  holdProgress,
  squishProgress,
  squishing,
  roundActive,
  round,
  totalRounds,
  berry,
  leftHand,
  rightHand,
  banner,
  quality,
}: Props) {
  const leafSway = useSharedValue(0);
  const berryPulse = useSharedValue(1);
  const squishScale = useSharedValue(1);

  useEffect(() => {
    leafSway.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [leafSway]);

  useEffect(() => {
    if (roundActive && !squishing) {
      berryPulse.value = withRepeat(
        withSequence(withTiming(1.06, { duration: 600 }), withTiming(1, { duration: 600 })),
        -1,
        true,
      );
    } else {
      berryPulse.value = withTiming(1, { duration: 200 });
    }
  }, [roundActive, squishing, berryPulse]);

  useEffect(() => {
    if (squishing) {
      squishScale.value = withTiming(0, { duration: 650, easing: Easing.out(Easing.cubic) });
    } else {
      const ratio = Math.min(1, force / Math.max(0.3, targetForce));
      const flat = 1 - ratio * 0.35;
      const wide = 1 + ratio * 0.18;
      squishScale.value = withSpring(ratio, { damping: 16, stiffness: 140 });
      berryPulse.value = withSpring(flat);
    }
  }, [squishing, squishProgress, force, targetForce, squishScale, berryPulse]);

  const leafStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-4 + leafSway.value * 8}deg` }],
    opacity: 0.28 + leafSway.value * 0.12,
  }));

  const berryStyle = useAnimatedStyle(() => {
    if (squishing) {
      const p = squishProgress;
      return {
        transform: [
          { scaleX: 1 + p * 0.55 },
          { scaleY: Math.max(0.15, 1 - p * 0.85) },
        ],
        opacity: 1 - p * 0.35,
      };
    }
    const ratio = squishScale.value;
    return {
      transform: [
        { scaleX: 1 + ratio * 0.18 },
        { scaleY: 1 - ratio * 0.35 },
        { scale: berryPulse.value },
      ],
    };
  });

  const squeezePct = Math.round(force * 100);
  const targetPct = Math.round(targetForce * 100);
  const atTarget = force >= targetForce * 0.9;
  const handGap =
    leftHand && rightHand ? Math.hypot(rightHand.x - leftHand.x, rightHand.y - leftHand.y) : null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Garden decor */}
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`leaf-${i}`}
          style={[
            styles.decor,
            i % 2 === 0 ? leafStyle : undefined,
            { left: `${4 + (i * 21) % 86}%`, top: `${3 + (i % 4) * 9}%` },
          ]}
        >
          {d}
        </Animated.Text>
      ))}

      {/* Hand trackers — absolute normalized coords */}
      {leftHand && (
        <View
          style={[
            styles.handDot,
            { left: `${leftHand.x * 100}%`, top: `${leftHand.y * 100}%`, borderColor: theme.leaf },
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

      {/* Hand-gap guide */}
      {handGap !== null && roundActive && (
        <View style={styles.gapWrap}>
          <Text style={styles.gapLabel}>HAND GAP {Math.round(handGap * 100)}%</Text>
        </View>
      )}

      {/* Squeeze meter */}
      <View style={styles.meterWrap}>
        <Text style={styles.meterLabel}>
          SQUEEZE {squeezePct}% · TARGET {targetPct}%
        </Text>
        <View style={styles.meterTrack}>
          <LinearGradient
            colors={atTarget ? ['#34D399', '#10B981'] : [theme.accent, theme.accentDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.meterFill, { width: `${Math.min(100, squeezePct)}%` }]}
          />
          <View style={[styles.targetMark, { left: `${targetPct}%` }]} />
        </View>
        <View style={styles.qualityRow}>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={styles.roundText}>
            Berry {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      {/* Berry squish zone */}
      <View style={styles.berryZone}>
        <View style={[styles.basket, { borderColor: theme.leaf }]}>
          <LinearGradient colors={['#365314', '#14532D', '#052E16']} style={styles.basketGrad}>
            <Text style={styles.basketLabel}>SQUISH ZONE</Text>
          </LinearGradient>
        </View>

        <Animated.View style={[styles.berryWrap, berryStyle]}>
          <View style={[styles.berry, { borderColor: atTarget ? BERRY_SHELL.good : theme.accent }]}>
            <LinearGradient colors={[`${theme.accent}EE`, theme.accentDeep]} style={styles.berryGrad}>
              <Text style={styles.berryEmoji}>{berry}</Text>
            </LinearGradient>
          </View>
        </Animated.View>

        {roundActive && atTarget && !squishing && (
          <View style={styles.holdRing}>
            <LinearGradient
              colors={[theme.leaf, BERRY_SHELL.good]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.holdFill, { width: `${holdProgress * 100}%` }]}
            />
          </View>
        )}

        {squishing && (
          <View style={styles.juiceWrap}>
            {['💧', '✨', theme.juice === '#F97316' ? '🍊' : '💧', '✨'].map((j, i) => (
              <Text
                key={i}
                style={[
                  styles.juiceDrop,
                  {
                    left: `${20 + i * 18}%`,
                    top: `${squishProgress * 40}%`,
                    opacity: 0.4 + squishProgress * 0.6,
                    fontSize: 14 + squishProgress * 10,
                  },
                ]}
              >
                {j}
              </Text>
            ))}
            <Text style={styles.popText}>POP! {Math.round(squishProgress * 100)}%</Text>
          </View>
        )}
      </View>

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
    width: 32,
    height: 32,
    marginLeft: -16,
    marginTop: -16,
    borderRadius: 16,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  handLabel: { fontSize: 10, fontWeight: '900', color: '#14532D' },
  gapWrap: {
    position: 'absolute',
    bottom: '8%',
    alignSelf: 'center',
    backgroundColor: 'rgba(5,46,22,0.75)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(134,239,172,0.35)',
  },
  gapLabel: { color: '#BBF7D0', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  meterWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(5,46,22,0.82)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
  },
  meterLabel: { color: '#F0FDF4', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  meterTrack: {
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.12)',
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
    backgroundColor: BERRY_SHELL.gold,
    borderRadius: 2,
  },
  qualityRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  qualityText: { color: '#BBF7D0', fontSize: 11, fontWeight: '700' },
  roundText: { color: BERRY_SHELL.gold, fontSize: 11, fontWeight: '800' },
  berryZone: {
    position: 'absolute',
    bottom: '16%',
    alignSelf: 'center',
    alignItems: 'center',
    width: 180,
  },
  basket: {
    width: 150,
    height: 24,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 8,
  },
  basketGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  basketLabel: { color: '#86EFAC', fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  berryWrap: { alignItems: 'center', marginBottom: 4 },
  berry: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 12,
  },
  berryGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  berryEmoji: { fontSize: 48 },
  holdRing: {
    marginTop: 8,
    width: 120,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', borderRadius: 4 },
  juiceWrap: { position: 'absolute', top: -20, width: 160, height: 80, alignItems: 'center' },
  juiceDrop: { position: 'absolute' },
  popText: { color: BERRY_SHELL.gold, fontSize: 13, fontWeight: '900', marginTop: 48, letterSpacing: 0.5 },
  banner: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bannerText: { color: '#fff', fontSize: 18, fontWeight: '900' },
});
