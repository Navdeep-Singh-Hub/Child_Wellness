/** Visual Focus backdrops — OT L5 Session 4 */
import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import type { VisualFocusBackdropId } from '@/components/game/occupational/level5/session4/visualFocusThemes';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function VisualFocusBackdrop({ theme, backdrop }: { theme: Session2ThemeTokens; backdrop: VisualFocusBackdropId }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...theme.sky]} style={StyleSheet.absoluteFillObject} />
      {backdrop === 'starry' && <StarryField />}
      {backdrop === 'nebula' && <NebulaField />}
      {backdrop === 'spotlight' && <SpotlightStage />}
      {backdrop === 'detective' && <DetectiveDesk />}
      {backdrop === 'prism' && <PrismLab />}
    </View>
  );
}

function StarryField() {
  return (
    <>
      {Array.from({ length: 30 }).map((_, i) => (
        <TwinkleStar key={i} left={`${(i * 13) % 100}%`} top={`${(i * 19) % 90}%`} delay={i * 120} />
      ))}
      <View style={styles.horizonGlow} />
    </>
  );
}

function TwinkleStar({ left, top, delay }: { left: string; top: string; delay: number }) {
  const op = useSharedValue(0.3);
  useEffect(() => {
    const t = setTimeout(() => {
      op.value = withRepeat(withTiming(1, { duration: 900 + delay, easing: Easing.inOut(Easing.sin) }), -1, true);
    }, delay);
    return () => clearTimeout(t);
  }, [delay, op]);
  const style = useAnimatedStyle(() => ({ opacity: op.value }));
  return <Animated.View style={[{ position: 'absolute', left, top, width: 3, height: 3, borderRadius: 2, backgroundColor: '#FEF9C3' }, style]} />;
}

function NebulaField() {
  return (
    <>
      <View style={[styles.nebula, { top: '20%', left: '10%' }]} />
      <View style={[styles.nebula, { top: '55%', right: '8%', width: 120, height: 120, backgroundColor: 'rgba(236,72,153,0.12)' }]} />
      {Array.from({ length: 12 }).map((_, i) => (
        <View key={i} style={[styles.spark, { left: `${(i * 23) % 95}%`, top: `${(i * 31) % 85}%` }]} />
      ))}
    </>
  );
}

function SpotlightStage() {
  return (
    <>
      <View style={styles.stageFloor} />
      <View style={styles.spotlightBeam} />
      <View style={styles.spotlightCircle} />
    </>
  );
}

function DetectiveDesk() {
  return (
    <>
      <View style={styles.desk} />
      <View style={styles.lampGlow} />
      <View style={styles.corkBoard} />
    </>
  );
}

function PrismLab() {
  return (
    <>
      <View style={styles.prismBar} />
      {['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6'].map((c, i) => (
        <View key={c} style={[styles.prismStripe, { backgroundColor: c, left: 16 + i * 14, opacity: 0.35 }]} />
      ))}
    </>
  );
}

export function ThemedObjectTile({
  children,
  size,
  highlight,
  accentColor,
  dimmed,
}: {
  children: React.ReactNode;
  size: number;
  highlight?: boolean;
  accentColor?: string;
  dimmed?: boolean;
}) {
  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: highlight ? accentColor ?? '#FBBF24' : 'rgba(255,255,255,0.55)',
          borderWidth: highlight ? 3 : 2,
          backgroundColor: highlight ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.88)',
          opacity: dimmed ? 0.65 : 1,
          shadowColor: highlight ? accentColor ?? '#FBBF24' : '#000',
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  horizonGlow: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '25%', backgroundColor: 'rgba(79,70,229,0.2)' },
  nebula: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(139,92,246,0.18)' },
  spark: { position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.5)' },
  stageFloor: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', backgroundColor: 'rgba(0,0,0,0.35)' },
  spotlightBeam: { position: 'absolute', top: 0, alignSelf: 'center', width: 120, height: '55%', backgroundColor: 'rgba(255,255,255,0.06)', transform: [{ skewX: '-12deg' }] },
  spotlightCircle: { position: 'absolute', bottom: '22%', alignSelf: 'center', width: 200, height: 40, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.08)' },
  desk: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '28%', backgroundColor: 'rgba(66,32,6,0.55)' },
  lampGlow: { position: 'absolute', top: 40, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(250,204,21,0.15)' },
  corkBoard: { position: 'absolute', top: '15%', left: 16, width: 70, height: 50, backgroundColor: 'rgba(180,83,9,0.35)', borderRadius: 4 },
  prismBar: { position: 'absolute', top: 12, left: 16, right: 16, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)' },
  prismStripe: { position: 'absolute', top: 12, width: 10, height: 8, borderRadius: 2 },
  tile: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
