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
import { GAME5_CONFIG, GALLERY } from './theme';

interface CuratorMascotProps {
  hint: string;
}

export function CuratorMascot({ hint }: CuratorMascotProps) {
  const tilt = useSharedValue(0);

  useEffect(() => {
    tilt.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(4, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [tilt]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${tilt.value}deg` }],
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.frame, style]}>
        <Text style={styles.emoji}>🖼️</Text>
      </Animated.View>
      <View style={styles.bubble}>
        <Text style={styles.name}>{GAME5_CONFIG.mascotName}</Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  frame: {
    width: 52,
    height: 58,
    borderWidth: 3,
    borderColor: GALLERY.frameGold,
    backgroundColor: GALLERY.wall,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GALLERY.frameBrown,
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  emoji: { fontSize: 24 },
  bubble: {
    flex: 1,
    backgroundColor: GALLERY.panel,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: GALLERY.frameGoldLight,
  },
  name: {
    fontSize: 11,
    fontWeight: '800',
    color: GALLERY.frameBrown,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  hint: { fontSize: 14, fontWeight: '600', color: GALLERY.textDark, lineHeight: 19 },
});
