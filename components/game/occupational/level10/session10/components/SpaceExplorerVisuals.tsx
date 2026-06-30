/** Cosmic voyage backdrop — Space Explorer */
import { SPACE_EXPLORER_THEME } from '@/components/game/occupational/level10/session10/spaceExplorerTheme';
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

type Props = { flyPhase?: boolean };

export const SpaceExplorerVisuals: React.FC<Props> = ({ flyPhase = false }) => {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withTiming(1, { duration: flyPhase ? 760 : 2000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [drift, flyPhase]);

  const rocketStyle = useAnimatedStyle(() => ({
    opacity: flyPhase ? 0.32 + drift.value * 0.18 : 0.14 + drift.value * 0.1,
    transform: [{ translateY: flyPhase ? -drift.value * 10 : drift.value * 4 - 2 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={SPACE_EXPLORER_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.rocketGlow, rocketStyle]}>
        <Text style={styles.rocket}>🚀</Text>
      </Animated.View>
      {SPACE_EXPLORER_THEME.decor.map((d, i) => (
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
  rocketGlow: {
    position: 'absolute',
    top: '11%',
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(99,102,241,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rocket: { fontSize: 28 },
  decor: { position: 'absolute', fontSize: 16 },
});
