/** Social adventure cosmos — Social Explorer capstone */
import { SOCIAL_EXPLORER_THEME } from '@/components/game/occupational/level10/session7/socialExplorerTheme';
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

type Props = { socialPhase?: boolean };

export const SocialExplorerVisuals: React.FC<Props> = ({ socialPhase = false }) => {
  const aura = useSharedValue(0);

  useEffect(() => {
    aura.value = withRepeat(
      withTiming(1, { duration: socialPhase ? 1000 : 2600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [aura, socialPhase]);

  const starStyle = useAnimatedStyle(() => ({
    opacity: socialPhase ? 0.28 + aura.value * 0.18 : 0.12 + aura.value * 0.1,
    transform: [{ scale: 0.9 + aura.value * 0.12 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={SOCIAL_EXPLORER_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.starGlow, starStyle]} />
      {SOCIAL_EXPLORER_THEME.decor.map((d, i) => (
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
  starGlow: {
    position: 'absolute',
    top: '10%',
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(251,191,36,0.35)',
    backgroundColor: 'rgba(251,146,60,0.12)',
  },
  decor: { position: 'absolute', fontSize: 16 },
});
