/** Spotlight cosmos backdrop — Focus Finder */
import { FOCUS_FINDER_THEME } from '@/components/game/occupational/level10/session6/focusFinderTheme';
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

type Props = { focusPhase?: boolean };

export const FocusFinderVisuals: React.FC<Props> = ({ focusPhase = false }) => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: focusPhase ? 1000 : 2600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [pulse, focusPhase]);

  const beamStyle = useAnimatedStyle(() => ({
    opacity: focusPhase ? 0.24 + pulse.value * 0.16 : 0.1 + pulse.value * 0.08,
    transform: [{ scaleX: 0.85 + pulse.value * 0.15 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={FOCUS_FINDER_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.spotBeam, beamStyle]} />
      {FOCUS_FINDER_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${6 + (i * 11) % 84}%`, top: `${10 + (i % 5) * 14}%`, opacity: 0.07 + (i % 2) * 0.05 },
          ]}
        >
          {d}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  spotBeam: {
    position: 'absolute',
    top: '12%',
    left: '30%',
    right: '30%',
    height: 120,
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
    backgroundColor: 'rgba(139,92,246,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.2)',
  },
  decor: { position: 'absolute', fontSize: 16 },
});
