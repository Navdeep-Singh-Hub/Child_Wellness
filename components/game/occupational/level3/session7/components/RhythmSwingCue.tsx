import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

type Props = {
  visible: boolean;
  phase: 'listen' | 'swing' | 'idle';
  beatScale: SharedValue<number>;
  beat: number;
  total: number;
};

export function RhythmSwingCue({ visible, phase, beatScale, beat, total }: Props) {
  const beatStyle = useAnimatedStyle(() => ({
    transform: [{ scale: beatScale.value }],
  }));

  if (!visible || phase === 'idle') return null;

  return (
    <View style={styles.wrap}>
      <Animated.View style={beatStyle}>
        <Text style={styles.emoji}>🎵</Text>
      </Animated.View>
      <Text style={styles.label}>
        {phase === 'listen' ? `Listen ${beat}/${total}` : `Swing ${beat}/${total}`}
      </Text>
      <Text style={styles.arrows}>⬅️ ➡️</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', alignSelf: 'center', top: '20%', alignItems: 'center', zIndex: 4 },
  emoji: { fontSize: 56 },
  label: { fontSize: 15, fontWeight: '800', color: '#6D28D9', marginTop: 4 },
  arrows: { fontSize: 22, marginTop: 6 },
});
