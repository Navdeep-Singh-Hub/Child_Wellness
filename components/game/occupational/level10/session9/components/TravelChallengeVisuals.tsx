/** Journey adventure backdrop — Travel Challenge */
import { TRAVEL_CHALLENGE_THEME } from '@/components/game/occupational/level10/session9/travelChallengeTheme';
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

type Props = { travelPhase?: boolean };

export const TravelChallengeVisuals: React.FC<Props> = ({ travelPhase = false }) => {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withTiming(1, { duration: travelPhase ? 900 : 2400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [drift, travelPhase]);

  const planeStyle = useAnimatedStyle(() => ({
    opacity: travelPhase ? 0.32 + drift.value * 0.18 : 0.14 + drift.value * 0.1,
    transform: [{ translateX: travelPhase ? drift.value * 12 - 6 : 0 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={TRAVEL_CHALLENGE_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.planeGlow, planeStyle]}>
        <Text style={styles.plane}>✈️</Text>
      </Animated.View>
      {TRAVEL_CHALLENGE_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${5 + (i * 11) % 86}%`, top: `${8 + (i % 5) * 15}%`, opacity: 0.08 + (i % 2) * 0.05 },
          ]}
        >
          {d}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  planeGlow: {
    position: 'absolute',
    top: '12%',
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(14,165,233,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(186,230,253,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plane: { fontSize: 28 },
  decor: { position: 'absolute', fontSize: 16 },
});
