/** Mind mastery cosmos — Mind Master capstone */
import { MIND_MASTER_THEME } from '@/components/game/occupational/level10/session6/mindMasterTheme';
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

type Props = { masterPhase?: boolean };

export const MindMasterVisuals: React.FC<Props> = ({ masterPhase = false }) => {
  const aura = useSharedValue(0);

  useEffect(() => {
    aura.value = withRepeat(
      withTiming(1, { duration: masterPhase ? 1000 : 2600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [aura, masterPhase]);

  const crownStyle = useAnimatedStyle(() => ({
    opacity: masterPhase ? 0.28 + aura.value * 0.18 : 0.12 + aura.value * 0.1,
    transform: [{ scale: 0.9 + aura.value * 0.12 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={MIND_MASTER_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.crownGlow, crownStyle]} />
      {MIND_MASTER_THEME.decor.map((d, i) => (
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
  crownGlow: {
    position: 'absolute',
    top: '10%',
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(251,191,36,0.35)',
    backgroundColor: 'rgba(139,92,246,0.12)',
  },
  decor: { position: 'absolute', fontSize: 16 },
});
