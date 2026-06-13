import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

type Props = {
  progress: number;
  secondsLeft: string;
  accent: string;
  visible: boolean;
};

export function HoldCrystalRing({ progress, secondsLeft, accent, visible }: Props) {
  if (!visible) return null;
  const pct = `${Math.min(100, Math.max(0, progress * 100))}%`;

  return (
    <Animated.View entering={FadeIn.duration(220)} style={styles.wrap}>
      <Text style={styles.crystal}>🧊✨</Text>
      <Text style={[styles.time, { color: accent }]}>{secondsLeft}s</Text>
      <View style={[styles.track, { borderColor: accent }]}>
        <View style={[styles.fill, { backgroundColor: accent, width: pct }]} />
      </View>
      <Text style={[styles.label, { color: accent }]}>Hold steady like a statue</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', width: '82%', marginBottom: 16 },
  crystal: { fontSize: 36, marginBottom: 6 },
  time: { fontSize: 30, fontWeight: '900', marginBottom: 8 },
  track: {
    width: '100%',
    height: 14,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  fill: { height: '100%', borderRadius: 10 },
  label: { fontSize: 14, fontWeight: '800', marginTop: 8 },
});
