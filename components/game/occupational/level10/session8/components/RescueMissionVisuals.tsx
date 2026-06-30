/** Hero quest backdrop — Rescue Mission */
import { RESCUE_MISSION_THEME } from '@/components/game/occupational/level10/session8/rescueMissionTheme';
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

type Props = { rescuePhase?: boolean };

export const RescueMissionVisuals: React.FC<Props> = ({ rescuePhase = false }) => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: rescuePhase ? 850 : 2200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [pulse, rescuePhase]);

  const beaconStyle = useAnimatedStyle(() => ({
    opacity: rescuePhase ? 0.3 + pulse.value * 0.2 : 0.12 + pulse.value * 0.1,
    transform: [{ scale: 1 + pulse.value * (rescuePhase ? 0.15 : 0.06) }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={RESCUE_MISSION_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.beacon, beaconStyle]}>
        <Text style={styles.beaconText}>🆘</Text>
      </Animated.View>
      {RESCUE_MISSION_THEME.decor.map((d, i) => (
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
  beacon: {
    position: 'absolute',
    top: '12%',
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(254,205,211,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  beaconText: { fontSize: 26 },
  decor: { position: 'absolute', fontSize: 16 },
});
