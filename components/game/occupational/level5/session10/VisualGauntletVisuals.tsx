/** Integrated Visual Challenge visuals — OT L5 Session 10 */
import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import type { GauntletBackdropId } from '@/components/game/occupational/level5/session10/visualGauntletThemes';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';

export function GauntletBackdrop({ theme, backdrop }: { theme: Session2ThemeTokens; backdrop: GauntletBackdropId }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...theme.sky]} style={StyleSheet.absoluteFillObject} />
      {backdrop === 'comet' && <CometTrail accent={theme.accent} />}
      {backdrop === 'fortress' && <FortressWalls accent={theme.accent} />}
      {backdrop === 'canyon' && <CanyonLayers accent={theme.accent} />}
      {backdrop === 'storm' && <StormBolts accent={theme.accent} />}
      {backdrop === 'crown' && <CrownArena accent={theme.accent} />}
    </View>
  );
}

function CometTrail({ accent }: { accent: string }) {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <View key={i} style={[styles.cometStreak, { top: `${18 + i * 16}%`, opacity: 0.15 + i * 0.05, backgroundColor: accent }]} />
      ))}
      <Text style={[styles.backdropEmoji, { top: '10%', right: '12%' }]}>☄️</Text>
    </>
  );
}

function FortressWalls({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.wall, { left: 0, borderColor: `${accent}44` }]} />
      <View style={[styles.wall, { right: 0, borderColor: `${accent}33` }]} />
      <Text style={[styles.backdropEmoji, { top: '8%', left: '10%' }]}>🏰</Text>
    </>
  );
}

function CanyonLayers({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.canyonLayer, { bottom: '8%', backgroundColor: `${accent}22` }]} />
      <View style={[styles.canyonLayer, { bottom: '18%', backgroundColor: `${accent}15`, height: 40 }]} />
    </>
  );
}

function StormBolts({ accent }: { accent: string }) {
  return (
    <>
      <Text style={[styles.backdropEmoji, { top: '12%', left: '20%' }]}>⚡</Text>
      <Text style={[styles.backdropEmoji, { top: '20%', right: '18%' }]}>🌩️</Text>
      <View style={[styles.boltLine, { backgroundColor: accent }]} />
    </>
  );
}

function CrownArena({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.crownRing, { borderColor: `${accent}55` }]} />
      <Text style={[styles.backdropEmoji, { top: '10%', alignSelf: 'center' }]}>👑</Text>
      <Text style={[styles.backdropEmoji, { bottom: '12%', left: '15%' }]}>🦅</Text>
      <Text style={[styles.backdropEmoji, { bottom: '12%', right: '15%' }]}>⭐</Text>
    </>
  );
}

export function GauntletOrb({ size, color, emoji, mark }: { size: number; color: string; emoji: string; mark?: string }) {
  return (
    <View style={[styles.orb, { width: size, height: size, borderRadius: size / 2, backgroundColor: color, shadowColor: color }]}>
      <Text style={{ fontSize: size * 0.42 }}>{emoji}</Text>
      {mark ? <Text style={styles.orbMark}>{mark}</Text> : null}
    </View>
  );
}

export function GauntletFlash({ size, color, emoji }: { size: number; color: string; emoji: string }) {
  return (
    <View style={[styles.flash, { width: size, height: size, borderRadius: size / 2, shadowColor: color }]}>
      <LinearGradient colors={[`${color}EE`, color]} style={[styles.flashGrad, { borderRadius: size / 2 }]}>
        <Text style={{ fontSize: size * 0.45 }}>{emoji}</Text>
      </LinearGradient>
    </View>
  );
}

export function GauntletSignal({ type, size }: { type: 'go' | 'stop'; size: number }) {
  const scale = useSharedValue(0.92);
  useEffect(() => {
    scale.value = withRepeat(withSequence(withTiming(1.06, { duration: 350 }), withTiming(0.94, { duration: 350 })), -1, true);
  }, [scale]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const bg = type === 'go' ? '#10B981' : '#EF4444';
  return (
    <Animated.View style={[styles.signal, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }, anim]}>
      <Text style={{ fontSize: size * 0.3 }}>{type === 'go' ? '🟢' : '🔴'}</Text>
      <Text style={styles.signalText}>{type === 'go' ? 'GO' : 'STOP'}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cometStreak: { position: 'absolute', left: '5%', right: '30%', height: 3, borderRadius: 2 },
  backdropEmoji: { position: 'absolute', fontSize: 28, opacity: 0.45 },
  wall: { position: 'absolute', top: '15%', bottom: '15%', width: 14, borderWidth: 2, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.15)' },
  canyonLayer: { position: 'absolute', left: 0, right: 0, height: 60, borderTopLeftRadius: 40, borderTopRightRadius: 40 },
  boltLine: { position: 'absolute', top: '40%', left: '45%', width: 4, height: '15%', borderRadius: 2, opacity: 0.4 },
  crownRing: { position: 'absolute', alignSelf: 'center', top: '32%', width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderStyle: 'dashed' },
  orb: { justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.65)', shadowOpacity: 0.5, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 12 },
  orbMark: { position: 'absolute', top: -6, right: -6, fontSize: 16 },
  flash: { justifyContent: 'center', alignItems: 'center', shadowOpacity: 0.75, shadowRadius: 22, shadowOffset: { width: 0, height: 8 }, elevation: 16 },
  flashGrad: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.7)' },
  signal: { justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.5)', shadowOpacity: 0.4, shadowRadius: 14, elevation: 10 },
  signalText: { color: '#fff', fontWeight: '900', fontSize: 16, marginTop: 2 },
});
