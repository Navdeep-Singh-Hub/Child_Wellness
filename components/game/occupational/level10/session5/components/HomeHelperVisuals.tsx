/** Cozy home backdrop — Home Helper */
import { HOME_HELPER_THEME } from '@/components/game/occupational/level10/session5/homeHelperTheme';
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

export const HomeHelperVisuals: React.FC<Props> = ({ readyPhase = false }) => {
  const glow = useSharedValue(0);

  useEffect(() => {
    glow.value = withRepeat(
      withTiming(1, { duration: readyPhase ? 1400 : 3200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [glow, readyPhase]);

  const rugStyle = useAnimatedStyle(() => ({
    opacity: readyPhase ? 0.2 + glow.value * 0.14 : 0.08 + glow.value * 0.07,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={HOME_HELPER_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.rug, rugStyle]} />
      <View style={styles.shelf} />
      {HOME_HELPER_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${6 + (i * 11) % 84}%`, top: `${12 + (i % 5) * 14}%`, opacity: 0.08 + (i % 2) * 0.05 },
          ]}
        >
          {d}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  rug: {
    position: 'absolute',
    bottom: '18%',
    left: '12%',
    right: '12%',
    height: 42,
    borderRadius: 20,
    backgroundColor: 'rgba(251,191,36,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(253,230,138,0.18)',
  },
  shelf: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    right: '10%',
    height: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(120,53,15,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(253,230,138,0.2)',
  },
  decor: { position: 'absolute', fontSize: 16 },
});
