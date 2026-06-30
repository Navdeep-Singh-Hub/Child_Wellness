import type { BreathBalloonColor } from '@/components/game/occupational/level10/session2/balloonBreathingTheme';
import type { BreathPhase } from '@/components/game/occupational/level10/session2/regulationTrackingUtils';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  scale: number;
  colors: BreathBalloonColor;
  phase: BreathPhase;
  syncScore: number;
};

export const BreathingBalloon: React.FC<Props> = ({ scale, colors, phase, syncScore }) => {
  const bob = useSharedValue(0);
  const glow = useSharedValue(0.5);

  useEffect(() => {
    bob.value = withRepeat(
      withSequence(
        withTiming(1, { duration: phase === 'hold' ? 1800 : 2400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: phase === 'hold' ? 1800 : 2400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [bob, phase]);

  useEffect(() => {
    glow.value = withTiming(0.35 + syncScore * 0.55, { duration: 200 });
  }, [glow, syncScore]);

  const balloonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale * (1 + bob.value * 0.02) }, { translateY: bob.value * -6 }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: scale * 1.15 }],
  }));

  const baseSize = 120;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View
        style={[
          styles.glow,
          glowStyle,
          { backgroundColor: colors.glow, width: baseSize * 1.4, height: baseSize * 1.5, borderRadius: baseSize },
        ]}
      />
      <Animated.View
        style={[
          styles.balloon,
          balloonStyle,
          {
            width: baseSize,
            height: baseSize * 1.22,
            borderRadius: baseSize * 0.5,
            backgroundColor: colors.fill,
            borderColor: colors.string,
          },
        ]}
      />
      <View style={[styles.string, { backgroundColor: colors.string }]} />
      <View style={styles.knot} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: '50%',
    top: '38%',
    marginLeft: -70,
    marginTop: -90,
    alignItems: 'center',
    width: 140,
  },
  glow: { position: 'absolute', top: 10 },
  balloon: {
    borderWidth: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  string: { width: 2, height: 72, marginTop: -2 },
  knot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(12,74,110,0.25)',
    marginTop: -2,
  },
});
