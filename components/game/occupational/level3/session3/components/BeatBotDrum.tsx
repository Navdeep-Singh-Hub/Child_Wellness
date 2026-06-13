import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { BeatPulseRing } from '@/components/game/occupational/level3/session1/components/BeatPulseRing';

type Props = {
  active: boolean;
  canTap: boolean;
  pulseKey: number;
  drumBg: string;
  drumActive: string;
  onTap: () => void;
};

export function BeatBotDrum({ canTap, pulseKey, drumBg, drumActive, onTap }: Props) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  React.useEffect(() => {
    scale.value = withSequence(withTiming(1.14, { duration: 80 }), withTiming(1, { duration: 120 }));
  }, [pulseKey, scale]);

  return (
    <Pressable onPress={onTap} style={styles.wrap}>
      <BeatPulseRing active={pulseKey > 0} color="rgba(251,191,36,0.6)" size={200} />
      <Animated.View style={[styles.drum, anim, { backgroundColor: canTap ? drumActive : drumBg }]}>
        <Text style={styles.emoji}>🥁</Text>
        <Text style={styles.bot}>Beat Bot</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', width: 200, height: 200 },
  drum: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  emoji: { fontSize: 48 },
  bot: { fontSize: 11, fontWeight: '800', color: '#fff', marginTop: 4 },
});
