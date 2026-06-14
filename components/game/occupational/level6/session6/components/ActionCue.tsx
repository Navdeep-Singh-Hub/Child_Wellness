/**
 * ActionCue — large centered prompt for the current dynamic-balance action
 * (step / turn / stop / march), with a dwell-progress bar underneath.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

type Props = { emoji: string; label: string; progress: number; active: boolean; accent: string };

export const ActionCue: React.FC<Props> = ({ emoji, label, progress, active, accent }) => {
  const pulse = useSharedValue(0);
  React.useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [pulse]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + (active ? pulse.value * 0.08 : 0) }],
    borderColor: active ? '#34D399' : accent,
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.badge, { shadowColor: accent }, style]}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.label}>{label}</Text>
      </Animated.View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(progress * 100)}%`, backgroundColor: active ? '#34D399' : accent }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: '12%', alignSelf: 'center', alignItems: 'center', width: '80%' },
  badge: {
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 3,
    alignItems: 'center',
    backgroundColor: 'rgba(15,36,23,0.72)',
    shadowRadius: 16,
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 0 },
  },
  emoji: { fontSize: 46 },
  label: { color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 2, letterSpacing: 0.5 },
  track: {
    marginTop: 12,
    width: '70%',
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(15,36,23,0.65)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 6 },
});
