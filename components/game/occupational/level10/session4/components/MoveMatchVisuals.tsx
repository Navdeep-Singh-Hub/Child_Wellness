/** Harmony studio backdrop — Move & Match */
import { MOVE_MATCH_THEME } from '@/components/game/occupational/level10/session4/moveMatchTheme';
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

type Props = { matchPhase?: boolean };

export const MoveMatchVisuals: React.FC<Props> = ({ matchPhase = false }) => {
  const glow = useSharedValue(0);

  useEffect(() => {
    glow.value = withRepeat(
      withTiming(1, { duration: matchPhase ? 1500 : 2800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [glow, matchPhase]);

  const panelStyle = useAnimatedStyle(() => ({
    opacity: matchPhase ? 0.28 + glow.value * 0.2 : 0.14 + glow.value * 0.08,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={MOVE_MATCH_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.studioPanel, panelStyle]} />
      {MOVE_MATCH_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${5 + (i * 12) % 86}%`, top: `${9 + (i % 5) * 16}%`, opacity: 0.09 + (i % 2) * 0.05 },
          ]}
        >
          {d}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  studioPanel: {
    position: 'absolute',
    top: '12%',
    left: '10%',
    right: '10%',
    bottom: '12%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(244,114,182,0.25)',
    backgroundColor: 'rgba(244,114,182,0.06)',
  },
  decor: { position: 'absolute', fontSize: 16 },
});
