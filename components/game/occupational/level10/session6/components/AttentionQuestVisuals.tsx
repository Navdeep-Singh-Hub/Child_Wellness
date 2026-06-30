/** Quest trail backdrop — Attention Quest */
import { ATTENTION_QUEST_THEME } from '@/components/game/occupational/level10/session6/attentionQuestTheme';
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

type Props = { questPhase?: boolean };

export const AttentionQuestVisuals: React.FC<Props> = ({ questPhase = false }) => {
  const map = useSharedValue(0);

  useEffect(() => {
    map.value = withRepeat(
      withTiming(1, { duration: questPhase ? 1200 : 2800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [map, questPhase]);

  const pathStyle = useAnimatedStyle(() => ({
    opacity: questPhase ? 0.22 + map.value * 0.14 : 0.12 + map.value * 0.08,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={ATTENTION_QUEST_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.questPath, pathStyle]} />
      <View style={styles.compass} />
      {ATTENTION_QUEST_THEME.decor.map((d, i) => (
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
  questPath: {
    position: 'absolute',
    bottom: '19%',
    left: '6%',
    right: '6%',
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(245,158,11,0.25)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(16,185,129,0.08)',
  },
  compass: {
    position: 'absolute',
    top: '14%',
    right: '12%',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(253,230,138,0.35)',
    backgroundColor: 'rgba(120,53,15,0.25)',
  },
  decor: { position: 'absolute', fontSize: 16 },
});
