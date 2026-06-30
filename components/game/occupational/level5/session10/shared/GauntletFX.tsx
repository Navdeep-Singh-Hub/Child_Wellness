/** Shared challenge entity visuals — OT L5 Session 10 */
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

export function GauntletOrb({
  size,
  color,
  emoji,
  mark,
}: {
  size: number;
  color: string;
  emoji: string;
  mark?: string;
}) {
  return (
    <View
      style={[
        styles.orb,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          shadowColor: color,
        },
      ]}
    >
      <Text style={{ fontSize: size * 0.42 }}>{emoji}</Text>
      {mark ? <Text style={styles.orbMark}>{mark}</Text> : null}
    </View>
  );
}

export function GauntletFlash({ size, color, emoji }: { size: number; color: string; emoji: string }) {
  return (
    <View
      style={[
        styles.flash,
        { width: size, height: size, borderRadius: size / 2, shadowColor: color },
      ]}
    >
      <LinearGradient colors={[`${color}EE`, color]} style={[styles.flashGrad, { borderRadius: size / 2 }]}>
        <Text style={{ fontSize: size * 0.45 }}>{emoji}</Text>
      </LinearGradient>
    </View>
  );
}

export function GauntletSignal({ type, size }: { type: 'go' | 'stop'; size: number }) {
  const scale = useSharedValue(0.92);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.06, { duration: 350 }), withTiming(0.94, { duration: 350 })),
      -1,
      true,
    );
  }, [scale]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const bg = type === 'go' ? '#10B981' : '#EF4444';
  return (
    <Animated.View
      style={[
        styles.signal,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
        anim,
      ]}
    >
      <Text style={{ fontSize: size * 0.3 }}>{type === 'go' ? '🟢' : '🔴'}</Text>
      <Text style={styles.signalText}>{type === 'go' ? 'GO' : 'STOP'}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  orb: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.65)',
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  orbMark: { position: 'absolute', top: -6, right: -6, fontSize: 16 },
  flash: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.75,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 16,
  },
  flashGrad: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  signal: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  signalText: { color: '#fff', fontWeight: '900', fontSize: 16, marginTop: 2 },
});
