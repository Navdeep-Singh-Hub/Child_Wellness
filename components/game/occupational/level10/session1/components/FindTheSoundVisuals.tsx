/** Echo cavern backdrop with golden sound ripples — Find The Sound */
import { FIND_THE_SOUND_THEME } from '@/components/game/occupational/level10/session1/findTheSoundTheme';
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
import Svg, { Circle } from 'react-native-svg';

type Props = {
  accent?: string;
  rippleOrigin?: { x: number; y: number };
  listenActive?: boolean;
};

export const FindTheSoundVisuals: React.FC<Props> = ({
  accent = FIND_THE_SOUND_THEME.accent,
  rippleOrigin = { x: 0.5, y: 0.5 },
  listenActive = false,
}) => {
  const ripple = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    ripple.value = withRepeat(
      withTiming(1, { duration: listenActive ? 1100 : 1800, easing: Easing.out(Easing.quad) }),
      -1,
      false,
    );
    glow.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [glow, listenActive, ripple]);

  const rippleStyle = useAnimatedStyle(() => ({
    opacity: listenActive ? 0.55 - ripple.value * 0.45 : 0.15,
    transform: [{ scale: 0.4 + ripple.value * (listenActive ? 1.8 : 0.6) }],
  }));

  const leftPct = `${rippleOrigin.x * 100}%`;
  const topPct = `${rippleOrigin.y * 100}%`;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={FIND_THE_SOUND_THEME.bgGradient} style={StyleSheet.absoluteFill} />

      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        {[0.22, 0.38, 0.54].map((r, i) => (
          <Circle
            key={i}
            cx={`${rippleOrigin.x * 100}%`}
            cy={`${rippleOrigin.y * 100}%`}
            r={`${r * 100}%`}
            stroke={accent}
            strokeWidth={1.5}
            fill="none"
            opacity={0.08 + i * 0.04}
          />
        ))}
      </Svg>

      <Animated.View style={[styles.ripple, { left: leftPct, top: topPct, borderColor: accent }, rippleStyle]} />
      <Animated.View
        style={[
          styles.ripple,
          { left: leftPct, top: topPct, borderColor: FIND_THE_SOUND_THEME.accentCool, marginLeft: -8, marginTop: -8 },
          rippleStyle,
          { opacity: 0.25 },
        ]}
      />

      {FIND_THE_SOUND_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${5 + (i * 14) % 84}%`, top: `${10 + (i % 5) * 15}%`, opacity: 0.14 + (i % 2) * 0.08 },
          ]}
        >
          {d}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  ripple: {
    position: 'absolute',
    width: 100,
    height: 100,
    marginLeft: -50,
    marginTop: -50,
    borderRadius: 50,
    borderWidth: 3,
  },
  decor: { position: 'absolute', fontSize: 20 },
});
