/** Captain's quest backdrop — Pirate Treasure Hunt */
import { PIRATE_TREASURE_HUNT_THEME } from '@/components/game/occupational/level10/session10/pirateTreasureHuntTheme';
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

type Props = { claimPhase?: boolean };

export const PirateTreasureHuntVisuals: React.FC<Props> = ({ claimPhase = false }) => {
  const wave = useSharedValue(0);

  useEffect(() => {
    wave.value = withRepeat(
      withTiming(1, { duration: claimPhase ? 880 : 2200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [wave, claimPhase]);

  const flagStyle = useAnimatedStyle(() => ({
    opacity: claimPhase ? 0.32 + wave.value * 0.17 : 0.13 + wave.value * 0.1,
    transform: [{ rotate: claimPhase ? `${wave.value * 10 - 5}deg` : `${wave.value * 5 - 2.5}deg` }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={PIRATE_TREASURE_HUNT_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.flagGlow, flagStyle]}>
        <Text style={styles.flag}>🏴‍☠️</Text>
      </Animated.View>
      {PIRATE_TREASURE_HUNT_THEME.decor.map((d, i) => (
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
  flagGlow: {
    position: 'absolute',
    top: '11%',
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(217,119,6,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(253,230,138,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flag: { fontSize: 28 },
  decor: { position: 'absolute', fontSize: 16 },
});
