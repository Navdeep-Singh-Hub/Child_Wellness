/** Noir evidence bureau backdrop — Sensory Detective */
import { DETECTIVE_SHELL, SENSORY_DETECTIVE_THEME } from '@/components/game/occupational/level10/session1/sensoryDetectiveTheme';
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

export const SensoryDetectiveVisuals: React.FC<{ lampOn?: boolean }> = ({ lampOn = true }) => {
  const flicker = useSharedValue(0);
  useEffect(() => {
    if (lampOn) {
      flicker.value = withRepeat(
        withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      );
    }
  }, [flicker, lampOn]);

  const lampStyle = useAnimatedStyle(() => ({
    opacity: 0.22 + flicker.value * 0.18,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={SENSORY_DETECTIVE_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.lampGlow, lampStyle]} />
      <View style={styles.corkFrame}>
        <View style={styles.corkInner} />
      </View>
      {SENSORY_DETECTIVE_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${6 + (i * 12) % 80}%`, top: `${10 + (i % 4) * 16}%`, opacity: 0.1 + (i % 2) * 0.05 },
          ]}
        >
          {d}
        </Text>
      ))}
      <View style={styles.deskLine} />
    </View>
  );
};

const styles = StyleSheet.create({
  lampGlow: {
    position: 'absolute',
    top: -40,
    right: 24,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: DETECTIVE_SHELL.gold,
  },
  corkFrame: {
    position: 'absolute',
    left: '6%',
    right: '6%',
    top: '18%',
    bottom: '14%',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'rgba(146,64,14,0.7)',
    backgroundColor: 'rgba(146,64,14,0.25)',
    padding: 6,
  },
  corkInner: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(180,83,9,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.15)',
  },
  deskLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: 'rgba(66,32,6,0.55)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(217,119,6,0.35)',
  },
  decor: { position: 'absolute', fontSize: 18 },
});
