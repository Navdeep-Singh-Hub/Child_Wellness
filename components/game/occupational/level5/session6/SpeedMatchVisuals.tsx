/** Speed Matching visuals — OT L5 Session 6 */
import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import type { SpeedMatchBackdropId } from '@/components/game/occupational/level5/session6/speedMatchThemes';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

export function SpeedMatchBackdrop({
  theme,
  backdrop,
}: {
  theme: Session2ThemeTokens;
  backdrop: SpeedMatchBackdropId;
}) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...theme.sky]} style={StyleSheet.absoluteFillObject} />
      {backdrop === 'stadium' && <StadiumArena accent={theme.accent} />}
      {backdrop === 'meadow' && <MeadowScene />}
      {backdrop === 'turbo' && <TurboLanes accent={theme.accent} />}
      {backdrop === 'clock' && <ClockArena accent={theme.accent} />}
      {backdrop === 'disco' && <DiscoStage accent={theme.accent} />}
    </View>
  );
}

function StadiumArena({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.stadiumLight, { backgroundColor: `${accent}22` }]} />
      <View style={styles.stadiumFloor} />
      {Array.from({ length: 8 }).map((_, i) => (
        <View key={i} style={[styles.speedLine, { top: `${18 + i * 9}%`, opacity: 0.08 + (i % 3) * 0.04 }]} />
      ))}
    </>
  );
}

function MeadowScene() {
  return (
    <>
      <View style={styles.meadowHill} />
      <View style={[styles.meadowHill, { top: '70%', height: '20%', opacity: 0.5 }]} />
      {Array.from({ length: 6 }).map((_, i) => (
        <Text key={i} style={[styles.flower, { left: `${12 + i * 14}%`, top: `${62 + (i % 2) * 8}%` }]}>
          {i % 2 === 0 ? '🌸' : '🌿'}
        </Text>
      ))}
    </>
  );
}

function TurboLanes({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.turboLane, { top: '35%', borderColor: `${accent}55` }]} />
      <View style={[styles.turboLane, { top: '55%', borderColor: `${accent}33` }]} />
      <View style={[styles.speedBadge, { backgroundColor: `${accent}22`, borderColor: accent }]}>
        <Text style={styles.speedBadgeText}>⚡ / 🐢</Text>
      </View>
    </>
  );
}

function ClockArena({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.clockRing, { borderColor: `${accent}55` }]} />
      <View style={[styles.clockHand, { backgroundColor: accent, transform: [{ rotate: '30deg' }] }]} />
      <View style={[styles.clockHand, { backgroundColor: accent, height: 50, transform: [{ rotate: '120deg' }] }]} />
    </>
  );
}

function DiscoStage({ accent }: { accent: string }) {
  return (
    <>
      <View style={styles.discoFloor} />
      {['#EC4899', '#8B5CF6', '#38BDF8', '#FACC15'].map((c, i) => (
        <View key={c} style={[styles.discoTile, { left: `${10 + i * 22}%`, backgroundColor: `${c}44` }]} />
      ))}
      <View style={[styles.equalizer, { borderColor: `${accent}44` }]}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View key={i} style={[styles.eqBar, { height: 12 + (i % 3) * 10, backgroundColor: accent }]} />
        ))}
      </View>
    </>
  );
}

export function GlowingCatchBall({
  size,
  color,
  emoji,
  secondary,
}: {
  size: number;
  color: string;
  emoji: string;
  secondary?: boolean;
}) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.5);

  useEffect(() => {
    const pulseSpeed = secondary ? 1400 : 600;
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: pulseSpeed, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: pulseSpeed, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: pulseSpeed, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.4, { duration: pulseSpeed, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [secondary, scale, glow]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: 0.35 + glow.value * 0.45,
  }));

  const grad = secondary
    ? (['#6EE7B7', color, '#059669'] as const)
    : (['#FCA5A5', color, '#B91C1C'] as const);

  return (
    <Animated.View style={[styles.ballOuter, { width: size, height: size, borderRadius: size / 2, shadowColor: color }, animStyle]}>
      <LinearGradient colors={[...grad]} style={[styles.ballGrad, { borderRadius: size / 2 }]}>
        <Text style={{ fontSize: size * 0.55 }}>{emoji}</Text>
      </LinearGradient>
      <View style={[styles.ballHalo, { width: size + 14, height: size + 14, borderRadius: (size + 14) / 2, borderColor: `${color}66` }]} />
    </Animated.View>
  );
}

export function GlowingTarget({
  size,
  color,
  emoji,
  urgent,
}: {
  size: number;
  color: string;
  emoji: string;
  urgent?: boolean;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(urgent ? 1.15 : 1.08, { duration: urgent ? 350 : 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: urgent ? 350 : 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [urgent, scale]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[styles.targetOuter, { width: size, height: size, borderRadius: size / 2, shadowColor: color }, animStyle]}>
      <LinearGradient colors={[`${color}EE`, color, `${color}CC`]} style={[styles.targetGrad, { borderRadius: size / 2 }]}>
        <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

export function BigCountdown({ value, accent }: { value: number; accent: string }) {
  const scale = useSharedValue(0.8);
  useEffect(() => {
    scale.value = 0.6;
    scale.value = withTiming(1.1, { duration: 200 }, () => {
      scale.value = withTiming(1, { duration: 150 });
    });
  }, [value, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[styles.cdBubble, { borderColor: accent }, style]}>
      <Text style={[styles.cdNum, { color: accent }]}>{value}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stadiumLight: { position: 'absolute', top: 0, left: 0, right: 0, height: '40%' },
  stadiumFloor: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '22%', backgroundColor: 'rgba(0,0,0,0.25)' },
  speedLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: '#fff' },
  meadowHill: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '28%', backgroundColor: 'rgba(34,197,94,0.2)', borderTopLeftRadius: 80, borderTopRightRadius: 80 },
  flower: { position: 'absolute', fontSize: 18 },
  turboLane: { position: 'absolute', left: '6%', right: '6%', height: 3, borderTopWidth: 2, borderStyle: 'dashed' },
  speedBadge: { position: 'absolute', top: 14, right: 16, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1 },
  speedBadgeText: { fontSize: 12, fontWeight: '800' },
  clockRing: { position: 'absolute', alignSelf: 'center', top: '12%', width: 90, height: 90, borderRadius: 45, borderWidth: 3 },
  clockHand: { position: 'absolute', alignSelf: 'center', top: '12%', marginTop: 45, width: 3, height: 32, borderRadius: 2, transformOrigin: 'top' },
  discoFloor: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '25%', backgroundColor: 'rgba(0,0,0,0.3)' },
  discoTile: { position: 'absolute', bottom: '8%', width: 40, height: 40, borderRadius: 6, transform: [{ rotate: '45deg' }] },
  equalizer: { position: 'absolute', top: 12, left: 16, flexDirection: 'row', gap: 4, padding: 8, borderRadius: 10, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  eqBar: { width: 6, borderRadius: 3, opacity: 0.7 },
  ballOuter: { justifyContent: 'center', alignItems: 'center', shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 10 },
  ballGrad: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.55)' },
  ballHalo: { position: 'absolute', borderWidth: 2, backgroundColor: 'transparent' },
  targetOuter: { shadowRadius: 16, shadowOpacity: 0.5, shadowOffset: { width: 0, height: 6 }, elevation: 12 },
  targetGrad: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.65)' },
  cdBubble: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
  cdNum: { fontSize: 52, fontWeight: '900' },
});
