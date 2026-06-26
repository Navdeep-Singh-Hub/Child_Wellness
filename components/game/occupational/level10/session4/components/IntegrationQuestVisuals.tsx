/** Crystal quest backdrop — Integration Quest */
import { INTEGRATION_QUEST_THEME } from '@/components/game/occupational/level10/session4/integrationQuestTheme';
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

type Props = { phase?: 'gather' | 'integrate' | 'complete' };

export const IntegrationQuestVisuals: React.FC<Props> = ({ phase = 'gather' }) => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    const dur = phase === 'integrate' ? 1600 : phase === 'complete' ? 2000 : 2800;
    pulse.value = withRepeat(withTiming(1, { duration: dur, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [phase, pulse]);

  const auraStyle = useAnimatedStyle(() => ({
    opacity: 0.15 + pulse.value * (phase === 'complete' ? 0.25 : 0.15),
    transform: [{ scale: 1 + pulse.value * 0.06 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={INTEGRATION_QUEST_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.questAura, auraStyle]} />
      {INTEGRATION_QUEST_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${4 + (i * 12) % 88}%`, top: `${8 + (i % 5) * 17}%`, opacity: 0.1 + (i % 2) * 0.06 },
          ]}
        >
          {d}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  questAura: {
    position: 'absolute',
    top: '30%',
    left: '25%',
    width: '50%',
    height: '40%',
    borderRadius: 999,
    backgroundColor: 'rgba(167,139,250,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(253,230,138,0.2)',
  },
  decor: { position: 'absolute', fontSize: 16 },
});
