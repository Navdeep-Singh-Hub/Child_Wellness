/** Bubble Garden visuals — OT L5 S2 Game 1 */
import { FRAGMENT_COLORS, POP_BUBBLE_THEME as T } from '@/components/game/occupational/level5/session2/popBubble/popBubbleTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

export function BubbleGardenBackdrop() {
  const clouds = [
    { left: '8%', top: '12%', w: 70 },
    { left: '55%', top: '8%', w: 90 },
    { left: '72%', top: '18%', w: 55 },
  ];
  const ambients = [
    { left: '15%', top: '55%', s: 28, d: 0 },
    { left: '78%', top: '62%', s: 22, d: 400 },
    { left: '42%', top: '72%', s: 18, d: 800 },
    { left: '88%', top: '48%', s: 24, d: 200 },
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} locations={[0, 0.4, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      {clouds.map((c, i) => (
        <Cloud key={i} left={c.left} top={c.top} width={c.w} />
      ))}
      {ambients.map((b, i) => (
        <AmbientBubble key={i} left={b.left} top={b.top} size={b.s} delay={b.d} />
      ))}
      <View style={styles.hill}>
        <LinearGradient colors={['#6EE7B7', '#34D399', '#10B981']} style={StyleSheet.absoluteFillObject} />
      </View>
    </View>
  );
}

function Cloud({ left, top, width }: { left: string; top: string; width: number }) {
  return (
    <View style={[styles.cloud, { left, top, width }]}>
      <View style={[styles.cloudPuff, { width: width * 0.55, height: width * 0.35 }]} />
      <View style={[styles.cloudPuff, { width: width * 0.4, height: width * 0.28, marginLeft: -8, marginTop: 6 }]} />
      <View style={[styles.cloudPuff, { width: width * 0.35, height: width * 0.25, marginLeft: 12, marginTop: -4 }]} />
    </View>
  );
}

function AmbientBubble({ left, top, size, delay }: { left: string; top: string; size: number; delay: number }) {
  const drift = useSharedValue(0);
  useEffect(() => {
    const t = setTimeout(() => {
      drift.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2400 + delay, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2400 + delay, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
    }, delay);
    return () => clearTimeout(t);
  }, [delay, drift]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -8 * drift.value }, { translateX: 6 * drift.value }],
    opacity: 0.35 + drift.value * 0.25,
  }));
  return (
    <Animated.View style={[{ position: 'absolute', left, top, width: size, height: size, borderRadius: size / 2, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.65)', backgroundColor: 'rgba(255,255,255,0.15)' }, style]} />
  );
}

export function PopBurstFX({ x, y, burstKey }: { x: number; y: number; burstKey: number }) {
  const n = 14;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: x - 44, top: y - 44, width: 88, height: 88, alignItems: 'center', justifyContent: 'center' }} key={burstKey}>
      <Text style={styles.popLabel}>POP!</Text>
      {Array.from({ length: n }).map((_, i) => (
        <Fragment key={i} i={i} n={n} color={FRAGMENT_COLORS[i % FRAGMENT_COLORS.length]!} />
      ))}
    </View>
  );
}

function Fragment({ i, n, color }: { i: number; n: number; color: string }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = 0;
    t.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) });
  }, [t]);
  const style = useAnimatedStyle(() => {
    const angle = (i / n) * Math.PI * 2;
    const r = 10 + 50 * t.value;
    const size = 8 + (i % 3) * 5;
    return {
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.8)',
      opacity: 1 - t.value,
      transform: [{ translateX: Math.cos(angle) * r }, { translateY: Math.sin(angle) * r - 8 * t.value }, { scale: 1.1 - t.value * 0.8 }],
    };
  });
  return <Animated.View style={style} />;
}

const styles = StyleSheet.create({
  cloud: { position: 'absolute', flexDirection: 'row', alignItems: 'flex-end' },
  cloudPuff: { borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.75)' },
  hill: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '22%', borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden' },
  popLabel: { position: 'absolute', fontSize: 22, fontWeight: '900', color: '#0284C7', zIndex: 5, textShadowColor: '#fff', textShadowRadius: 8 },
});
