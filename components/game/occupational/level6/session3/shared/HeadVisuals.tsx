/**
 * Per-game atmospheric backdrops — OT Level 6 Session 3
 */
import type { HeadBackdropId, HeadShell } from '@/components/game/occupational/level6/session3/spaceTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function HeadBackdrop({ backdrop, shell }: { backdrop: HeadBackdropId; shell: HeadShell }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...shell.gradient]} style={StyleSheet.absoluteFillObject} />
      {backdrop === 'launchPad' && <LaunchPadScene accent={shell.statValue} />}
      {backdrop === 'sentinel' && <SentinelScene accent={shell.gold} />}
      {backdrop === 'horizon' && <HorizonScene accent={shell.good} />}
      {backdrop === 'royalOrbit' && <RoyalOrbitScene accent={shell.statValue} />}
      {backdrop === 'cometLane' && <CometLaneScene accent={shell.statValue} />}
    </View>
  );
}

function LaunchPadScene({ accent }: { accent: string }) {
  const pulse = useSharedValue(0);
  useEffect(() => { pulse.value = withRepeat(withTiming(1, { duration: 1800 }), -1, true); }, [pulse]);
  const glow = useAnimatedStyle(() => ({ opacity: 0.2 + pulse.value * 0.25 }));
  return (
    <>
      <View style={[styles.pad, { borderColor: `${accent}44` }]} />
      <Animated.View style={[styles.launchGlow, { backgroundColor: accent }, glow]} />
      <Text style={[styles.ambient, { bottom: '24%', alignSelf: 'center', fontSize: 28, color: `${accent}88` }]}>🚀</Text>
    </>
  );
}

function SentinelScene({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.tower, { borderColor: `${accent}44` }]} />
      <View style={[styles.towerTop, { backgroundColor: `${accent}33` }]} />
      <Text style={[styles.ambient, { top: '14%', right: '14%', color: `${accent}77` }]}>🔭</Text>
    </>
  );
}

function HorizonScene({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.skyBand, { backgroundColor: `${accent}15` }]} />
      <View style={[styles.groundBand, { backgroundColor: `${accent}22` }]} />
      <Text style={[styles.ambient, { top: '16%', left: '12%', color: `${accent}66` }]}>☁️</Text>
      <Text style={[styles.ambient, { bottom: '22%', right: '14%', color: `${accent}55` }]}>🌸</Text>
    </>
  );
}

function RoyalOrbitScene({ accent }: { accent: string }) {
  const spin = useSharedValue(0);
  useEffect(() => { spin.value = withRepeat(withTiming(1, { duration: 12000, easing: Easing.linear }), -1, false); }, [spin]);
  const ring = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));
  return (
    <>
      <Animated.View style={[styles.orbitRing, { borderColor: `${accent}44` }, ring]} />
      <Text style={[styles.ambient, { top: '12%', alignSelf: 'center', fontSize: 26, color: `${accent}88` }]}>👑</Text>
    </>
  );
}

function CometLaneScene({ accent }: { accent: string }) {
  const streak = useSharedValue(0);
  useEffect(() => { streak.value = withRepeat(withTiming(1, { duration: 3000, easing: Easing.linear }), -1, false); }, [streak]);
  const trail = useAnimatedStyle(() => ({ left: `${-20 + streak.value * 120}%` }));
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <View key={i} style={[styles.star, { left: `${(i * 19 + 4) % 92}%`, top: `${(i * 27 + 10) % 65}%`, opacity: 0.15 + (i % 3) * 0.12 }]} />
      ))}
      <Animated.View style={[styles.comet, { backgroundColor: accent }, trail]} />
      <Text style={[styles.ambient, { top: '18%', right: '10%', color: `${accent}77` }]}>✨</Text>
    </>
  );
}

const styles = StyleSheet.create({
  pad: { position: 'absolute', bottom: '18%', left: '20%', right: '20%', height: '12%', borderWidth: 2, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.2)' },
  launchGlow: { position: 'absolute', bottom: '28%', alignSelf: 'center', width: 60, height: 60, borderRadius: 30 },
  tower: { position: 'absolute', bottom: '15%', alignSelf: 'center', width: 50, height: '35%', borderWidth: 2, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.15)' },
  towerTop: { position: 'absolute', bottom: '48%', alignSelf: 'center', width: 70, height: 16, borderRadius: 4 },
  skyBand: { position: 'absolute', top: 0, left: 0, right: 0, height: '45%' },
  groundBand: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%' },
  orbitRing: { position: 'absolute', alignSelf: 'center', top: '22%', width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderStyle: 'dashed' },
  star: { position: 'absolute', width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#FFF' },
  comet: { position: 'absolute', top: '35%', width: 40, height: 3, borderRadius: 2, opacity: 0.6 },
  ambient: { position: 'absolute', fontSize: 20 },
});
