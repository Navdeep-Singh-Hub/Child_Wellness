/** Feeling face quest backdrop — Emotion Match */
import { EMOTION_MATCH_THEME } from '@/components/game/occupational/level10/session7/emotionMatchTheme';
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

type Props = { matchPhase?: boolean };

export const EmotionMatchVisuals: React.FC<Props> = ({ matchPhase = false }) => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: matchPhase ? 1000 : 2600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [pulse, matchPhase]);

  const heartStyle = useAnimatedStyle(() => ({
    opacity: matchPhase ? 0.24 + pulse.value * 0.14 : 0.1 + pulse.value * 0.08,
    transform: [{ scale: 0.9 + pulse.value * 0.12 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={EMOTION_MATCH_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.heartGlow, heartStyle]} />
      {EMOTION_MATCH_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${6 + (i * 11) % 84}%`, top: `${10 + (i % 5) * 14}%`, opacity: 0.08 + (i % 2) * 0.05 },
          ]}
        >
          {d}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  heartGlow: {
    position: 'absolute',
    top: '14%',
    alignSelf: 'center',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: 'rgba(244,114,182,0.3)',
    backgroundColor: 'rgba(45,212,191,0.1)',
  },
  decor: { position: 'absolute', fontSize: 16 },
});
