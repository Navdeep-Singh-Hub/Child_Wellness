/** Friendly hello trail backdrop — Greeting Game */
import { GREETING_GAME_THEME } from '@/components/game/occupational/level10/session7/greetingGameTheme';
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

type Props = { greetPhase?: boolean };

export const GreetingGameVisuals: React.FC<Props> = ({ greetPhase = false }) => {
  const wave = useSharedValue(0);

  useEffect(() => {
    wave.value = withRepeat(
      withTiming(1, { duration: greetPhase ? 1000 : 2600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [wave, greetPhase]);

  const arcStyle = useAnimatedStyle(() => ({
    opacity: greetPhase ? 0.22 + wave.value * 0.14 : 0.1 + wave.value * 0.08,
    transform: [{ scale: 0.92 + wave.value * 0.1 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={GREETING_GAME_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.waveArc, arcStyle]} />
      {GREETING_GAME_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${5 + (i * 11) % 86}%`, top: `${9 + (i % 5) * 15}%`, opacity: 0.08 + (i % 2) * 0.05 },
          ]}
        >
          {d}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  waveArc: {
    position: 'absolute',
    bottom: '18%',
    alignSelf: 'center',
    width: 140,
    height: 70,
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    backgroundColor: 'rgba(251,146,60,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(254,215,170,0.25)',
  },
  decor: { position: 'absolute', fontSize: 16 },
});
