/** Aurora background + floating sensory particles for Sensory Explorer. */
import { SENSORY_EXPLORER_THEME, SENSORY_SHELL } from '@/components/game/occupational/level10/session1/sensoryExplorerTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

const AuroraBand: React.FC<{ top: string; color: string; delay: number }> = ({ top, color, delay }) => {
  const drift = useSharedValue(0);
  useEffect(() => {
    const t = setTimeout(() => {
      drift.value = withRepeat(withTiming(1, { duration: 4200 + delay, easing: Easing.inOut(Easing.sin) }), -1, true);
    }, delay);
    return () => clearTimeout(t);
  }, [delay, drift]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: -30 + drift.value * 60 }, { scaleX: 0.9 + drift.value * 0.2 }],
    opacity: 0.22 + drift.value * 0.18,
  }));

  return (
    <Animated.View style={[styles.auroraBand, { top, backgroundColor: color }, style]} />
  );
};

export const SensoryExplorerVisuals: React.FC<{ zoneColor?: string }> = ({ zoneColor = SENSORY_EXPLORER_THEME.accent }) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <LinearGradient colors={SENSORY_EXPLORER_THEME.bgGradient} style={StyleSheet.absoluteFill} />
    <AuroraBand top="12%" color="#22D3EE" delay={0} />
    <AuroraBand top="28%" color="#A78BFA" delay={400} />
    <AuroraBand top="52%" color={zoneColor} delay={800} />
    <AuroraBand top="68%" color="#FB923C" delay={200} />

    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id="glow" cx="50%" cy="40%" rx="55%" ry="45%">
          <Stop offset="0%" stopColor={zoneColor} stopOpacity="0.35" />
          <Stop offset="100%" stopColor="#050B1A" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Ellipse cx="50%" cy="42%" rx="48%" ry="38%" fill="url(#glow)" />
    </Svg>

    {SENSORY_EXPLORER_THEME.decor.map((d, i) => (
      <Animated.Text
        key={i}
        style={[
          styles.decor,
          {
            left: `${6 + (i * 13) % 82}%`,
            top: `${8 + (i % 4) * 18}%`,
            opacity: 0.18 + (i % 3) * 0.08,
          },
        ]}
      >
        {d}
      </Animated.Text>
    ))}
  </View>
);

const styles = StyleSheet.create({
  auroraBand: {
    position: 'absolute',
    left: '-10%',
    width: '120%',
    height: '14%',
    borderRadius: 999,
  },
  decor: { position: 'absolute', fontSize: 22 },
});
