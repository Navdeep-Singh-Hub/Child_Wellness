/**
 * Per-game atmospheric backdrops — OT Level 6 Session 1
 */
import type { PostureBackdropId, PostureShell } from '@/components/game/occupational/level6/session1/superheroTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function PostureBackdrop({ backdrop, shell }: { backdrop: PostureBackdropId; shell: PostureShell }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...shell.gradient]} style={StyleSheet.absoluteFillObject} />
      {backdrop === 'forge' && <ForgeScene accent={shell.gold} />}
      {backdrop === 'palace' && <PalaceScene accent={shell.statValue} />}
      {backdrop === 'marble' && <MarbleScene accent={shell.good} />}
      {backdrop === 'bridge' && <BridgeScene accent={shell.good} />}
      {backdrop === 'nebula' && <NebulaScene accent={shell.statValue} />}
    </View>
  );
}

function ForgeScene({ accent }: { accent: string }) {
  const pulse = useSharedValue(0);
  useEffect(() => { pulse.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }), -1, true); }, [pulse]);
  const glow = useAnimatedStyle(() => ({ opacity: 0.15 + pulse.value * 0.2 }));
  return (
    <>
      <Animated.View style={[styles.forgeCore, { backgroundColor: accent }, glow]} />
      {Array.from({ length: 3 }).map((_, i) => (
        <View key={i} style={[styles.coil, { left: `${15 + i * 30}%`, borderColor: `${accent}44` }]} />
      ))}
      <Text style={[styles.ambient, { top: '12%', left: '8%', color: `${accent}66` }]}>⚡</Text>
      <Text style={[styles.ambient, { top: '18%', right: '10%', color: `${accent}55` }]}>🔥</Text>
    </>
  );
}

function PalaceScene({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.pillar, { left: '8%', borderColor: `${accent}33` }]} />
      <View style={[styles.pillar, { right: '8%', borderColor: `${accent}33` }]} />
      <View style={[styles.crownGlow, { borderColor: `${accent}55` }]} />
      {['✨', '👑', '✨'].map((e, i) => (
        <Text key={i} style={[styles.ambient, { top: `${10 + i * 4}%`, left: `${20 + i * 28}%`, color: `${accent}88` }]}>{e}</Text>
      ))}
    </>
  );
}

function MarbleScene({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.marbleFloor, { backgroundColor: `${accent}12` }]} />
      {Array.from({ length: 4 }).map((_, i) => (
        <View key={i} style={[styles.column, { left: `${10 + i * 22}%`, borderColor: `${accent}28` }]} />
      ))}
      <Text style={[styles.ambient, { bottom: '22%', alignSelf: 'center', color: `${accent}55` }]}>🏛️</Text>
    </>
  );
}

function BridgeScene({ accent }: { accent: string }) {
  const blink = useSharedValue(0);
  useEffect(() => { blink.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true); }, [blink]);
  const light = useAnimatedStyle(() => ({ opacity: 0.4 + blink.value * 0.6 }));
  return (
    <>
      <View style={styles.bridgeDeck} />
      <View style={styles.console}>
        {['🟢', '🟡', '🔴'].map((l, i) => (
          <Animated.View key={i} style={[styles.consoleLight, light, { backgroundColor: i === 0 ? '#22C55E' : i === 1 ? '#EAB308' : '#EF4444' }]} />
        ))}
      </View>
      <View style={[styles.scanLine, { backgroundColor: `${accent}22` }]} />
    </>
  );
}

function NebulaScene({ accent }: { accent: string }) {
  const drift = useSharedValue(0);
  useEffect(() => { drift.value = withRepeat(withTiming(1, { duration: 8000, easing: Easing.linear }), -1, false); }, [drift]);
  const nebula = useAnimatedStyle(() => ({ transform: [{ translateX: drift.value * 20 - 10 }] }));
  return (
    <>
      <Animated.View style={[styles.nebula, { backgroundColor: `${accent}18` }, nebula]} />
      {Array.from({ length: 12 }).map((_, i) => (
        <View key={i} style={[styles.star, { left: `${(i * 17 + 5) % 90}%`, top: `${(i * 23 + 8) % 70}%`, opacity: 0.2 + (i % 3) * 0.15 }]} />
      ))}
      <Text style={[styles.ambient, { top: '14%', right: '12%', fontSize: 28, color: `${accent}77` }]}>🌟</Text>
    </>
  );
}

const styles = StyleSheet.create({
  forgeCore: { position: 'absolute', alignSelf: 'center', top: '8%', width: 80, height: 80, borderRadius: 40 },
  coil: { position: 'absolute', top: '20%', width: 40, height: 40, borderRadius: 20, borderWidth: 2 },
  pillar: { position: 'absolute', top: '10%', bottom: '30%', width: 16, borderWidth: 2, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.04)' },
  crownGlow: { position: 'absolute', alignSelf: 'center', top: '6%', width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderStyle: 'dashed' },
  marbleFloor: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '25%' },
  column: { position: 'absolute', top: '15%', height: '40%', width: 10, borderWidth: 1, borderRadius: 2 },
  bridgeDeck: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '22%', backgroundColor: 'rgba(0,0,0,0.25)' },
  console: { position: 'absolute', top: 12, right: 14, flexDirection: 'row', gap: 6, padding: 8, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.3)' },
  consoleLight: { width: 10, height: 10, borderRadius: 5 },
  scanLine: { position: 'absolute', top: '45%', left: '5%', right: '5%', height: 2 },
  nebula: { position: 'absolute', top: '20%', left: '10%', right: '10%', height: '35%', borderRadius: 40 },
  star: { position: 'absolute', width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#FFF' },
  ambient: { position: 'absolute', fontSize: 20 },
});
