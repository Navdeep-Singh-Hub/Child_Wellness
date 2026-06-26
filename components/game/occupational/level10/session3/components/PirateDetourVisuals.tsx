/** Captain's course map backdrop — Pirate Detour */
import { PIRATE_DETOUR_THEME } from '@/components/game/occupational/level10/session3/pirateDetourTheme';
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

type Props = { detourFlash?: boolean };

export const PirateDetourVisuals: React.FC<Props> = ({ detourFlash = false }) => {
  const wave = useSharedValue(0);
  const compass = useSharedValue(0);

  useEffect(() => {
    wave.value = withRepeat(
      withTiming(1, { duration: detourFlash ? 500 : 2800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    compass.value = withRepeat(
      withTiming(1, { duration: detourFlash ? 600 : 4000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [compass, detourFlash, wave]);

  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: wave.value * 6 - 3 }],
    opacity: detourFlash ? 0.35 + wave.value * 0.25 : 0.12 + wave.value * 0.1,
  }));

  const compassStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${compass.value * 360}deg` }],
    opacity: detourFlash ? 0.9 : 0.45,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={PIRATE_DETOUR_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.waveBand, waveStyle]} />
      <Animated.View style={[styles.waveBand2, waveStyle]} />
      <Animated.Text style={[styles.compass, compassStyle]}>🧭</Animated.Text>
      {PIRATE_DETOUR_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${6 + (i * 12) % 82}%`, top: `${12 + (i % 4) * 18}%`, opacity: 0.1 + (i % 2) * 0.06 },
          ]}
        >
          {d}
        </Text>
      ))}
      <View style={styles.mapEdge} />
    </View>
  );
};

const styles = StyleSheet.create({
  waveBand: {
    position: 'absolute',
    bottom: '18%',
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(14,165,233,0.15)',
    borderTopWidth: 2,
    borderTopColor: 'rgba(125,211,252,0.25)',
  },
  waveBand2: {
    position: 'absolute',
    bottom: '8%',
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: 'rgba(14,165,233,0.1)',
  },
  compass: {
    position: 'absolute',
    top: 52,
    right: 18,
    fontSize: 28,
  },
  mapEdge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: 'rgba(12,25,41,0.6)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(234,179,8,0.3)',
  },
  decor: { position: 'absolute', fontSize: 16 },
});
