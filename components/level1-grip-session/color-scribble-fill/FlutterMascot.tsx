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
import { GAME2_CONFIG, MEADOW } from './theme';

interface FlutterMascotProps {
  hint: string;
  emoji: string;
  isCelebrating?: boolean;
}

export function FlutterMascot({ hint, emoji, isCelebrating }: FlutterMascotProps) {
  const flap = useSharedValue(0);
  const float = useSharedValue(0);

  useEffect(() => {
    flap.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 280, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 280, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
    float.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(4, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [flap, float]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: float.value },
      { scaleX: 1 + flap.value * 0.06 },
      { rotate: isCelebrating ? '8deg' : `${flap.value * 3 - 1.5}deg` },
    ],
  }));

  return (
    <View style={styles.wrap} accessibilityRole="text" accessibilityLabel={`${GAME2_CONFIG.mascotName} says: ${hint}`}>
      <Animated.View style={[styles.mascotWrap, bodyStyle]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </Animated.View>
      <View style={styles.bubble}>
        <Text style={styles.name}>{GAME2_CONFIG.mascotName}</Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  mascotWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: MEADOW.coralLight,
    shadowColor: MEADOW.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  emoji: { fontSize: 28 },
  bubble: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: MEADOW.sunflowerLight,
  },
  name: {
    fontSize: 11,
    fontWeight: '800',
    color: MEADOW.coral,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  hint: {
    fontSize: 14,
    fontWeight: '600',
    color: MEADOW.textOnLight,
    lineHeight: 19,
  },
});
