/** Grand adventure finale backdrop — ARVIT Grand Champion */
import { ARVIT_GRAND_CHAMPION_THEME } from '@/components/game/occupational/level10/session10/arvitGrandChampionTheme';
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

type Props = { championPhase?: boolean };

export const ArvitGrandChampionVisuals: React.FC<Props> = ({ championPhase = false }) => {
  const glow = useSharedValue(0);

  useEffect(() => {
    glow.value = withRepeat(
      withTiming(1, { duration: championPhase ? 950 : 2500, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [glow, championPhase]);

  const crownStyle = useAnimatedStyle(() => ({
    opacity: championPhase ? 0.32 + glow.value * 0.2 : 0.14 + glow.value * 0.1,
    transform: [{ scale: 0.92 + glow.value * 0.14 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={ARVIT_GRAND_CHAMPION_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.crownGlow, crownStyle]}>
        <Text style={styles.crown}>👑</Text>
      </Animated.View>
      {ARVIT_GRAND_CHAMPION_THEME.decor.map((d, i) => (
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
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(253,230,138,0.35)',
    backgroundColor: 'rgba(234,179,8,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crown: { fontSize: 32 },
  decor: { position: 'absolute', fontSize: 16 },
});
