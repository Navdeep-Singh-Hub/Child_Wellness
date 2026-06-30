import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { GAME3_CONFIG, GALAXY } from './theme';

interface ConstellationMeterProps {
  taps: number;
}

export function ConstellationMeter({ taps }: ConstellationMeterProps) {
  const goal = GAME3_CONFIG.tapsRequired;
  const ready = taps >= goal;
  const width = useSharedValue(0);
  const pop = useSharedValue(1);

  useEffect(() => {
    width.value = withTiming((taps / goal) * 100, { duration: 300, easing: Easing.out(Easing.cubic) });
    pop.value = withSpring(1.2, { damping: 8 }, () => {
      pop.value = withSpring(1);
    });
  }, [taps, goal, width, pop]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value}%` as `${number}%`,
  }));

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
  }));

  return (
    <View style={styles.wrap} accessibilityLabel={`${taps} of ${goal} stars placed`}>
      <Text style={styles.label}>Constellation</Text>
      <View style={styles.starsRow}>
        {Array.from({ length: goal }, (_, i) => (
          <Animated.Text
            key={i}
            style={[
              styles.miniStar,
              i < taps && styles.miniStarLit,
              i === taps - 1 && starStyle,
            ]}
          >
            {i < taps ? '★' : '☆'}
          </Animated.Text>
        ))}
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, ready && styles.fillReady, fillStyle]} />
      </View>
      <Text style={[styles.count, ready && styles.countReady]}>{taps}/{goal}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: GALAXY.panel,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: GALAXY.panelBorder,
    marginBottom: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: GALAXY.accent,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
    justifyContent: 'center',
  },
  miniStar: { fontSize: 16, color: GALAXY.textMuted },
  miniStarLit: { color: GALAXY.starGold },
  track: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  fill: { height: '100%', backgroundColor: GALAXY.cosmicCyan, borderRadius: 3 },
  fillReady: { backgroundColor: GALAXY.starGold },
  count: {
    fontSize: 13,
    fontWeight: '800',
    color: GALAXY.cosmicCyan,
    textAlign: 'right',
  },
  countReady: { color: GALAXY.starGold },
});
