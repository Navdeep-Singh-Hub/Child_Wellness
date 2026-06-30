import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { GAME2_CONFIG, MEADOW } from './theme';

interface BloomMeterProps {
  ratio: number;
  shapeEmoji: string;
}

export function BloomMeter({ ratio, shapeEmoji }: BloomMeterProps) {
  const width = useSharedValue(0);
  const bloom = useSharedValue(0);
  const pct = Math.round(ratio * 100);
  const goal = Math.round(GAME2_CONFIG.fillThreshold * 100);
  const ready = ratio >= GAME2_CONFIG.fillThreshold;

  useEffect(() => {
    width.value = withTiming(Math.min(100, pct), { duration: 350, easing: Easing.out(Easing.cubic) });
    if (pct > 0) {
      bloom.value = withSpring(1.15, { damping: 6 }, () => {
        bloom.value = withSpring(1);
      });
    }
  }, [pct, width, bloom]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value}%` as `${number}%`,
  }));

  const flowerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bloom.value }],
  }));

  return (
    <View style={styles.wrap} accessibilityLabel={`${pct} percent filled, goal ${goal} percent`}>
      <Animated.Text style={[styles.flower, flowerStyle]}>{ready ? '🌺' : shapeEmoji}</Animated.Text>
      <View style={styles.trackWrap}>
        <Text style={styles.label}>Bloom</Text>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, ready && styles.fillReady, fillStyle]} />
          <View style={[styles.goalMark, { left: `${goal}%` }]} />
        </View>
        <Text style={[styles.pct, ready && styles.pctReady]}>{pct}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: MEADOW.sunflowerLight,
    marginBottom: 12,
  },
  flower: { fontSize: 26 },
  trackWrap: { flex: 1, gap: 4 },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: MEADOW.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  track: {
    height: 12,
    backgroundColor: 'rgba(20,83,45,0.1)',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    height: '100%',
    backgroundColor: MEADOW.coral,
    borderRadius: 6,
  },
  fillReady: {
    backgroundColor: MEADOW.grassDark,
  },
  goalMark: {
    position: 'absolute',
    top: -2,
    width: 3,
    height: 16,
    backgroundColor: MEADOW.sunflower,
    borderRadius: 2,
    marginLeft: -1.5,
  },
  pct: {
    fontSize: 13,
    fontWeight: '800',
    color: MEADOW.coral,
    alignSelf: 'flex-end',
  },
  pctReady: { color: MEADOW.grassDark },
});
