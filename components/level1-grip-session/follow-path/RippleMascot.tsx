import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { GAME4_CONFIG, SUNSET } from './theme';

interface RippleMascotProps {
  hint: string;
  hasError?: boolean;
}

export function RippleMascot({ hint, hasError }: RippleMascotProps) {
  const bob = useSharedValue(0);

  useEffect(() => {
    bob.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        withTiming(3, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [bob]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value }],
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.iconWrap, style]}>
        <Text style={styles.emoji}>🌊</Text>
      </Animated.View>
      <View style={[styles.bubble, hasError && styles.bubbleError]}>
        <Text style={styles.name}>{GAME4_CONFIG.mascotName}</Text>
        <Text style={[styles.hint, hasError && styles.hintError]}>{hint}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: SUNSET.panel,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: SUNSET.water,
  },
  emoji: { fontSize: 26 },
  bubble: {
    flex: 1,
    backgroundColor: SUNSET.panel,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: SUNSET.panelBorder,
  },
  bubbleError: { borderColor: 'rgba(220,38,38,0.4)', backgroundColor: 'rgba(254,242,242,0.9)' },
  name: {
    fontSize: 11,
    fontWeight: '800',
    color: SUNSET.waterDeep,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  hint: { fontSize: 14, fontWeight: '600', color: SUNSET.textDark, lineHeight: 19 },
  hintError: { color: SUNSET.error },
});
