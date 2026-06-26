/** Solver mastery backdrop — Problem Solver capstone */
import { PROBLEM_SOLVER_THEME } from '@/components/game/occupational/level10/session8/problemSolverTheme';
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

type Props = { solvePhase?: boolean };

export const ProblemSolverVisuals: React.FC<Props> = ({ solvePhase = false }) => {
  const glow = useSharedValue(0);

  useEffect(() => {
    glow.value = withRepeat(
      withTiming(1, { duration: solvePhase ? 950 : 2500, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [glow, solvePhase]);

  const bulbStyle = useAnimatedStyle(() => ({
    opacity: solvePhase ? 0.3 + glow.value * 0.18 : 0.12 + glow.value * 0.1,
    transform: [{ scale: 0.92 + glow.value * 0.12 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={PROBLEM_SOLVER_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.bulbGlow, bulbStyle]}>
        <Text style={styles.bulb}>💡</Text>
      </Animated.View>
      {PROBLEM_SOLVER_THEME.decor.map((d, i) => (
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
  bulbGlow: {
    position: 'absolute',
    top: '10%',
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(253,230,138,0.35)',
    backgroundColor: 'rgba(99,102,241,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulb: { fontSize: 32 },
  decor: { position: 'absolute', fontSize: 16 },
});
