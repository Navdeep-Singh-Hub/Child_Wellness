/** Zen balance bridge backdrop — Balance & Reach */
import { BALANCE_REACH_THEME } from '@/components/game/occupational/level10/session4/balanceReachTheme';
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

type Props = { reachPhase?: boolean };

export const BalanceReachVisuals: React.FC<Props> = ({ reachPhase = false }) => {
  const mist = useSharedValue(0);

  useEffect(() => {
    mist.value = withRepeat(
      withTiming(1, { duration: reachPhase ? 1800 : 3200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [mist, reachPhase]);

  const mistStyle = useAnimatedStyle(() => ({
    opacity: reachPhase ? 0.2 + mist.value * 0.15 : 0.1 + mist.value * 0.08,
    transform: [{ translateY: mist.value * 8 - 4 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={BALANCE_REACH_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <View style={styles.bridgePlank} />
      <Animated.View style={[styles.mist, mistStyle]} />
      {BALANCE_REACH_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${6 + (i * 11) % 84}%`, top: `${8 + (i % 5) * 16}%`, opacity: 0.09 + (i % 2) * 0.05 },
          ]}
        >
          {d}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bridgePlank: {
    position: 'absolute',
    bottom: '22%',
    left: '8%',
    right: '8%',
    height: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(148,163,184,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(94,234,212,0.35)',
  },
  mist: {
    position: 'absolute',
    bottom: '10%',
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(167,139,250,0.1)',
  },
  decor: { position: 'absolute', fontSize: 16 },
});
