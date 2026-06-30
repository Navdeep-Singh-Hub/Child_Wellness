import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { HUB_S6, STUDIOS_S6 } from './theme';

interface Session6CompleteProps {
  completed: number;
  totalSteps: number;
  taskSuccess: boolean | null;
  onExit?: () => void;
}

export function Session6CompleteScreen({
  completed,
  totalSteps,
  taskSuccess,
  onExit,
}: Session6CompleteProps) {
  const trophy = useSharedValue(1);

  useEffect(() => {
    trophy.value = withRepeat(
      withSequence(withTiming(1.1, { duration: 800 }), withTiming(1, { duration: 800 })),
      -1,
      true,
    );
  }, [trophy]);

  const trophyStyle = useAnimatedStyle(() => ({ transform: [{ scale: trophy.value }] }));

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={{ flex: 1, backgroundColor: HUB_S6.bgMid }} />
      </View>
      <ConfettiEffect />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.eyebrow}>SESSION 6 COMPLETE</Text>
          <Text style={styles.title}>A–Z Complete!</Text>
          <Text style={styles.subtitle}>You traced every letter on the expedition</Text>
          <Animated.View style={[styles.trophyWrap, trophyStyle]}>
            <Text style={styles.trophy}>🏆</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Alphabet Master</Text>
            </View>
          </Animated.View>
          <View style={styles.chips}>
            {STUDIOS_S6.map((s, i) => (
              <View key={s.step} style={[styles.chip, { borderColor: s.border }, i < completed && styles.chipDone]}>
                <Text style={styles.chipIcon}>{s.icon}</Text>
                {i < completed ? <Text style={styles.chipCheck}>✓</Text> : null}
              </View>
            ))}
          </View>
          <View style={styles.stats}>
            <Text style={styles.stat}>Camps: {completed} / {totalSteps}</Text>
            <Text style={styles.stat}>
              Passport: {taskSuccess === null ? '—' : taskSuccess ? '✓ Stamped' : 'Try again'}
            </Text>
          </View>
          {onExit ? (
            <Pressable style={({ pressed }) => [styles.exitBtn, pressed && styles.pressed]} onPress={onExit}>
              <Ionicons name="home-outline" size={20} color={HUB_S6.bgTop} />
              <Text style={styles.exitText}>Back to Sessions</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: 24, alignItems: 'center', paddingBottom: 40 },
  eyebrow: { fontSize: 11, fontWeight: '800', color: HUB_S6.accent, letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 30, fontWeight: '900', color: HUB_S6.textLight, marginBottom: 6 },
  subtitle: { fontSize: 16, color: HUB_S6.textMuted, marginBottom: 28, textAlign: 'center' },
  trophyWrap: { alignItems: 'center', marginBottom: 28 },
  trophy: { fontSize: 72, marginBottom: 12 },
  badge: {
    backgroundColor: HUB_S6.gold,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: HUB_S6.accentLight,
  },
  badgeText: { fontSize: 18, fontWeight: '900', color: HUB_S6.bgTop },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 24 },
  chip: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
  },
  chipDone: { backgroundColor: 'rgba(255,255,255,0.18)' },
  chipIcon: { fontSize: 26 },
  chipCheck: { position: 'absolute', top: 2, right: 6, fontSize: 12, color: HUB_S6.gold, fontWeight: '800' },
  stats: { marginBottom: 28, alignItems: 'center', gap: 6 },
  stat: { fontSize: 16, fontWeight: '600', color: HUB_S6.textLight },
  exitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: HUB_S6.accent,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 18,
  },
  exitText: { fontSize: 17, fontWeight: '800', color: HUB_S6.bgTop },
  pressed: { opacity: 0.9 },
});
