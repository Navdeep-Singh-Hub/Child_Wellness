/**
 * Per-game atmospheric backdrops — OT Level 6 Session 7
 */
import type { AuroraBackdropId, AuroraShell } from '@/components/game/occupational/level6/session7/auroraTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function AuroraBackdrop({ backdrop, shell }: { backdrop: AuroraBackdropId; shell: AuroraShell }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...shell.gradient]} style={StyleSheet.absoluteFillObject} />
      {backdrop === 'crimsonGrove' && <CrimsonGroveScene accent={shell.statValue} />}
      {backdrop === 'corsairCache' && <CorsairCacheScene accent={shell.gold} />}
      {backdrop === 'targetSpiral' && <TargetSpiralScene accent={shell.statValue} />}
      {backdrop === 'orbCascade' && <OrbCascadeScene accent={shell.statValue} />}
      {backdrop === 'polarisSweep' && <PolarisSweepScene accent={shell.sparkleColor} />}
    </View>
  );
}

function CrimsonGroveScene({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.ground, { backgroundColor: `${accent}12` }]} />
      {Array.from({ length: 4 }).map((_, i) => (
        <View key={i} style={[styles.tree, { left: `${10 + i * 22}%`, height: `${22 + (i % 2) * 8}%`, borderColor: `${accent}33` }]} />
      ))}
      <Text style={[styles.ambient, { top: '12%', right: '10%', color: `${accent}77` }]}>🍎</Text>
    </>
  );
}

function CorsairCacheScene({ accent }: { accent: string }) {
  const shimmer = useSharedValue(0);
  useEffect(() => { shimmer.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }), -1, true); }, [shimmer]);
  const glow = useAnimatedStyle(() => ({ opacity: 0.2 + shimmer.value * 0.25 }));
  return (
    <>
      <View style={[styles.chest, { borderColor: `${accent}55` }]} />
      <Animated.View style={[styles.treasureGlow, { backgroundColor: accent }, glow]} />
      <Text style={[styles.ambient, { top: '14%', left: '12%', color: `${accent}77` }]}>🏴‍☠️</Text>
      <Text style={[styles.ambient, { bottom: '24%', right: '14%', color: `${accent}66` }]}>💎</Text>
    </>
  );
}

function TargetSpiralScene({ accent }: { accent: string }) {
  const spin = useSharedValue(0);
  useEffect(() => { spin.value = withRepeat(withTiming(1, { duration: 8000, easing: Easing.linear }), -1, false); }, [spin]);
  const ring = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));
  return (
    <>
      <Animated.View style={[styles.spiral, { borderColor: `${accent}44` }, ring]} />
      <View style={[styles.spiralInner, { borderColor: `${accent}33` }]} />
      <Text style={[styles.ambient, { top: '12%', alignSelf: 'center', fontSize: 26, color: `${accent}88` }]}>🎯</Text>
    </>
  );
}

function OrbCascadeScene({ accent }: { accent: string }) {
  const fall = useSharedValue(0);
  useEffect(() => { fall.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.linear }), -1, false); }, [fall]);
  const orb = useAnimatedStyle(() => ({ top: `${10 + fall.value * 60}%` }));
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={[styles.orbDot, { left: `${(i * 17 + 8) % 88}%`, top: `${(i * 29 + 15) % 70}%`, backgroundColor: `${accent}33` }]} />
      ))}
      <Animated.View style={[styles.orbMain, { backgroundColor: accent }, orb]} />
      <Text style={[styles.ambient, { top: '10%', right: '12%', color: `${accent}77` }]}>🔮</Text>
    </>
  );
}

function PolarisSweepScene({ accent }: { accent: string }) {
  const sweep = useSharedValue(0);
  useEffect(() => { sweep.value = withRepeat(withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) }), -1, true); }, [sweep]);
  const band = useAnimatedStyle(() => ({ opacity: 0.15 + sweep.value * 0.2, transform: [{ rotate: `${-15 + sweep.value * 30}deg` }] }));
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <View key={i} style={[styles.starDot, { left: `${(i * 19 + 4) % 92}%`, top: `${(i * 23 + 8) % 75}%`, opacity: 0.15 + (i % 3) * 0.12 }]} />
      ))}
      <Animated.View style={[styles.auroraBand, { backgroundColor: accent }, band]} />
      <Text style={[styles.ambient, { top: '10%', alignSelf: 'center', fontSize: 28, color: `${accent}88` }]}>⭐</Text>
    </>
  );
}

const styles = StyleSheet.create({
  ground: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '28%' },
  tree: { position: 'absolute', bottom: '20%', width: 10, borderWidth: 2, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.1)' },
  chest: { position: 'absolute', bottom: '22%', alignSelf: 'center', width: 56, height: 36, borderWidth: 2, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.15)' },
  treasureGlow: { position: 'absolute', bottom: '30%', alignSelf: 'center', width: 40, height: 40, borderRadius: 20 },
  spiral: { position: 'absolute', alignSelf: 'center', top: '18%', width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderStyle: 'dashed' },
  spiralInner: { position: 'absolute', alignSelf: 'center', top: '28%', width: 60, height: 60, borderRadius: 30, borderWidth: 2 },
  orbDot: { position: 'absolute', width: 10, height: 10, borderRadius: 5 },
  orbMain: { position: 'absolute', alignSelf: 'center', width: 24, height: 24, borderRadius: 12, opacity: 0.7 },
  starDot: { position: 'absolute', width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#FFF' },
  auroraBand: { position: 'absolute', top: '20%', left: '-10%', right: '-10%', height: 40, borderRadius: 20, opacity: 0.2 },
  ambient: { position: 'absolute', fontSize: 20 },
});
