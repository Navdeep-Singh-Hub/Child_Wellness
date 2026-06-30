/** Morning school hallway backdrop — School Ready */
import { SCHOOL_READY_THEME } from '@/components/game/occupational/level10/session5/schoolReadyTheme';
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

type Props = { readyPhase?: boolean };

export const SchoolReadyVisuals: React.FC<Props> = ({ readyPhase = false }) => {
  const bell = useSharedValue(0);

  useEffect(() => {
    bell.value = withRepeat(
      withTiming(1, { duration: readyPhase ? 1200 : 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [bell, readyPhase]);

  const hallStyle = useAnimatedStyle(() => ({
    opacity: readyPhase ? 0.22 + bell.value * 0.15 : 0.1 + bell.value * 0.08,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={SCHOOL_READY_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.hallFloor, hallStyle]} />
      <View style={styles.lockerRow} />
      {SCHOOL_READY_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${5 + (i * 12) % 86}%`, top: `${10 + (i % 5) * 15}%`, opacity: 0.09 + (i % 2) * 0.05 },
          ]}
        >
          {d}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  hallFloor: {
    position: 'absolute',
    bottom: '16%',
    left: 0,
    right: 0,
    height: 36,
    backgroundColor: 'rgba(56,189,248,0.1)',
    borderTopWidth: 2,
    borderTopColor: 'rgba(134,239,172,0.2)',
  },
  lockerRow: {
    position: 'absolute',
    top: '18%',
    left: '8%',
    right: '8%',
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(148,163,184,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
  },
  decor: { position: 'absolute', fontSize: 16 },
});
