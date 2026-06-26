/** Market quest backdrop — Shopping Trip */
import { SHOPPING_TRIP_THEME } from '@/components/game/occupational/level10/session9/shoppingTripTheme';
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

type Props = { buyPhase?: boolean };

export const ShoppingTripVisuals: React.FC<Props> = ({ buyPhase = false }) => {
  const sway = useSharedValue(0);

  useEffect(() => {
    sway.value = withRepeat(
      withTiming(1, { duration: buyPhase ? 850 : 2300, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [sway, buyPhase]);

  const cartStyle = useAnimatedStyle(() => ({
    opacity: buyPhase ? 0.28 + sway.value * 0.14 : 0.1 + sway.value * 0.08,
    transform: [{ translateX: buyPhase ? sway.value * 8 : 0 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={SHOPPING_TRIP_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.cartGlow, cartStyle]}>
        <Text style={styles.cartEmoji}>🛒</Text>
      </Animated.View>
      {SHOPPING_TRIP_THEME.decor.map((d, i) => (
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
  cartGlow: {
    position: 'absolute',
    top: '13%',
    alignSelf: 'center',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(249,115,22,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(253,186,116,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartEmoji: { fontSize: 28 },
  decor: { position: 'absolute', fontSize: 16 },
});
