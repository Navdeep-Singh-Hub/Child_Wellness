import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

type Props = {
  visible: boolean;
  phase: 'listen' | 'tap' | 'idle';
  beatScale: SharedValue<number>;
  beatCount: number;
  currentBeat: number;
};

export function RhythmBeatCue({ visible, phase, beatScale, beatCount, currentBeat }: Props) {
  const beatStyle = useAnimatedStyle(() => ({
    transform: [{ scale: beatScale.value }],
  }));

  if (!visible || phase === 'idle') return null;

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.drum, beatStyle]}>
        <Text style={styles.emoji}>🥁</Text>
      </Animated.View>
      <Text style={styles.label}>{phase === 'listen' ? 'Listen…' : 'Your turn!'}</Text>
      {phase === 'listen' && (
        <View style={styles.dots}>
          {Array.from({ length: beatCount }).map((_, i) => (
            <View key={i} style={[styles.dot, i < currentBeat && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', alignSelf: 'center', top: '20%', alignItems: 'center', zIndex: 4 },
  drum: { marginBottom: 8 },
  emoji: { fontSize: 64 },
  label: { fontSize: 16, fontWeight: '800', color: '#6D28D9' },
  dots: { flexDirection: 'row', gap: 8, marginTop: 8 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: 'rgba(139,92,246,0.25)' },
  dotActive: { backgroundColor: '#8B5CF6' },
});
