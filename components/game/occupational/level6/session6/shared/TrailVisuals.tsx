/**
 * Per-game atmospheric backdrops — OT Level 6 Session 6
 */
import type { TrailBackdropId, TrailShell } from '@/components/game/occupational/level6/session6/trailTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function TrailBackdrop({ backdrop, shell }: { backdrop: TrailBackdropId; shell: TrailShell }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...shell.gradient]} style={StyleSheet.absoluteFillObject} />
      {backdrop === 'boulderFord' && <BoulderFordScene accent={shell.statValue} />}
      {backdrop === 'castleSpan' && <CastleSpanScene accent={shell.gold} />}
      {backdrop === 'frogLeapRapids' && <FrogLeapRapidsScene accent={shell.statValue} />}
      {backdrop === 'compassPath' && <CompassPathScene accent={shell.good} />}
      {backdrop === 'summitQuest' && <SummitQuestScene accent={shell.statValue} />}
    </View>
  );
}

function BoulderFordScene({ accent }: { accent: string }) {
  const ripple = useSharedValue(0);
  useEffect(() => { ripple.value = withRepeat(withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }), -1, true); }, [ripple]);
  const wave = useAnimatedStyle(() => ({ transform: [{ translateX: -10 + ripple.value * 20 }] }));
  return (
    <>
      <View style={[styles.river, { backgroundColor: `${accent}12` }]} />
      <Animated.View style={[styles.ripple, { backgroundColor: `${accent}22` }, wave]} />
      {Array.from({ length: 4 }).map((_, i) => (
        <View key={i} style={[styles.boulder, { left: `${12 + i * 20}%`, bottom: `${28 + (i % 2) * 4}%`, backgroundColor: `${accent}28` }]} />
      ))}
    </>
  );
}

function CastleSpanScene({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.span, { backgroundColor: `${accent}18` }]} />
      <Text style={[styles.ambient, { top: '10%', alignSelf: 'center', fontSize: 28, color: `${accent}88` }]}>🏰</Text>
      <View style={[styles.towerL, { borderColor: `${accent}44` }]} />
      <View style={[styles.towerR, { borderColor: `${accent}44` }]} />
    </>
  );
}

function FrogLeapRapidsScene({ accent }: { accent: string }) {
  const hop = useSharedValue(0);
  useEffect(() => { hop.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }), -1, true); }, [hop]);
  const frog = useAnimatedStyle(() => ({ transform: [{ translateY: -6 + hop.value * 12 }] }));
  return (
    <>
      <View style={[styles.rapids, { backgroundColor: `${accent}10` }]} />
      {Array.from({ length: 3 }).map((_, i) => (
        <View key={i} style={[styles.lily, { left: `${15 + i * 28}%`, bottom: `${30 + (i % 2) * 3}%`, backgroundColor: `${accent}25` }]} />
      ))}
      <Animated.Text style={[styles.ambient, { bottom: '32%', alignSelf: 'center', fontSize: 24 }, frog]}>🐸</Animated.Text>
    </>
  );
}

function CompassPathScene({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.path, { backgroundColor: `${accent}12` }]} />
      {Array.from({ length: 5 }).map((_, i) => (
        <View key={i} style={[styles.arrow, { left: `${10 + i * 18}%`, top: `${50 + (i % 2) * 5}%`, borderBottomColor: `${accent}55` }]} />
      ))}
      <Text style={[styles.ambient, { top: '12%', right: '12%', color: `${accent}77` }]}>🧭</Text>
      <Text style={[styles.ambient, { top: '14%', left: '10%', color: `${accent}55` }]}>🌲</Text>
    </>
  );
}

function SummitQuestScene({ accent }: { accent: string }) {
  const glow = useSharedValue(0);
  useEffect(() => { glow.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true); }, [glow]);
  const peak = useAnimatedStyle(() => ({ opacity: 0.5 + glow.value * 0.4 }));
  return (
    <>
      <View style={[styles.mountain, { borderBottomColor: `${accent}33` }]} />
      <Animated.Text style={[styles.ambient, { top: '8%', alignSelf: 'center', fontSize: 32 }, peak]}>🏆</Animated.Text>
      <Text style={[styles.ambient, { top: '16%', right: '10%', color: `${accent}66` }]}>⛰️</Text>
    </>
  );
}

const styles = StyleSheet.create({
  river: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '34%' },
  ripple: { position: 'absolute', bottom: '18%', left: '10%', right: '10%', height: 8, borderRadius: 4 },
  boulder: { position: 'absolute', width: 40, height: 22, borderRadius: 11 },
  span: { position: 'absolute', bottom: '30%', left: '14%', right: '14%', height: '12%', borderRadius: 4 },
  towerL: { position: 'absolute', bottom: '38%', left: '18%', width: 20, height: 40, borderWidth: 2, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.1)' },
  towerR: { position: 'absolute', bottom: '38%', right: '18%', width: 20, height: 40, borderWidth: 2, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.1)' },
  rapids: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '32%' },
  lily: { position: 'absolute', width: 44, height: 20, borderRadius: 10 },
  path: { position: 'absolute', bottom: '18%', left: '8%', right: '8%', height: '16%', borderRadius: 12 },
  arrow: { position: 'absolute', width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderBottomWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  mountain: { position: 'absolute', bottom: '20%', alignSelf: 'center', width: 0, height: 0, borderLeftWidth: 70, borderRightWidth: 70, borderBottomWidth: 90, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  ambient: { position: 'absolute', fontSize: 20 },
});
