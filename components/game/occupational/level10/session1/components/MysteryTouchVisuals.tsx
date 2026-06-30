/** Silk void tactile backdrop — Mystery Touch */
import { MYSTERY_TOUCH_THEME } from '@/components/game/occupational/level10/session1/mysteryTouchTheme';
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

export const MysteryTouchVisuals: React.FC<{ reveal?: boolean }> = ({ reveal = false }) => {
  const drift = useSharedValue(0);
  useEffect(() => {
    drift.value = withRepeat(
      withTiming(1, { duration: reveal ? 1400 : 2800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [drift, reveal]);

  const silkStyle = useAnimatedStyle(() => ({
    opacity: 0.1 + drift.value * 0.14,
    transform: [{ translateY: drift.value * 12 - 6 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={MYSTERY_TOUCH_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.silkBand, silkStyle]} />
      <Animated.View style={[styles.silkBand, styles.silkBand2, silkStyle, { opacity: 0.08 }]} />
      {MYSTERY_TOUCH_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${8 + (i * 11) % 78}%`, top: `${14 + (i % 5) * 14}%`, opacity: 0.14 + (i % 2) * 0.06 },
          ]}
        >
          {d}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  silkBand: {
    position: 'absolute',
    left: '-5%',
    width: '110%',
    height: '22%',
    top: '35%',
    borderRadius: 200,
    backgroundColor: 'rgba(192,132,252,0.12)',
  },
  silkBand2: { top: '52%', backgroundColor: 'rgba(212,165,116,0.1)' },
  decor: { position: 'absolute', fontSize: 20 },
});
