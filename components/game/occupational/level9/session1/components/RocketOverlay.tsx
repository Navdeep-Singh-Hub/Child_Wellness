/** Rocket Push overlay — OT L9 S1 Game 2 */
import type { RocketPushTheme } from '@/components/game/occupational/level9/session1/forceTheme';
import { ROCKET_SHELL } from '@/components/game/occupational/level9/session1/forceTheme';
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
  theme: RocketPushTheme;
  force: number;
  targetForce: number;
  holdProgress: number;
  launchProgress: number;
  launching: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  destination: string;
  leftPalm: { x: number; y: number } | null;
  rightPalm: { x: number; y: number } | null;
  banner: string;
  quality: number;
};

export function RocketOverlay({
  theme,
  force,
  targetForce,
  holdProgress,
  launchProgress,
  launching,
  roundActive,
  round,
  totalRounds,
  destination,
  leftPalm,
  rightPalm,
  banner,
  quality,
}: Props) {
  const starPulse = useSharedValue(0);
  const flameFlicker = useSharedValue(0);
  const rocketLift = useSharedValue(0);

  useEffect(() => {
    starPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [starPulse]);

  useEffect(() => {
    if (force > 0.15 && roundActive) {
      flameFlicker.value = withRepeat(
        withSequence(withTiming(1, { duration: 80 }), withTiming(0.4, { duration: 80 })),
        -1,
        true,
      );
    } else {
      flameFlicker.value = withTiming(0, { duration: 200 });
    }
  }, [force, roundActive, flameFlicker]);

  useEffect(() => {
    if (launching) {
      rocketLift.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    } else {
      const thrustRatio = Math.min(1, force / Math.max(0.3, targetForce));
      rocketLift.value = withSpring(thrustRatio * 0.35, { damping: 14, stiffness: 120 });
    }
  }, [launching, launchProgress, force, targetForce, rocketLift]);

  const starStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + starPulse.value * 0.35,
  }));

  const flameStyle = useAnimatedStyle(() => ({
    opacity: flameFlicker.value,
    transform: [{ scaleY: 0.6 + flameFlicker.value * 0.5 }],
  }));

  const rocketStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: launching ? -120 - launchProgress * 180 : -rocketLift.value * 48 },
      { scale: launching ? 1 + launchProgress * 0.25 : 1 },
    ],
    opacity: launching && launchProgress > 0.85 ? 1 - (launchProgress - 0.85) / 0.15 : 1,
  }));

  const thrustPct = Math.round(force * 100);
  const targetPct = Math.round(targetForce * 100);
  const atTarget = force >= targetForce * 0.9;
  const showFlame = force > 0.12 && (roundActive || launching);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Nebula stars */}
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`star-${i}`}
          style={[
            styles.decor,
            starStyle,
            { left: `${5 + (i * 19) % 88}%`, top: `${4 + (i % 4) * 7}%` },
          ]}
        >
          {d}
        </Animated.Text>
      ))}

      {/* Destination planet */}
      <View style={styles.destWrap}>
        <Text style={styles.destLabel}>DESTINATION</Text>
        <View style={[styles.destPlanet, { borderColor: theme.accent }]}>
          <Text style={styles.destEmoji}>{destination}</Text>
        </View>
      </View>

      {/* Palm trackers — absolute normalized coords */}
      {leftPalm && (
        <View
          style={[
            styles.palmDot,
            { left: `${leftPalm.x * 100}%`, top: `${leftPalm.y * 100}%`, borderColor: theme.accent },
          ]}
        >
          <Text style={styles.palmLabel}>L</Text>
        </View>
      )}
      {rightPalm && (
        <View
          style={[
            styles.palmDot,
            { left: `${rightPalm.x * 100}%`, top: `${rightPalm.y * 100}%`, borderColor: theme.thrust },
          ]}
        >
          <Text style={styles.palmLabel}>R</Text>
        </View>
      )}

      {/* Thrust meter */}
      <View style={styles.meterWrap}>
        <Text style={styles.meterLabel}>
          THRUST {thrustPct}% · TARGET {targetPct}%
        </Text>
        <View style={styles.meterTrack}>
          <LinearGradient
            colors={atTarget ? ['#34D399', '#10B981'] : [theme.thrust, theme.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.meterFill, { width: `${Math.min(100, thrustPct)}%` }]}
          />
          <View style={[styles.targetMark, { left: `${targetPct}%` }]} />
        </View>
        <View style={styles.qualityRow}>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={styles.roundText}>
            Launch {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      {/* Launch pad + rocket */}
      <View style={styles.padWrap}>
        <View style={styles.launchPad}>
          <LinearGradient colors={['#334155', '#1E293B', '#0F172A']} style={styles.padGrad}>
            <Text style={styles.padLabel}>LAUNCH PAD</Text>
          </LinearGradient>
        </View>

        <Animated.View style={[styles.rocketColumn, rocketStyle]}>
          <View style={[styles.rocketBody, { borderColor: atTarget ? ROCKET_SHELL.good : theme.accent }]}>
            <LinearGradient colors={[theme.accent, theme.accentDeep]} style={styles.rocketGrad}>
              <Text style={styles.rocketEmoji}>{theme.emoji}</Text>
            </LinearGradient>
            <View style={styles.rocketWindow} />
          </View>
          {showFlame && (
            <Animated.View style={[styles.flameWrap, flameStyle]}>
              <LinearGradient colors={['#FDE68A', theme.thrust, '#DC2626']} style={styles.flame} />
            </Animated.View>
          )}
        </Animated.View>

        {roundActive && atTarget && !launching && (
          <View style={styles.holdRing}>
            <LinearGradient
              colors={[theme.accent, ROCKET_SHELL.good]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.holdFill, { width: `${holdProgress * 100}%` }]}
            />
          </View>
        )}
        {launching && (
          <Text style={styles.blastText}>BLAST OFF! {Math.round(launchProgress * 100)}%</Text>
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
  decor: { position: 'absolute', fontSize: 20 },
  destWrap: {
    position: 'absolute',
    top: 52,
    right: 12,
    alignItems: 'center',
  },
  destLabel: { color: '#94A3B8', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  destPlanet: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    backgroundColor: 'rgba(15,23,42,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  destEmoji: { fontSize: 24 },
  palmDot: {
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
  palmLabel: { fontSize: 10, fontWeight: '900', color: '#0C4A6E' },
  meterWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 72,
    backgroundColor: 'rgba(2,6,23,0.82)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.35)',
  },
  meterLabel: { color: '#E0F2FE', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
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
    backgroundColor: ROCKET_SHELL.gold,
    borderRadius: 2,
  },
  qualityRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  qualityText: { color: '#BAE6FD', fontSize: 11, fontWeight: '700' },
  roundText: { color: ROCKET_SHELL.gold, fontSize: 11, fontWeight: '800' },
  padWrap: {
    position: 'absolute',
    bottom: '14%',
    alignSelf: 'center',
    alignItems: 'center',
    width: 160,
  },
  launchPad: {
    width: 140,
    height: 22,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
  },
  padGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  padLabel: { color: '#94A3B8', fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  rocketColumn: { alignItems: 'center', marginBottom: 6 },
  rocketBody: {
    width: 56,
    height: 88,
    borderRadius: 28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 3,
    overflow: 'hidden',
    shadowColor: '#38BDF8',
    shadowOpacity: 0.65,
    shadowRadius: 16,
    elevation: 14,
  },
  rocketGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  rocketEmoji: { fontSize: 30 },
  rocketWindow: {
    position: 'absolute',
    top: 18,
    alignSelf: 'center',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(224,242,254,0.85)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  flameWrap: { marginTop: -2, alignItems: 'center' },
  flame: { width: 28, height: 36, borderBottomLeftRadius: 14, borderBottomRightRadius: 14 },
  holdRing: {
    marginTop: 8,
    width: 120,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', borderRadius: 4 },
  blastText: { color: ROCKET_SHELL.gold, fontSize: 13, fontWeight: '900', marginTop: 6, letterSpacing: 0.5 },
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
