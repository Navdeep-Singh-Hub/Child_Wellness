/** Pause path backdrop — Stop & Think */
import { STOP_THINK_THEME } from '@/components/game/occupational/level10/session6/stopThinkTheme';
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

type Props = { stopPhase?: boolean };

export const StopThinkVisuals: React.FC<Props> = ({ stopPhase = false }) => {
  const breathe = useSharedValue(0);

  useEffect(() => {
    breathe.value = withRepeat(
      withTiming(1, { duration: stopPhase ? 2200 : 1400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [breathe, stopPhase]);

  const pathStyle = useAnimatedStyle(() => ({
    opacity: stopPhase ? 0.12 + breathe.value * 0.1 : 0.18 + breathe.value * 0.12,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={STOP_THINK_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.pathLine, pathStyle]} />
      <View style={styles.stopStripe} />
      {STOP_THINK_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${5 + (i * 12) % 86}%`, top: `${10 + (i % 5) * 15}%`, opacity: 0.08 + (i % 2) * 0.05 },
          ]}
        >
          {d}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  pathLine: {
    position: 'absolute',
    bottom: '22%',
    left: '10%',
    right: '10%',
    height: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(20,184,166,0.35)',
  },
  stopStripe: {
    position: 'absolute',
    top: '20%',
    right: '14%',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(239,68,68,0.45)',
  },
  decor: { position: 'absolute', fontSize: 16 },
});
