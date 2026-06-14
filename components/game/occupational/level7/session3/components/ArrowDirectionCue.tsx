/**
 * ArrowDirectionCue — large direction arrow prompt with dwell progress.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

type Props = {
  emoji: string;
  label: string;
  progress: number;
  active: boolean;
  accent: string;
  trafficStyle?: boolean;
};

export const ArrowDirectionCue: React.FC<Props> = ({ emoji, label, progress, active, accent, trafficStyle }) => {
  const pulse = useSharedValue(0);
  React.useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 650 }), -1, true);
  }, [pulse]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + (active ? pulse.value * 0.07 : 0) }],
    borderColor: active ? '#34D399' : accent,
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View
        style={[
          styles.badge,
          trafficStyle && styles.trafficBadge,
          { shadowColor: accent },
          style,
        ]}
      >
        {trafficStyle && <View style={[styles.trafficDot, { backgroundColor: active ? '#34D399' : '#374151' }]} />}
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
  wrap: { position: 'absolute', top: '11%', alignSelf: 'center', alignItems: 'center', width: '84%' },
  badge: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 3,
    alignItems: 'center',
    backgroundColor: 'rgba(4,47,46,0.78)',
    shadowRadius: 16,
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 0 },
  },
  trafficBadge: { flexDirection: 'row', gap: 12, paddingHorizontal: 22 },
  trafficDot: { width: 18, height: 18, borderRadius: 9, alignSelf: 'center' },
  emoji: { fontSize: 48 },
  label: { color: '#fff', fontSize: 19, fontWeight: '900', marginTop: 2, letterSpacing: 0.5 },
  track: {
    marginTop: 12,
    width: '72%',
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(4,47,46,0.7)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 6 },
});
