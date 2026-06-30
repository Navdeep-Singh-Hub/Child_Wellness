/**
 * Per-game atmospheric backdrops — OT Level 6 Session 9
 */
import type { SkyBackdropId, SkyShell } from '@/components/game/occupational/level6/session9/enduranceTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function SkyBackdrop({ backdrop, shell }: { backdrop: SkyBackdropId; shell: SkyShell }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...shell.gradient]} style={StyleSheet.absoluteFillObject} />
      {backdrop === 'powerCitadel' && <PowerCitadelScene accent={shell.gold} />}
      {backdrop === 'skyLane' && <SkyLaneScene accent={shell.statValue} />}
      {backdrop === 'wildlifeSpan' && <WildlifeSpanScene accent={shell.good} />}
      {backdrop === 'stormGrove' && <StormGroveScene accent={shell.good} />}
      {backdrop === 'marblePlaza' && <MarblePlazaScene accent={shell.statValue} />}
    </View>
  );
}

function PowerCitadelScene({ accent }: { accent: string }) {
  const pulse = useSharedValue(0);
  useEffect(() => { pulse.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }), -1, true); }, [pulse]);
  const glow = useAnimatedStyle(() => ({ opacity: 0.2 + pulse.value * 0.3 }));
  return (
    <>
      <View style={[styles.citadel, { borderColor: `${accent}44` }]} />
      <Animated.View style={[styles.powerGlow, { backgroundColor: accent }, glow]} />
      <Text style={[styles.ambient, { top: '10%', alignSelf: 'center', fontSize: 28, color: `${accent}88` }]}>⚡</Text>
    </>
  );
}

function SkyLaneScene({ accent }: { accent: string }) {
  const drift = useSharedValue(0);
  useEffect(() => { drift.value = withRepeat(withTiming(1, { duration: 6000, easing: Easing.linear }), -1, false); }, [drift]);
  const cloud = useAnimatedStyle(() => ({ left: `${-20 + drift.value * 120}%` }));
  return (
    <>
      <Animated.View style={[styles.cloud, { backgroundColor: `${accent}22` }, cloud]} />
      <Text style={[styles.ambient, { top: '14%', right: '12%', color: `${accent}66` }]}>☁️</Text>
      <Text style={[styles.ambient, { top: '12%', alignSelf: 'center', fontSize: 26, color: `${accent}88` }]}>✈️</Text>
    </>
  );
}

function WildlifeSpanScene({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.span, { backgroundColor: `${accent}18` }]} />
      <Text style={[styles.ambient, { bottom: '28%', left: '14%', color: `${accent}77` }]}>🦊</Text>
      <Text style={[styles.ambient, { bottom: '30%', right: '16%', color: `${accent}66` }]}>🐰</Text>
    </>
  );
}

function StormGroveScene({ accent }: { accent: string }) {
  const wind = useSharedValue(0);
  useEffect(() => { wind.value = withRepeat(withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }), -1, true); }, [wind]);
  const leaf = useAnimatedStyle(() => ({ transform: [{ translateX: -10 + wind.value * 20 }] }));
  return (
    <>
      <View style={[styles.groveFloor, { backgroundColor: `${accent}12` }]} />
      <Animated.Text style={[styles.ambient, { top: '12%', left: '15%' }, leaf]}>💨</Animated.Text>
      <Text style={[styles.ambient, { top: '10%', right: '12%', color: `${accent}66` }]}>🌧️</Text>
      <View style={[styles.treeSil, { borderColor: `${accent}33` }]} />
    </>
  );
}

function MarblePlazaScene({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.plaza, { backgroundColor: `${accent}10` }]} />
      <View style={[styles.pillar, { left: '20%', borderColor: `${accent}33` }]} />
      <View style={[styles.pillar, { right: '20%', borderColor: `${accent}33` }]} />
      <Text style={[styles.ambient, { top: '10%', alignSelf: 'center', fontSize: 28, color: `${accent}88` }]}>🗿</Text>
    </>
  );
}

const styles = StyleSheet.create({
  citadel: { position: 'absolute', bottom: '20%', alignSelf: 'center', width: 100, height: 50, borderWidth: 2, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.15)' },
  powerGlow: { position: 'absolute', top: '18%', alignSelf: 'center', width: 50, height: 50, borderRadius: 25 },
  cloud: { position: 'absolute', top: '20%', width: 60, height: 24, borderRadius: 12 },
  span: { position: 'absolute', bottom: '30%', left: '14%', right: '14%', height: '12%', borderRadius: 4 },
  groveFloor: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '28%' },
  treeSil: { position: 'absolute', bottom: '22%', alignSelf: 'center', width: 14, height: '30%', borderWidth: 2, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.1)' },
  plaza: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%' },
  pillar: { position: 'absolute', bottom: '24%', width: 14, height: '28%', borderWidth: 2, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.1)' },
  ambient: { position: 'absolute', fontSize: 20 },
});
