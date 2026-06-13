import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

type Props = {
  visible: boolean;
  bubbleScale: SharedValue<number>;
};

export function BreathingBubble({ visible, bubbleScale }: Props) {
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: bubbleScale.value }],
  }));

  if (!visible) return null;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.bubble, style]}>
        <Text style={styles.emoji}>🫧</Text>
      </Animated.View>
      <Text style={styles.label}>Take a slow breath…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', alignItems: 'center', top: '12%', zIndex: 4 },
  bubble: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(34,197,94,0.35)',
  },
  emoji: { fontSize: 40 },
  label: { marginTop: 10, fontSize: 15, fontWeight: '800', color: '#15803D' },
});
