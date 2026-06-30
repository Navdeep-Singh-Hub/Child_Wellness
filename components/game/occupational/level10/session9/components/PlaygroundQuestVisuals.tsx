/** Park adventure backdrop — Playground Quest */
import { PLAYGROUND_QUEST_THEME } from '@/components/game/occupational/level10/session9/playgroundQuestTheme';
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

type Props = { playPhase?: boolean };

export const PlaygroundQuestVisuals: React.FC<Props> = ({ playPhase = false }) => {
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withTiming(1, { duration: playPhase ? 800 : 2200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [bounce, playPhase]);

  const sunStyle = useAnimatedStyle(() => ({
    opacity: playPhase ? 0.3 + bounce.value * 0.16 : 0.12 + bounce.value * 0.1,
    transform: [{ translateY: playPhase ? -bounce.value * 6 : 0 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={PLAYGROUND_QUEST_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.sunGlow, sunStyle]}>
        <Text style={styles.sun}>☀️</Text>
      </Animated.View>
      {PLAYGROUND_QUEST_THEME.decor.map((d, i) => (
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
  sunGlow: {
    position: 'absolute',
    top: '11%',
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(234,179,8,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(253,230,138,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sun: { fontSize: 28 },
  decor: { position: 'absolute', fontSize: 16 },
});
