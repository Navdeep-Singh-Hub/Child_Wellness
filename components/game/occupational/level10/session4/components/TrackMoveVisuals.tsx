/** Aurora motion trail backdrop — Track & Move */
import { TRACK_MOVE_THEME } from '@/components/game/occupational/level10/session4/trackMoveTheme';
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

type Props = { movePhase?: boolean };

export const TrackMoveVisuals: React.FC<Props> = ({ movePhase = false }) => {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: movePhase ? 1200 : 2400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [movePhase, shimmer]);

  const bandStyle = useAnimatedStyle(() => ({
    opacity: movePhase ? 0.25 + shimmer.value * 0.2 : 0.12 + shimmer.value * 0.1,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={TRACK_MOVE_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.auroraBand, bandStyle]} />
      {TRACK_MOVE_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${4 + (i * 12) % 88}%`, top: `${10 + (i % 5) * 15}%`, opacity: 0.09 + (i % 2) * 0.05 },
          ]}
        >
          {d}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  auroraBand: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(34,211,238,0.12)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(232,121,249,0.2)',
  },
  decor: { position: 'absolute', fontSize: 16 },
});
