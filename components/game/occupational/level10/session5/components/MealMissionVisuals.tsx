/** Kitchen backdrop — Meal Mission */
import { MEAL_MISSION_THEME } from '@/components/game/occupational/level10/session5/mealMissionTheme';
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

type Props = { readyPhase?: boolean };

export const MealMissionVisuals: React.FC<Props> = ({ readyPhase = false }) => {
  const steam = useSharedValue(0);

  useEffect(() => {
    steam.value = withRepeat(
      withTiming(1, { duration: readyPhase ? 1100 : 2800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [steam, readyPhase]);

  const counterStyle = useAnimatedStyle(() => ({
    opacity: readyPhase ? 0.22 + steam.value * 0.14 : 0.1 + steam.value * 0.07,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={MEAL_MISSION_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.counter, counterStyle]} />
      <View style={styles.backsplash} />
      {MEAL_MISSION_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${4 + (i * 12) % 88}%`, top: `${8 + (i % 5) * 16}%`, opacity: 0.08 + (i % 2) * 0.05 },
          ]}
        >
          {d}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  counter: {
    position: 'absolute',
    bottom: '20%',
    left: '8%',
    right: '8%',
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(249,115,22,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(254,202,202,0.2)',
  },
  backsplash: {
    position: 'absolute',
    top: '16%',
    left: '6%',
    right: '6%',
    height: 52,
    borderRadius: 8,
    backgroundColor: 'rgba(124,45,18,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(254,202,202,0.15)',
  },
  decor: { position: 'absolute', fontSize: 16 },
});
