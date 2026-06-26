/** Decorate The Cake overlay — OT L9 S2 Game 1 */
import type { DecorateCakeTheme } from '@/components/game/occupational/level9/session2/pressureTheme';
import { CAKE_SHELL } from '@/components/game/occupational/level9/session2/pressureTheme';
import { CAKE_DECORATION_SLOTS } from '@/components/game/occupational/level9/session2/pressureUtils';
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
  theme: DecorateCakeTheme;
  force: number;
  targetForce: number;
  holdProgress: number;
  strokeProgress: number;
  piping: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  completedRounds: number;
  topping: string;
  leftHand: { x: number; y: number } | null;
  rightHand: { x: number; y: number } | null;
  banner: string;
  quality: number;
};

export function CakeOverlay({
  theme,
  force,
  targetForce,
  holdProgress,
  strokeProgress,
  piping,
  roundActive,
  round,
  totalRounds,
  completedRounds,
  topping,
  leftHand,
  rightHand,
  banner,
  quality,
}: Props) {
  const sprinkleBob = useSharedValue(0);
  const pipeDrip = useSharedValue(0);

  useEffect(() => {
    sprinkleBob.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [sprinkleBob]);

  useEffect(() => {
    if (force > 0.15 && roundActive) {
      pipeDrip.value = withRepeat(
        withSequence(withTiming(1, { duration: 200 }), withTiming(0.3, { duration: 200 })),
        -1,
        true,
      );
    } else {
      pipeDrip.value = withTiming(0, { duration: 150 });
    }
  }, [force, roundActive, pipeDrip]);

  const sprinkleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -4 + sprinkleBob.value * 8 }],
    opacity: 0.3 + sprinkleBob.value * 0.2,
  }));

  const dripStyle = useAnimatedStyle(() => ({
    opacity: pipeDrip.value,
    transform: [{ scaleY: 0.5 + pipeDrip.value * 0.6 }],
  }));

  const pressurePct = Math.round(force * 100);
  const targetPct = Math.round(targetForce * 100);
  const atTarget = force >= targetForce * 0.9;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`sprinkle-${i}`}
          style={[
            styles.decor,
            sprinkleStyle,
            { left: `${6 + (i * 18) % 84}%`, top: `${5 + (i % 3) * 9}%` },
          ]}
        >
          {d}
        </Animated.Text>
      ))}

      {leftHand && (
        <View
          style={[
            styles.handDot,
            { left: `${leftHand.x * 100}%`, top: `${leftHand.y * 100}%`, borderColor: theme.frosting },
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

      {/* Pressure gauge */}
      <View style={styles.gaugeWrap}>
        <Text style={styles.gaugeLabel}>
          PRESSURE {pressurePct}% · GRADE {targetPct}%
        </Text>
        <View style={styles.gaugeTrack}>
          <LinearGradient
            colors={atTarget ? ['#34D399', '#10B981'] : [theme.frosting, theme.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gaugeFill, { width: `${Math.min(100, pressurePct)}%` }]}
          />
          <View style={[styles.targetMark, { left: `${targetPct}%` }]} />
        </View>
        <View style={styles.gaugeRow}>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={styles.roundText}>
            Swirl {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      {/* Cake */}
      <View style={styles.cakeZone}>
        <View style={[styles.cakePlate, { borderColor: theme.chocolate }]}>
          <LinearGradient colors={['#F5F5F4', '#E7E5E4']} style={styles.plateGrad} />
        </View>

        <View style={styles.cakeStack}>
          <LinearGradient colors={[theme.chocolate, '#5C2E0A']} style={styles.cakeTierBottom} />
          <LinearGradient colors={[theme.accentDeep, theme.accent]} style={styles.cakeTierTop}>
            <Text style={styles.cakeEmoji}>🎂</Text>
          </LinearGradient>
        </View>

        {/* Completed decorations */}
        {CAKE_DECORATION_SLOTS.map((s, i) => {
          const done = i < completedRounds;
          const active = i === round && roundActive;
          return (
            <View
              key={i}
              style={[
                styles.toppingSlot,
                {
                  left: `${s.x * 100}%`,
                  top: `${s.y * 100}%`,
                  opacity: done ? 1 : active ? 0.85 : 0.35,
                  transform: [{ scale: done ? 1 : active ? 1.15 : 0.85 }],
                },
              ]}
            >
              {done ? (
                <Text style={styles.toppingDone}>{theme.toppings[i % theme.toppings.length]}</Text>
              ) : active ? (
                <View style={[styles.activeRing, { borderColor: atTarget ? CAKE_SHELL.good : theme.accent }]}>
                  <Text style={styles.toppingPending}>{piping ? topping : '?'}</Text>
                </View>
              ) : (
                <View style={styles.emptySlot} />
              )}
            </View>
          );
        })}

        {/* Piping bag + drip */}
        <Animated.View style={[styles.pipeBag, dripStyle]}>
          <LinearGradient colors={[theme.frosting, theme.accent]} style={styles.bagGrad}>
            <Text style={styles.bagEmoji}>🧁</Text>
          </LinearGradient>
          {(roundActive || piping) && atTarget && (
            <View style={[styles.frostingDrip, { backgroundColor: theme.frosting }]} />
          )}
        </Animated.View>

        {roundActive && atTarget && !piping && (
          <View style={styles.holdRing}>
            <LinearGradient
              colors={[theme.frosting, CAKE_SHELL.good]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.holdFill, { width: `${holdProgress * 100}%` }]}
            />
          </View>
        )}

        {piping && (
          <Text style={styles.pipeText}>PIPING… {Math.round(strokeProgress * 100)}%</Text>
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
  handDot: {
    position: 'absolute',
    width: 30,
    height: 30,
    marginLeft: -15,
    marginTop: -15,
    borderRadius: 10,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  handLabel: { fontSize: 10, fontWeight: '900', color: '#831843' },
  gaugeWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(59,24,16,0.85)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(244,114,182,0.35)',
  },
  gaugeLabel: { color: '#FFFBEB', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  gaugeTrack: {
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginTop: 6,
    overflow: 'visible',
  },
  gaugeFill: { height: '100%', borderRadius: 7 },
  targetMark: {
    position: 'absolute',
    top: -3,
    width: 3,
    height: 20,
    marginLeft: -1,
    backgroundColor: CAKE_SHELL.gold,
    borderRadius: 2,
  },
  gaugeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  qualityText: { color: '#FBCFE8', fontSize: 11, fontWeight: '700' },
  roundText: { color: CAKE_SHELL.gold, fontSize: 11, fontWeight: '800' },
  cakeZone: {
    position: 'absolute',
    bottom: '10%',
    alignSelf: 'center',
    width: 200,
    height: 160,
    alignItems: 'center',
  },
  cakePlate: {
    position: 'absolute',
    bottom: 0,
    width: 170,
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  plateGrad: { flex: 1 },
  cakeStack: { position: 'absolute', bottom: 14, alignItems: 'center' },
  cakeTierBottom: {
    width: 130,
    height: 36,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  cakeTierTop: {
    width: 100,
    height: 52,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    marginTop: -4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cakeEmoji: { fontSize: 22 },
  toppingSlot: {
    position: 'absolute',
    width: 32,
    height: 32,
    marginLeft: -16,
    marginTop: -16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toppingDone: { fontSize: 22 },
  toppingPending: { fontSize: 18 },
  activeRing: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  emptySlot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  pipeBag: { position: 'absolute', top: -8, alignItems: 'center' },
  bagGrad: {
    width: 44,
    height: 52,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bagEmoji: { fontSize: 22 },
  frostingDrip: {
    width: 8,
    height: 18,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    marginTop: -2,
  },
  holdRing: {
    position: 'absolute',
    bottom: -24,
    width: 140,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', borderRadius: 4 },
  pipeText: { position: 'absolute', bottom: -40, color: CAKE_SHELL.gold, fontSize: 13, fontWeight: '900' },
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
