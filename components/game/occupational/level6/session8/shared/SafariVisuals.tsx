/**
 * Per-game atmospheric backdrops — OT Level 6 Session 8
 */
import type { SafariBackdropId, SafariShell } from '@/components/game/occupational/level6/session8/safariTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function SafariBackdrop({ backdrop, shell }: { backdrop: SafariBackdropId; shell: SafariShell }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...shell.gradient]} style={StyleSheet.absoluteFillObject} />
      {backdrop === 'honeyHollow' && <HoneyHollowScene accent={shell.statValue} />}
      {backdrop === 'tidalScuttle' && <TidalScuttleScene accent={shell.statValue} />}
      {backdrop === 'iceFlow' && <IceFlowScene accent={shell.statValue} />}
      {backdrop === 'mossPath' && <MossPathScene accent={shell.good} />}
      {backdrop === 'canopyStomp' && <CanopyStompScene accent={shell.gold} />}
    </View>
  );
}

function HoneyHollowScene({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.forestFloor, { backgroundColor: `${accent}12` }]} />
      {Array.from({ length: 5 }).map((_, i) => (
        <View key={i} style={[styles.trunk, { left: `${8 + i * 18}%`, height: `${24 + (i % 2) * 6}%`, borderColor: `${accent}33` }]} />
      ))}
      <Text style={[styles.ambient, { top: '12%', right: '10%', color: `${accent}77` }]}>🍯</Text>
    </>
  );
}

function TidalScuttleScene({ accent }: { accent: string }) {
  const wave = useSharedValue(0);
  useEffect(() => { wave.value = withRepeat(withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }), -1, true); }, [wave]);
  const crest = useAnimatedStyle(() => ({ transform: [{ translateX: -12 + wave.value * 24 }] }));
  return (
    <>
      <View style={[styles.sand, { backgroundColor: `${accent}10` }]} />
      <Animated.View style={[styles.waveLine, { backgroundColor: `${accent}22` }, crest]} />
      <Text style={[styles.ambient, { top: '14%', left: '10%', color: `${accent}66` }]}>🐚</Text>
      <Text style={[styles.ambient, { bottom: '22%', right: '12%', color: `${accent}55` }]}>🦀</Text>
    </>
  );
}

function IceFlowScene({ accent }: { accent: string }) {
  const drift = useSharedValue(0);
  useEffect(() => { drift.value = withRepeat(withTiming(1, { duration: 5000, easing: Easing.linear }), -1, false); }, [drift]);
  const floe = useAnimatedStyle(() => ({ left: `${-15 + drift.value * 130}%` }));
  return (
    <>
      <View style={[styles.ice, { backgroundColor: `${accent}10` }]} />
      <Animated.View style={[styles.floe, { backgroundColor: `${accent}25` }, floe]} />
      <Text style={[styles.ambient, { top: '12%', alignSelf: 'center', fontSize: 26, color: `${accent}88` }]}>🦭</Text>
      <Text style={[styles.ambient, { bottom: '24%', left: '14%', color: `${accent}55` }]}>🐟</Text>
    </>
  );
}

function MossPathScene({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.mossTrail, { backgroundColor: `${accent}15` }]} />
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={[styles.mossClump, { left: `${(i * 16 + 6) % 88}%`, bottom: `${20 + (i % 2) * 4}%`, backgroundColor: `${accent}22` }]} />
      ))}
      <Text style={[styles.ambient, { top: '10%', right: '12%', color: `${accent}66` }]}>🍃</Text>
    </>
  );
}

function CanopyStompScene({ accent }: { accent: string }) {
  const sway = useSharedValue(0);
  useEffect(() => { sway.value = withRepeat(withTiming(1, { duration: 3500, easing: Easing.inOut(Easing.sin) }), -1, true); }, [sway]);
  const leaf = useAnimatedStyle(() => ({ transform: [{ rotate: `${-6 + sway.value * 12}deg` }] }));
  return (
    <>
      <View style={[styles.canopy, { backgroundColor: `${accent}12` }]} />
      <Animated.Text style={[styles.ambient, { top: '8%', left: '12%', fontSize: 28 }, leaf]}>🌳</Animated.Text>
      <Text style={[styles.ambient, { top: '14%', right: '10%', color: `${accent}77` }]}>🍌</Text>
      <View style={[styles.stompMark, { left: '30%', bottom: '24%', backgroundColor: `${accent}22` }]} />
      <View style={[styles.stompMark, { right: '28%', bottom: '26%', backgroundColor: `${accent}18` }]} />
    </>
  );
}

const styles = StyleSheet.create({
  forestFloor: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%' },
  trunk: { position: 'absolute', bottom: '20%', width: 12, borderWidth: 2, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.1)' },
  sand: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '32%' },
  waveLine: { position: 'absolute', bottom: '20%', left: '8%', right: '8%', height: 8, borderRadius: 4 },
  ice: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '34%' },
  floe: { position: 'absolute', bottom: '28%', width: 80, height: 24, borderRadius: 12 },
  mossTrail: { position: 'absolute', bottom: '18%', left: '10%', right: '10%', height: '14%', borderRadius: 10 },
  mossClump: { position: 'absolute', width: 16, height: 10, borderRadius: 5 },
  canopy: { position: 'absolute', top: 0, left: 0, right: 0, height: '40%' },
  stompMark: { position: 'absolute', width: 20, height: 8, borderRadius: 4 },
  ambient: { position: 'absolute', fontSize: 20 },
});
