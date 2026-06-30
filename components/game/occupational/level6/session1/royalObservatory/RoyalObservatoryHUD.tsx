import { RO } from './royalObservatoryTokens';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type Props = {
  round: number;
  totalRounds: number;
  score: number;
  coins: number;
};

export function RoyalObservatoryHUD({ round, totalRounds, score, coins }: Props) {
  const pop = useSharedValue(1);
  useEffect(() => {
    pop.value = withSpring(1.15, {}, () => {
      pop.value = withSpring(1);
    });
  }, [score, pop]);

  const starBump = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  return (
    <View style={styles.wrap}>
      <Text style={styles.academy}>👑 ROYAL OBSERVATORY · CROWN WATCH</Text>
      <Text style={styles.title}>👑 Royal Observatory</Text>
      <Text style={styles.sub}>Hold your head steady — protect the crown</Text>
      <View style={styles.stats}>
        <View style={styles.pill}>
          <Text style={styles.pillLbl}>WATCH</Text>
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
  academy: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2, color: RO.textMuted },
  title: { fontSize: 22, fontWeight: '900', color: RO.textLight, marginTop: 4 },
  sub: { fontSize: 13, fontWeight: '600', color: RO.textMuted, marginTop: 2, textAlign: 'center' },
  stats: { flexDirection: 'row', gap: 8, marginTop: 10 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: RO.glassBorder,
    backgroundColor: RO.glass,
  },
  pillLbl: { fontSize: 9, fontWeight: '800', color: RO.textMuted, letterSpacing: 0.5 },
  pillVal: { fontSize: 15, fontWeight: '900', color: RO.accentBright },
  pillIcon: { fontSize: 14 },
});
