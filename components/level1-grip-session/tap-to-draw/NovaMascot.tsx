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
import { GAME3_CONFIG, GALAXY } from './theme';

interface NovaMascotProps {
  hint: string;
}

export function NovaMascot({ hint }: NovaMascotProps) {
  const glow = useSharedValue(0);
  const spin = useSharedValue(0);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.4, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    spin.value = withRepeat(withTiming(360, { duration: 12000, easing: Easing.linear }), -1, false);
  }, [glow, spin]);

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }, { scale: 0.9 + glow.value * 0.15 }],
    opacity: 0.7 + glow.value * 0.3,
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.starWrap, starStyle]}>
        <Text style={styles.star}>⭐</Text>
      </Animated.View>
      <View style={styles.bubble}>
        <Text style={styles.name}>{GAME3_CONFIG.mascotName}</Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  starWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: GALAXY.panel,
    borderWidth: 1.5,
    borderColor: GALAXY.starGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: { fontSize: 26 },
  bubble: {
    flex: 1,
    backgroundColor: GALAXY.panel,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: GALAXY.panelBorder,
  },
  name: {
    fontSize: 11,
    fontWeight: '800',
    color: GALAXY.starGold,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  hint: { fontSize: 14, fontWeight: '600', color: GALAXY.textPrimary, lineHeight: 19 },
});
