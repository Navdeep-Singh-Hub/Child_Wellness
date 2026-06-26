/** Observer sky backdrop — Watch Carefully */
import { WATCH_CAREFULLY_THEME } from '@/components/game/occupational/level10/session6/watchCarefullyTheme';
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

type Props = { carefulPhase?: boolean };

export const WatchCarefullyVisuals: React.FC<Props> = ({ carefulPhase = false }) => {
  const blink = useSharedValue(0);

  useEffect(() => {
    blink.value = withRepeat(
      withTiming(1, { duration: carefulPhase ? 2400 : 1600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [blink, carefulPhase]);

  const lensStyle = useAnimatedStyle(() => ({
    opacity: carefulPhase ? 0.2 + blink.value * 0.12 : 0.14 + blink.value * 0.08,
    transform: [{ scale: 0.92 + blink.value * 0.08 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={WATCH_CAREFULLY_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.lensRing, lensStyle]} />
      {WATCH_CAREFULLY_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${6 + (i * 11) % 84}%`, top: `${10 + (i % 5) * 14}%`, opacity: 0.07 + (i % 2) * 0.05 },
          ]}
        >
          {d}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  lensRing: {
    position: 'absolute',
    top: '16%',
    left: '34%',
    right: '34%',
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: 'rgba(6,182,212,0.35)',
    backgroundColor: 'rgba(56,189,248,0.08)',
  },
  decor: { position: 'absolute', fontSize: 16 },
});
