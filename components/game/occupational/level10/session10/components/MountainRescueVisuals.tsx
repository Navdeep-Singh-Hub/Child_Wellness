/** Alpine rescue backdrop — Mountain Rescue */
import { MOUNTAIN_RESCUE_THEME } from '@/components/game/occupational/level10/session10/mountainRescueTheme';
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

type Props = { rescuePhase?: boolean };

export const MountainRescueVisuals: React.FC<Props> = ({ rescuePhase = false }) => {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withTiming(1, { duration: rescuePhase ? 900 : 2300, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [drift, rescuePhase]);

  const peakStyle = useAnimatedStyle(() => ({
    opacity: rescuePhase ? 0.3 + drift.value * 0.17 : 0.13 + drift.value * 0.1,
    transform: [{ translateY: rescuePhase ? -drift.value * 8 : drift.value * 3 - 1.5 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={MOUNTAIN_RESCUE_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.peakGlow, peakStyle]}>
        <Text style={styles.peak}>🏔️</Text>
      </Animated.View>
      {MOUNTAIN_RESCUE_THEME.decor.map((d, i) => (
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
  peakGlow: {
    position: 'absolute',
    top: '11%',
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(14,165,233,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(224,242,254,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  peak: { fontSize: 28 },
  decor: { position: 'absolute', fontSize: 16 },
});
