/** Hallway entryway backdrop — Door Challenge */
import { DOOR_CHALLENGE_THEME } from '@/components/game/occupational/level10/session5/doorChallengeTheme';
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

export const DoorChallengeVisuals: React.FC<Props> = ({ readyPhase = false }) => {
  const hall = useSharedValue(0);

  useEffect(() => {
    hall.value = withRepeat(
      withTiming(1, { duration: readyPhase ? 1300 : 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [hall, readyPhase]);

  const floorStyle = useAnimatedStyle(() => ({
    opacity: readyPhase ? 0.2 + hall.value * 0.12 : 0.09 + hall.value * 0.06,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={DOOR_CHALLENGE_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.hallFloor, floorStyle]} />
      <View style={styles.doorFrame} />
      {DOOR_CHALLENGE_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${5 + (i * 11) % 86}%`, top: `${10 + (i % 5) * 15}%`, opacity: 0.08 + (i % 2) * 0.05 },
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
    bottom: '17%',
    left: 0,
    right: 0,
    height: 34,
    backgroundColor: 'rgba(100,116,139,0.12)',
    borderTopWidth: 2,
    borderTopColor: 'rgba(148,163,184,0.22)',
  },
  doorFrame: {
    position: 'absolute',
    top: '14%',
    left: '42%',
    width: '16%',
    height: 56,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: 'rgba(146,64,14,0.45)',
    backgroundColor: 'rgba(120,53,15,0.2)',
  },
  decor: { position: 'absolute', fontSize: 16 },
});
