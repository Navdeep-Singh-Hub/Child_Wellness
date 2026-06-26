/** Forest trail backdrop — Surprise Route */
import { SURPRISE_ROUTE_THEME } from '@/components/game/occupational/level10/session3/surpriseRouteTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type Props = { surpriseFlash?: boolean };

export const SurpriseRouteVisuals: React.FC<Props> = ({ surpriseFlash = false }) => {
  const drift = useSharedValue(0);
  const sparkle = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withTiming(1, { duration: surpriseFlash ? 500 : 3200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    sparkle.value = withRepeat(
      withTiming(1, { duration: surpriseFlash ? 400 : 2200, easing: Easing.linear }),
      -1,
      false,
    );
  }, [drift, sparkle, surpriseFlash]);

  const leafStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drift.value * 18 - 9 }],
    opacity: surpriseFlash ? 0.35 + drift.value * 0.3 : 0.12 + drift.value * 0.1,
  }));

  const mistStyle = useAnimatedStyle(() => ({
    opacity: surpriseFlash ? 0.5 + sparkle.value * 0.35 : 0.2 + sparkle.value * 0.15,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={SURPRISE_ROUTE_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.mistBand, mistStyle]} />
      <Animated.Text style={[styles.leafDrift, leafStyle]}>🍃</Animated.Text>
      {SURPRISE_ROUTE_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${5 + (i * 12) % 84}%`, top: `${10 + (i % 5) * 15}%`, opacity: 0.1 + (i % 2) * 0.06 },
          ]}
        >
          {d}
        </Text>
      ))}
      <View style={styles.trailEdge} />
    </View>
  );
};

const styles = StyleSheet.create({
  mistBand: {
    position: 'absolute',
    bottom: '14%',
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: 'rgba(167,139,250,0.12)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(167,139,250,0.25)',
  },
  leafDrift: {
    position: 'absolute',
    top: 56,
    left: '45%',
    fontSize: 26,
  },
  trailEdge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: 'rgba(20,33,28,0.65)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(52,211,153,0.3)',
  },
  decor: { position: 'absolute', fontSize: 16 },
});
