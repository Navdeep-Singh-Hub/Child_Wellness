/** Exit quest backdrop — Escape Route */
import { ESCAPE_ROUTE_THEME } from '@/components/game/occupational/level10/session8/escapeRouteTheme';
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

type Props = { escapePhase?: boolean };

export const EscapeRouteVisuals: React.FC<Props> = ({ escapePhase = false }) => {
  const glow = useSharedValue(0);

  useEffect(() => {
    glow.value = withRepeat(
      withTiming(1, { duration: escapePhase ? 900 : 2400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [glow, escapePhase]);

  const arrowStyle = useAnimatedStyle(() => ({
    opacity: escapePhase ? 0.28 + glow.value * 0.16 : 0.1 + glow.value * 0.08,
    transform: [{ translateX: escapePhase ? glow.value * 12 : 0 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={ESCAPE_ROUTE_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.arrowGlow, arrowStyle]}>
        <Text style={styles.arrow}>➜</Text>
      </Animated.View>
      {ESCAPE_ROUTE_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${6 + (i * 11) % 85}%`, top: `${10 + (i % 5) * 14}%`, opacity: 0.08 + (i % 2) * 0.05 },
          ]}
        >
          {d}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  arrowGlow: {
    position: 'absolute',
    top: '42%',
    left: '18%',
  },
  arrow: { fontSize: 42, color: 'rgba(249,115,22,0.35)' },
  decor: { position: 'absolute', fontSize: 16 },
});
