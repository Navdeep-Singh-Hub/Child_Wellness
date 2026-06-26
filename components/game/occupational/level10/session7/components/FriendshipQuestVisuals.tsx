/** Bonding trail backdrop — Friendship Quest */
import { FRIENDSHIP_QUEST_THEME } from '@/components/game/occupational/level10/session7/friendshipQuestTheme';
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

type Props = { bondPhase?: boolean };

export const FriendshipQuestVisuals: React.FC<Props> = ({ bondPhase = false }) => {
  const glow = useSharedValue(0);

  useEffect(() => {
    glow.value = withRepeat(
      withTiming(1, { duration: bondPhase ? 1000 : 2600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [glow, bondPhase]);

  const trailStyle = useAnimatedStyle(() => ({
    opacity: bondPhase ? 0.24 + glow.value * 0.14 : 0.1 + glow.value * 0.08,
    transform: [{ scale: 0.92 + glow.value * 0.1 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={FRIENDSHIP_QUEST_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.trailGlow, trailStyle]} />
      {FRIENDSHIP_QUEST_THEME.decor.map((d, i) => (
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
  trailGlow: {
    position: 'absolute',
    bottom: '20%',
    alignSelf: 'center',
    width: 100,
    height: 50,
    borderRadius: 50,
    backgroundColor: 'rgba(167,139,250,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(233,213,255,0.25)',
  },
  decor: { position: 'absolute', fontSize: 16 },
});
