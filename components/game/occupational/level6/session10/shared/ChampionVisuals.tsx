/**
 * Per-game atmospheric backdrops — OT Level 6 Session 10
 */
import type { ChampionBackdropId, ChampionShell } from '@/components/game/occupational/level6/session10/championTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function ChampionBackdrop({ backdrop, shell }: { backdrop: ChampionBackdropId; shell: ChampionShell }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...shell.gradient]} style={StyleSheet.absoluteFillObject} />
      {backdrop === 'emeraldVault' && <EmeraldVaultScene accent={shell.gold} />}
      {backdrop === 'corsairGauntlet' && <CorsairGauntletScene accent={shell.gold} />}
      {backdrop === 'nebulaRun' && <NebulaRunScene accent={shell.sparkleColor} />}
      {backdrop === 'alpineRescue' && <AlpineRescueScene accent={shell.statValue} />}
      {backdrop === 'championGauntlet' && <ChampionGauntletScene accent={shell.gold} />}
    </View>
  );
}

function EmeraldVaultScene({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.jungleFloor, { backgroundColor: `${accent}12` }]} />
      {Array.from({ length: 4 }).map((_, i) => (
        <View key={i} style={[styles.vine, { left: `${10 + i * 22}%`, height: `${20 + (i % 2) * 8}%`, borderColor: `${accent}33` }]} />
      ))}
      <Text style={[styles.ambient, { top: '12%', right: '10%', color: `${accent}88` }]}>💎</Text>
    </>
  );
}

function CorsairGauntletScene({ accent }: { accent: string }) {
  const wave = useSharedValue(0);
  useEffect(() => { wave.value = withRepeat(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }), -1, true); }, [wave]);
  const sail = useAnimatedStyle(() => ({ transform: [{ rotate: `${-5 + wave.value * 10}deg` }] }));
  return (
    <>
      <View style={[styles.sea, { backgroundColor: `${accent}10` }]} />
      <Animated.View style={[styles.sail, { borderColor: `${accent}44` }, sail]} />
      <Text style={[styles.ambient, { top: '14%', left: '12%', color: `${accent}77` }]}>🏴‍☠️</Text>
      <Text style={[styles.ambient, { bottom: '24%', right: '14%', color: `${accent}66` }]}>🪙</Text>
    </>
  );
}

function NebulaRunScene({ accent }: { accent: string }) {
  const streak = useSharedValue(0);
  useEffect(() => { streak.value = withRepeat(withTiming(1, { duration: 4000, easing: Easing.linear }), -1, false); }, [streak]);
  const comet = useAnimatedStyle(() => ({ left: `${-15 + streak.value * 130}%` }));
  return (
    <>
      {Array.from({ length: 14 }).map((_, i) => (
        <View key={i} style={[styles.star, { left: `${(i * 17 + 3) % 94}%`, top: `${(i * 23 + 6) % 78}%`, opacity: 0.12 + (i % 3) * 0.1 }]} />
      ))}
      <Animated.View style={[styles.nebulaStreak, { backgroundColor: accent }, comet]} />
      <Text style={[styles.ambient, { top: '10%', alignSelf: 'center', fontSize: 28, color: `${accent}88` }]}>🚀</Text>
    </>
  );
}

function AlpineRescueScene({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.peak, { borderBottomColor: `${accent}33` }]} />
      <Text style={[styles.ambient, { top: '12%', alignSelf: 'center', fontSize: 26, color: `${accent}88` }]}>⛰️</Text>
      <Text style={[styles.ambient, { bottom: '26%', left: '12%', color: `${accent}66` }]}>🐾</Text>
      <Text style={[styles.ambient, { bottom: '28%', right: '14%', color: `${accent}55` }]}>🐻</Text>
    </>
  );
}

function ChampionGauntletScene({ accent }: { accent: string }) {
  const pulse = useSharedValue(0);
  useEffect(() => { pulse.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }), -1, true); }, [pulse]);
  const glow = useAnimatedStyle(() => ({ opacity: 0.25 + pulse.value * 0.35 }));
  return (
    <>
      <Animated.View style={[styles.trophyGlow, { borderColor: `${accent}55` }, glow]} />
      <Text style={[styles.ambient, { top: '8%', alignSelf: 'center', fontSize: 34, color: `${accent}99` }]}>🏆</Text>
      {Array.from({ length: 5 }).map((_, i) => (
        <View key={i} style={[styles.obstacle, { left: `${12 + i * 16}%`, bottom: `${22 + (i % 2) * 4}%`, backgroundColor: `${accent}22` }]} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  jungleFloor: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%' },
  vine: { position: 'absolute', bottom: '18%', width: 10, borderWidth: 2, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.1)' },
  sea: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '32%' },
  sail: { position: 'absolute', top: '16%', right: '18%', width: 40, height: 50, borderWidth: 2, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.1)' },
  star: { position: 'absolute', width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#FFF' },
  nebulaStreak: { position: 'absolute', top: '30%', width: 50, height: 4, borderRadius: 2, opacity: 0.6 },
  peak: { position: 'absolute', bottom: '22%', alignSelf: 'center', width: 0, height: 0, borderLeftWidth: 80, borderRightWidth: 80, borderBottomWidth: 100, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  trophyGlow: { position: 'absolute', alignSelf: 'center', top: '14%', width: 90, height: 90, borderRadius: 45, borderWidth: 2 },
  obstacle: { position: 'absolute', width: 28, height: 14, borderRadius: 7 },
  ambient: { position: 'absolute', fontSize: 20 },
});
