/** Whirlwind arena backdrop — Catch & Turn */
import { CATCH_TURN_THEME } from '@/components/game/occupational/level10/session4/catchTurnTheme';
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

type Props = { turnPhase?: boolean };

export const CatchTurnVisuals: React.FC<Props> = ({ turnPhase = false }) => {
  const spin = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(
      withTiming(1, { duration: turnPhase ? 1400 : 2800, easing: Easing.linear }),
      -1,
      false,
    );
  }, [spin, turnPhase]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
    opacity: turnPhase ? 0.45 : 0.22,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={CATCH_TURN_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.spinRing, ringStyle]} />
      {CATCH_TURN_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${5 + (i * 12) % 86}%`, top: `${10 + (i % 5) * 16}%`, opacity: 0.1 + (i % 2) * 0.06 },
          ]}
        >
          {d}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  spinRing: {
    position: 'absolute',
    top: '38%',
    left: '30%',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(129,140,248,0.35)',
    borderStyle: 'dashed',
  },
  decor: { position: 'absolute', fontSize: 16 },
});
