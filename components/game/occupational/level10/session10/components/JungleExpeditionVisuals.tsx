/** Rainforest adventure backdrop — Jungle Expedition */
import { JUNGLE_EXPEDITION_THEME } from '@/components/game/occupational/level10/session10/jungleExpeditionTheme';
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

type Props = { trekPhase?: boolean };

export const JungleExpeditionVisuals: React.FC<Props> = ({ trekPhase = false }) => {
  const sway = useSharedValue(0);

  useEffect(() => {
    sway.value = withRepeat(
      withTiming(1, { duration: trekPhase ? 820 : 2100, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [sway, trekPhase]);

  const leafStyle = useAnimatedStyle(() => ({
    opacity: trekPhase ? 0.3 + sway.value * 0.17 : 0.12 + sway.value * 0.1,
    transform: [{ rotate: trekPhase ? `${sway.value * 8 - 4}deg` : `${sway.value * 4 - 2}deg` }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={JUNGLE_EXPEDITION_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.leafGlow, leafStyle]}>
        <Text style={styles.leaf}>🌿</Text>
      </Animated.View>
      {JUNGLE_EXPEDITION_THEME.decor.map((d, i) => (
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
  leafGlow: {
    position: 'absolute',
    top: '11%',
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(22,163,74,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(187,247,208,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaf: { fontSize: 28 },
  decor: { position: 'absolute', fontSize: 16 },
});
