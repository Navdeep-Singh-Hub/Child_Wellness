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
import { AURORA, GAME1_CONFIG } from './theme';

interface SketchyMascotProps {
  hint: string;
  isHappy?: boolean;
}

export function SketchyMascot({ hint, isHappy }: SketchyMascotProps) {
  const bob = useSharedValue(0);
  const wiggle = useSharedValue(0);

  useEffect(() => {
    bob.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        withTiming(5, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [bob]);

  useEffect(() => {
    if (isHappy) {
      wiggle.value = withSequence(
        withTiming(-8, { duration: 80 }),
        withTiming(8, { duration: 80 }),
        withTiming(-6, { duration: 80 }),
        withTiming(6, { duration: 80 }),
        withTiming(0, { duration: 80 }),
      );
    }
  }, [isHappy, wiggle]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value }, { rotate: `${wiggle.value}deg` }],
  }));

  return (
    <View style={styles.wrap} accessibilityRole="text" accessibilityLabel={`${GAME1_CONFIG.mascotName} says: ${hint}`}>
      <Animated.View style={[styles.mascotBody, bodyStyle]}>
        <View style={styles.pencil}>
          <View style={styles.eraser} />
          <View style={styles.barrel} />
          <View style={styles.tip} />
        </View>
        <Text style={styles.face}>{isHappy ? '😊' : '✨'}</Text>
      </Animated.View>
      <View style={styles.bubble}>
        <View style={styles.bubbleTail} />
        <Text style={styles.bubbleName}>{GAME1_CONFIG.mascotName}</Text>
        <Text style={styles.bubbleText}>{hint}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 14 },
  mascotBody: { alignItems: 'center' },
  pencil: { width: 28, height: 52, alignItems: 'center' },
  eraser: {
    width: 22,
    height: 10,
    backgroundColor: '#FCA5A5',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barrel: {
    width: 22,
    height: 30,
    backgroundColor: AURORA.gold,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: AURORA.goldDark,
  },
  tip: {
    width: 0,
    height: 0,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderTopWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#1E293B',
  },
  face: { fontSize: 18, marginTop: 2 },
  bubble: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: 'relative',
  },
  bubbleTail: {
    position: 'absolute',
    left: -6,
    bottom: 14,
    width: 12,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    transform: [{ rotate: '45deg' }],
  },
  bubbleName: { fontSize: 11, fontWeight: '800', color: AURORA.gold, letterSpacing: 0.6, marginBottom: 2 },
  bubbleText: { fontSize: 15, fontWeight: '600', color: AURORA.textOnDark, lineHeight: 20 },
});
