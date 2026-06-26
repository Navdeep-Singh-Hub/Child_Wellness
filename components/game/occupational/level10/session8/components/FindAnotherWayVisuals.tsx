/** Adaptive path quest backdrop — Find Another Way */
import { FIND_ANOTHER_WAY_THEME } from '@/components/game/occupational/level10/session8/findAnotherWayTheme';
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

type Props = { adaptPhase?: boolean };

export const FindAnotherWayVisuals: React.FC<Props> = ({ adaptPhase = false }) => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: adaptPhase ? 1000 : 2600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [pulse, adaptPhase]);

  const bulbStyle = useAnimatedStyle(() => ({
    opacity: adaptPhase ? 0.24 + pulse.value * 0.14 : 0.1 + pulse.value * 0.08,
    transform: [{ scale: 0.92 + pulse.value * 0.1 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={FIND_ANOTHER_WAY_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.bulbGlow, bulbStyle]} />
      {FIND_ANOTHER_WAY_THEME.decor.map((d, i) => (
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
  bulbGlow: {
    position: 'absolute',
    top: '12%',
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(253,230,138,0.25)',
  },
  decor: { position: 'absolute', fontSize: 16 },
});
