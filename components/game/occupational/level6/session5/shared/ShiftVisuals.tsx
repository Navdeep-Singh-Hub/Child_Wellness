/**
 * Per-game atmospheric backdrops — OT Level 6 Session 5
 */
import type { ShiftBackdropId, ShiftShell } from '@/components/game/occupational/level6/session5/adventureTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function ShiftBackdrop({ backdrop, shell }: { backdrop: ShiftBackdropId; shell: ShiftShell }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...shell.gradient]} style={StyleSheet.absoluteFillObject} />
      {backdrop === 'orchardSlope' && <OrchardSlopeScene accent={shell.statValue} />}
      {backdrop === 'starfallMeadow' && <StarfallMeadowScene accent={shell.statValue} />}
      {backdrop === 'captainsCove' && <CaptainsCoveScene accent={shell.gold} />}
      {backdrop === 'moonlitCrossing' && <MoonlitCrossingScene accent={shell.statValue} />}
      {backdrop === 'alchemistsPan' && <AlchemistsPanScene accent={shell.statValue} />}
    </View>
  );
}

function OrchardSlopeScene({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.slope, { backgroundColor: `${accent}15` }]} />
      {Array.from({ length: 4 }).map((_, i) => (
        <View key={i} style={[styles.tree, { left: `${10 + i * 22}%`, height: `${20 + (i % 2) * 8}%`, borderColor: `${accent}33` }]} />
      ))}
      <Text style={[styles.ambient, { top: '14%', right: '12%', color: `${accent}77` }]}>🍎</Text>
      <Text style={[styles.ambient, { bottom: '24%', left: '10%', color: `${accent}55` }]}>🧺</Text>
    </>
  );
}

function StarfallMeadowScene({ accent }: { accent: string }) {
  const fall = useSharedValue(0);
  useEffect(() => { fall.value = withRepeat(withTiming(1, { duration: 2800, easing: Easing.linear }), -1, false); }, [fall]);
  const star = useAnimatedStyle(() => ({ top: `${8 + fall.value * 55}%` }));
  return (
    <>
      <View style={[styles.meadow, { backgroundColor: `${accent}12` }]} />
      <Animated.Text style={[styles.ambient, { alignSelf: 'center', fontSize: 22, color: `${accent}88` }, star]}>⭐</Animated.Text>
      {Array.from({ length: 5 }).map((_, i) => (
        <View key={i} style={[styles.flower, { left: `${(i * 19 + 6) % 90}%`, bottom: `${18 + (i % 2) * 4}%`, backgroundColor: `${accent}22` }]} />
      ))}
    </>
  );
}

function CaptainsCoveScene({ accent }: { accent: string }) {
  const wave = useSharedValue(0);
  useEffect(() => { wave.value = withRepeat(withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }), -1, true); }, [wave]);
  const crest = useAnimatedStyle(() => ({ transform: [{ translateX: -15 + wave.value * 30 }] }));
  return (
    <>
      <View style={[styles.coveWater, { backgroundColor: `${accent}10` }]} />
      <Animated.View style={[styles.coveWave, { backgroundColor: `${accent}20` }, crest]} />
      <Text style={[styles.ambient, { top: '12%', left: '10%', color: `${accent}77` }]}>🏴‍☠️</Text>
      <Text style={[styles.ambient, { bottom: '26%', right: '14%', color: `${accent}66` }]}>💎</Text>
    </>
  );
}

function MoonlitCrossingScene({ accent }: { accent: string }) {
  const glow = useSharedValue(0);
  useEffect(() => { glow.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }), -1, true); }, [glow]);
  const moon = useAnimatedStyle(() => ({ opacity: 0.4 + glow.value * 0.4 }));
  return (
    <>
      <Animated.Text style={[styles.ambient, { top: '8%', alignSelf: 'center', fontSize: 30 }, moon]}>🌙</Animated.Text>
      <View style={[styles.bridgeSpan, { backgroundColor: `${accent}18` }]} />
      {Array.from({ length: 4 }).map((_, i) => (
        <View key={i} style={[styles.stone, { left: `${18 + i * 18}%`, bottom: `${30 + (i % 2) * 3}%`, backgroundColor: `${accent}28` }]} />
      ))}
    </>
  );
}

function AlchemistsPanScene({ accent }: { accent: string }) {
  const shimmer = useSharedValue(0);
  useEffect(() => { shimmer.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }), -1, true); }, [shimmer]);
  const pulse = useAnimatedStyle(() => ({ opacity: 0.15 + shimmer.value * 0.2 }));
  return (
    <>
      <Animated.View style={[styles.panGlow, { borderColor: `${accent}55` }, pulse]} />
      <Text style={[styles.ambient, { top: '14%', alignSelf: 'center', fontSize: 28, color: `${accent}88` }]}>⚖️</Text>
      {Array.from({ length: 3 }).map((_, i) => (
        <View key={i} style={[styles.potion, { left: `${20 + i * 24}%`, bottom: '22%', backgroundColor: `${accent}22` }]} />
      ))}
      <Text style={[styles.ambient, { top: '10%', right: '12%', color: `${accent}66` }]}>🔮</Text>
    </>
  );
}

const styles = StyleSheet.create({
  slope: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', transform: [{ skewY: '-3deg' }] },
  tree: { position: 'absolute', bottom: '20%', width: 10, borderWidth: 2, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.1)' },
  meadow: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '28%' },
  flower: { position: 'absolute', width: 10, height: 10, borderRadius: 5 },
  coveWater: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '36%' },
  coveWave: { position: 'absolute', bottom: '22%', left: '8%', right: '8%', height: 10, borderRadius: 5 },
  bridgeSpan: { position: 'absolute', bottom: '32%', left: '12%', right: '12%', height: '10%', borderRadius: 4 },
  stone: { position: 'absolute', width: 36, height: 18, borderRadius: 9 },
  panGlow: { position: 'absolute', alignSelf: 'center', top: '20%', width: 90, height: 90, borderRadius: 45, borderWidth: 2 },
  potion: { position: 'absolute', width: 14, height: 22, borderRadius: 4 },
  ambient: { position: 'absolute', fontSize: 20 },
});
