/**
 * RotationCue — large rotational command with dwell progress.
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
  urgent?: boolean;
};

export const RotationCue: React.FC<Props> = ({ emoji, label, progress, active, accent, urgent }) => {
  const pulse = useSharedValue(0);
  React.useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: urgent ? 400 : 700 }), -1, true);
  }, [pulse, urgent]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + (active || urgent ? pulse.value * 0.08 : 0) }],
    borderColor: active ? '#34D399' : urgent ? '#FB7185' : accent,
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.badge, urgent && styles.urgentBadge, { shadowColor: accent }, style]}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.label, urgent && styles.urgentLabel]}>{label}</Text>
      </Animated.View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.round(progress * 100)}%`,
              backgroundColor: active ? '#34D399' : urgent ? '#FB7185' : accent,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: '10%', alignSelf: 'center', alignItems: 'center', width: '86%' },
  badge: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 3,
    alignItems: 'center',
    backgroundColor: 'rgba(26,5,51,0.8)',
    shadowRadius: 16,
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 0 },
  },
  urgentBadge: { backgroundColor: 'rgba(127,29,29,0.75)' },
  emoji: { fontSize: 50 },
  label: { color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 2, letterSpacing: 0.5 },
  urgentLabel: { color: '#FECACA' },
  track: {
    marginTop: 12,
    width: '74%',
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(26,5,51,0.7)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 6 },
});
