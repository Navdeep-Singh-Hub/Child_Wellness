import { TF } from './thunderForgeTokens';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type Props = {
  round: number;
  totalRounds: number;
  score: number;
  coins: number;
};

export function ThunderForgeHUD({ round, totalRounds, score, coins }: Props) {
  const pop = useSharedValue(1);
  useEffect(() => {
    pop.value = withSpring(1.15, {}, () => {
      pop.value = withSpring(1);
    });
  }, [score, pop]);

  const starBump = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  return (
    <View style={styles.wrap}>
      <Text style={styles.academy}>⚡ THUNDER FORGE · REACTOR ACADEMY</Text>
      <Text style={styles.title}>⚡ Thunder Forge</Text>
      <Text style={styles.sub}>Sit tall to charge the reactor core</Text>
      <View style={styles.stats}>
        <View style={styles.pill}>
          <Text style={styles.pillLbl}>CYCLE</Text>
          <Text style={styles.pillVal}>
            {round}/{totalRounds}
          </Text>
        </View>
        <Animated.View style={[styles.pill, starBump]}>
          <Text style={styles.pillIcon}>⭐</Text>
          <Text style={styles.pillVal}>{score}</Text>
        </Animated.View>
        <View style={styles.pill}>
          <Text style={styles.pillIcon}>🪙</Text>
          <Text style={styles.pillVal}>{coins}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginTop: 2 },
  academy: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.3,
    color: TF.textMuted,
  },
  title: { fontSize: 22, fontWeight: '900', color: TF.textLight, marginTop: 4 },
  sub: { fontSize: 13, fontWeight: '600', color: TF.textMuted, marginTop: 2, textAlign: 'center' },
  stats: { flexDirection: 'row', gap: 8, marginTop: 10 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: TF.glassBorder,
    backgroundColor: TF.glass,
  },
  pillLbl: { fontSize: 9, fontWeight: '800', color: TF.textMuted, letterSpacing: 0.5 },
  pillVal: { fontSize: 15, fontWeight: '900', color: TF.accentBright },
  pillIcon: { fontSize: 14 },
});
