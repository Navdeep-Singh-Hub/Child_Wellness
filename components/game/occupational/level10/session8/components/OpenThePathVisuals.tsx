/** Gateway quest backdrop — Open The Path */
import { OPEN_THE_PATH_THEME } from '@/components/game/occupational/level10/session8/openThePathTheme';
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

type Props = { openPhase?: boolean };

export const OpenThePathVisuals: React.FC<Props> = ({ openPhase = false }) => {
  const glow = useSharedValue(0);

  useEffect(() => {
    glow.value = withRepeat(
      withTiming(1, { duration: openPhase ? 1000 : 2600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [glow, openPhase]);

  const doorStyle = useAnimatedStyle(() => ({
    opacity: openPhase ? 0.24 + glow.value * 0.14 : 0.1 + glow.value * 0.08,
    transform: [{ scaleY: 0.92 + glow.value * 0.1 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={OPEN_THE_PATH_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.doorGlow, doorStyle]} />
      {OPEN_THE_PATH_THEME.decor.map((d, i) => (
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
  doorGlow: {
    position: 'absolute',
    top: '14%',
    alignSelf: 'center',
    width: 70,
    height: 90,
    borderRadius: 8,
    backgroundColor: 'rgba(234,179,8,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(253,230,138,0.25)',
  },
  decor: { position: 'absolute', fontSize: 16 },
});
