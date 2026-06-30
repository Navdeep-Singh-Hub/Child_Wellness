/**
 * Per-game atmospheric backdrops — OT Level 6 Session 2
 */
import type { StandBackdropId, StandShell } from '@/components/game/occupational/level6/session2/forestTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function StandBackdrop({ backdrop, shell }: { backdrop: StandBackdropId; shell: StandShell }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...shell.gradient]} style={StyleSheet.absoluteFillObject} />
      {backdrop === 'grove' && <GroveScene accent={shell.good} />}
      {backdrop === 'rampart' && <RampartScene accent={shell.gold} />}
      {backdrop === 'plaza' && <PlazaScene accent={shell.good} />}
      {backdrop === 'cloudGarden' && <CloudGardenScene accent={shell.statValue} />}
      {backdrop === 'frostTrail' && <FrostTrailScene accent={shell.statValue} />}
    </View>
  );
}

function GroveScene({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.ground, { backgroundColor: `${accent}18` }]} />
      {Array.from({ length: 5 }).map((_, i) => (
        <View key={i} style={[styles.trunk, { left: `${8 + i * 18}%`, height: `${25 + (i % 3) * 8}%`, borderColor: `${accent}33` }]} />
      ))}
      <Text style={[styles.ambient, { top: '10%', right: '12%', color: `${accent}66` }]}>🌿</Text>
      <Text style={[styles.ambient, { top: '14%', left: '10%', color: `${accent}55` }]}>🐦</Text>
    </>
  );
}

function RampartScene({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.wall, { borderColor: `${accent}44` }]} />
      <View style={[styles.battlement, { left: '5%' }]} /><View style={[styles.battlement, { right: '5%' }]} />
      <Text style={[styles.ambient, { top: '12%', alignSelf: 'center', fontSize: 24, color: `${accent}77` }]}>🏰</Text>
      <View style={[styles.flag, { backgroundColor: accent }]} />
    </>
  );
}

function PlazaScene({ accent }: { accent: string }) {
  const shimmer = useSharedValue(0);
  useEffect(() => { shimmer.value = withRepeat(withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.sin) }), -1, true); }, [shimmer]);
  const glow = useAnimatedStyle(() => ({ opacity: 0.1 + shimmer.value * 0.15 }));
  return (
    <>
      <Animated.View style={[styles.crystal, { borderColor: `${accent}55` }, glow]} />
      <View style={[styles.plazaFloor, { backgroundColor: `${accent}10` }]} />
      {Array.from({ length: 4 }).map((_, i) => (
        <View key={i} style={[styles.crystalShard, { left: `${15 + i * 20}%`, top: `${55 + (i % 2) * 5}%`, backgroundColor: `${accent}22` }]} />
      ))}
    </>
  );
}

function CloudGardenScene({ accent }: { accent: string }) {
  const float = useSharedValue(0);
  useEffect(() => { float.value = withRepeat(withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) }), -1, true); }, [float]);
  const cloud = useAnimatedStyle(() => ({ transform: [{ translateY: -8 + float.value * 16 }] }));
  return (
    <>
      <Animated.Text style={[styles.ambient, { top: '18%', alignSelf: 'center', fontSize: 36 }, cloud]}>☁️</Animated.Text>
      <Text style={[styles.ambient, { top: '12%', left: '15%', color: `${accent}88` }]}>🎈</Text>
      <Text style={[styles.ambient, { top: '10%', right: '18%', color: `${accent}66` }]}>🌸</Text>
      <View style={[styles.gardenBed, { backgroundColor: `${accent}15` }]} />
    </>
  );
}

function FrostTrailScene({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.trail, { backgroundColor: `${accent}12` }]} />
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={[styles.frostMark, { left: `${10 + i * 14}%`, top: `${48 + (i % 2) * 6}%`, opacity: 0.2 + (i % 3) * 0.1 }]} />
      ))}
      <Text style={[styles.ambient, { top: '14%', right: '10%', color: `${accent}77` }]}>❄️</Text>
    </>
  );
}

const styles = StyleSheet.create({
  ground: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '28%' },
  trunk: { position: 'absolute', bottom: '22%', width: 12, borderWidth: 2, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.1)' },
  wall: { position: 'absolute', bottom: '18%', left: '6%', right: '6%', height: '22%', borderWidth: 2, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.15)' },
  battlement: { position: 'absolute', bottom: '38%', width: 40, height: 12, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 2 },
  flag: { position: 'absolute', top: '16%', right: '18%', width: 20, height: 14, borderRadius: 2 },
  crystal: { position: 'absolute', alignSelf: 'center', top: '8%', width: 70, height: 70, borderRadius: 12, borderWidth: 2, transform: [{ rotate: '45deg' }] },
  plazaFloor: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%' },
  crystalShard: { position: 'absolute', width: 16, height: 24, borderRadius: 4 },
  gardenBed: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '25%' },
  trail: { position: 'absolute', bottom: '20%', left: '8%', right: '8%', height: '18%', borderRadius: 20 },
  frostMark: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFF' },
  ambient: { position: 'absolute', fontSize: 20 },
});
