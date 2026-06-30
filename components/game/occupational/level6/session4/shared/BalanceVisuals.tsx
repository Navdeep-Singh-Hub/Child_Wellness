/**
 * Per-game atmospheric backdrops — OT Level 6 Session 4
 */
import type { BalanceBackdropId, BalanceShell } from '@/components/game/occupational/level6/session4/lagoonTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function BalanceBackdrop({ backdrop, shell }: { backdrop: BalanceBackdropId; shell: BalanceShell }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...shell.gradient]} style={StyleSheet.absoluteFillObject} />
      {backdrop === 'coralReef' && <CoralReefScene accent={shell.statValue} />}
      {backdrop === 'driftIsles' && <DriftIslesScene accent={shell.statValue} />}
      {backdrop === 'tideTemple' && <TideTempleScene accent={shell.gold} />}
      {backdrop === 'starPier' && <StarPierScene accent={shell.statValue} />}
      {backdrop === 'waveSentinel' && <WaveSentinelScene accent={shell.good} />}
    </View>
  );
}

function CoralReefScene({ accent }: { accent: string }) {
  const sway = useSharedValue(0);
  useEffect(() => { sway.value = withRepeat(withTiming(1, { duration: 3500, easing: Easing.inOut(Easing.sin) }), -1, true); }, [sway]);
  const weed = useAnimatedStyle(() => ({ transform: [{ rotate: `${-4 + sway.value * 8}deg` }] }));
  return (
    <>
      <View style={[styles.shallow, { backgroundColor: `${accent}12` }]} />
      {Array.from({ length: 5 }).map((_, i) => (
        <Animated.View key={i} style={[styles.coral, { left: `${8 + i * 18}%`, height: `${18 + (i % 3) * 6}%`, backgroundColor: `${accent}22` }, i % 2 === 0 ? weed : undefined]} />
      ))}
      <Text style={[styles.ambient, { top: '12%', right: '10%', color: `${accent}77` }]}>🪸</Text>
      <Text style={[styles.ambient, { bottom: '20%', left: '12%', color: `${accent}66` }]}>🐟</Text>
    </>
  );
}

function DriftIslesScene({ accent }: { accent: string }) {
  const bob = useSharedValue(0);
  useEffect(() => { bob.value = withRepeat(withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }), -1, true); }, [bob]);
  const island = useAnimatedStyle(() => ({ transform: [{ translateY: -4 + bob.value * 8 }] }));
  return (
    <>
      <View style={[styles.water, { backgroundColor: `${accent}10` }]} />
      {Array.from({ length: 3 }).map((_, i) => (
        <Animated.View key={i} style={[styles.isle, { left: `${12 + i * 28}%`, backgroundColor: `${accent}28` }, island]} />
      ))}
      <Text style={[styles.ambient, { top: '14%', left: '8%', color: `${accent}55` }]}>🌴</Text>
      <Text style={[styles.ambient, { top: '10%', right: '12%', color: `${accent}44` }]}>⛵</Text>
    </>
  );
}

function TideTempleScene({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.templeBase, { borderColor: `${accent}44` }]} />
      <View style={[styles.templePillar, { left: '22%', borderColor: `${accent}33` }]} />
      <View style={[styles.templePillar, { right: '22%', borderColor: `${accent}33` }]} />
      <Text style={[styles.ambient, { top: '10%', alignSelf: 'center', fontSize: 28, color: `${accent}88` }]}>🏛️</Text>
      <View style={[styles.tideLine, { backgroundColor: `${accent}22` }]} />
    </>
  );
}

function StarPierScene({ accent }: { accent: string }) {
  const twinkle = useSharedValue(0);
  useEffect(() => { twinkle.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }), -1, true); }, [twinkle]);
  const glow = useAnimatedStyle(() => ({ opacity: 0.3 + twinkle.value * 0.5 }));
  return (
    <>
      <View style={[styles.pier, { backgroundColor: `${accent}18` }]} />
      <Animated.Text style={[styles.ambient, { top: '8%', alignSelf: 'center', fontSize: 32 }, glow]}>🌙</Animated.Text>
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={[styles.starDot, { left: `${(i * 17 + 8) % 88}%`, top: `${(i * 23 + 12) % 55}%`, opacity: 0.2 + (i % 3) * 0.15 }]} />
      ))}
    </>
  );
}

function WaveSentinelScene({ accent }: { accent: string }) {
  const wave = useSharedValue(0);
  useEffect(() => { wave.value = withRepeat(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }), -1, true); }, [wave]);
  const crest = useAnimatedStyle(() => ({ transform: [{ translateX: -20 + wave.value * 40 }] }));
  return (
    <>
      <View style={[styles.shore, { backgroundColor: `${accent}12` }]} />
      <Animated.View style={[styles.waveCrest, { backgroundColor: `${accent}25` }, crest]} />
      <Text style={[styles.ambient, { top: '12%', right: '14%', color: `${accent}77` }]}>🛡️</Text>
      <Text style={[styles.ambient, { bottom: '22%', left: '10%', color: `${accent}55` }]}>🌊</Text>
    </>
  );
}

const styles = StyleSheet.create({
  shallow: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '32%' },
  coral: { position: 'absolute', bottom: '18%', width: 14, borderRadius: 6 },
  water: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '38%' },
  isle: { position: 'absolute', bottom: '28%', width: 56, height: 28, borderRadius: 14 },
  templeBase: { position: 'absolute', bottom: '16%', left: '18%', right: '18%', height: '28%', borderWidth: 2, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.12)' },
  templePillar: { position: 'absolute', bottom: '22%', width: 16, height: '32%', borderWidth: 2, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.1)' },
  tideLine: { position: 'absolute', bottom: '14%', left: 0, right: 0, height: 4 },
  pier: { position: 'absolute', bottom: '20%', left: '15%', right: '15%', height: '14%', borderRadius: 4 },
  starDot: { position: 'absolute', width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#FFF' },
  shore: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%' },
  waveCrest: { position: 'absolute', bottom: '24%', left: '10%', right: '10%', height: 12, borderRadius: 6 },
  ambient: { position: 'absolute', fontSize: 20 },
});
