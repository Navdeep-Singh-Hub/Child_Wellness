/** Serene moon garden backdrop — Calm Body Quest */
import { CALM_BODY_QUEST_THEME } from '@/components/game/occupational/level10/session2/calmBodyQuestTheme';
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

export const CalmBodyQuestVisuals: React.FC = () => {
  const mist = useSharedValue(0);
  useEffect(() => {
    mist.value = withRepeat(
      withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [mist]);

  const mistStyle = useAnimatedStyle(() => ({
    opacity: 0.08 + mist.value * 0.1,
    transform: [{ translateY: mist.value * 8 - 4 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={CALM_BODY_QUEST_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.mistBand, mistStyle]} />
      {CALM_BODY_QUEST_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${5 + (i * 12) % 85}%`, top: `${10 + (i % 5) * 15}%`, opacity: 0.1 + (i % 2) * 0.05 },
          ]}
        >
          {d}
        </Text>
      ))}
      <View style={styles.pond} />
    </View>
  );
};

const styles = StyleSheet.create({
  mistBand: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(196,181,253,0.2)',
  },
  pond: {
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    height: 40,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    backgroundColor: 'rgba(110,231,183,0.12)',
  },
  decor: { position: 'absolute', fontSize: 17 },
});
