/**
 * TaskCue — the central instruction card for the Integrated Core Challenge.
 * Shows the current task emoji, label and cue text, a dwell-progress bar, and a
 * row of pips tracking course progress.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

type Props = {
  emoji: string;
  label: string;
  cue: string;
  progress: number; // 0..1 dwell toward completion
  active: boolean; // condition currently met
  accent: string;
  taskIndex: number;
  totalTasks: number;
};

export const TaskCue: React.FC<Props> = ({ emoji, label, cue, progress, active, accent, taskIndex, totalTasks }) => {
  const pulse = useSharedValue(0);
  React.useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 720 }), -1, true);
  }, [pulse]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + (active ? pulse.value * 0.07 : 0) }],
    borderColor: active ? '#34D399' : accent,
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.badge, { shadowColor: accent }, style]}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.cue}>{cue}</Text>
      </Animated.View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(Math.max(0, Math.min(1, progress)) * 100)}%`, backgroundColor: active ? '#34D399' : accent }]} />
      </View>

      <View style={styles.pips}>
        {Array.from({ length: totalTasks }, (_, i) => (
          <View
            key={i}
            style={[
              styles.pip,
              i < taskIndex && { backgroundColor: '#34D399', borderColor: '#34D399' },
              i === taskIndex && { borderColor: accent, backgroundColor: 'rgba(255,255,255,0.25)' },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: '14%', alignSelf: 'center', alignItems: 'center', width: '86%' },
  badge: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 24,
    borderWidth: 3,
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.72)',
    shadowRadius: 18,
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 0 },
  },
  emoji: { fontSize: 50 },
  label: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 2, letterSpacing: 1 },
  cue: { color: '#E2E8F0', fontSize: 14, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  track: {
    marginTop: 14,
    width: '72%',
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(15,23,42,0.6)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 6 },
  pips: { flexDirection: 'row', gap: 6, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' },
  pip: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(15,23,42,0.5)',
  },
});
