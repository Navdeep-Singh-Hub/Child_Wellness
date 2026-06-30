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
import { SessionHubBackground } from './SessionHubBackground';
import { HUB, STUDIOS } from './theme';

interface SessionCompleteScreenProps {
  completed: number;
  totalSteps: number;
  taskSuccess: boolean | null;
  onExit?: () => void;
}

export function SessionCompleteScreen({
  completed,
  totalSteps,
  taskSuccess,
  onExit,
}: SessionCompleteScreenProps) {
  const trophyScale = useSharedValue(1);

  useEffect(() => {
    trophyScale.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1,
      true,
    );
  }, [trophyScale]);

  const trophyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: trophyScale.value }],
  }));

  return (
    <View style={styles.root}>
      <SessionHubBackground />
      <ConfettiEffect />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.eyebrow}>SESSION 1 COMPLETE</Text>
          <Text style={styles.title}>Grip Adventure</Text>
          <Text style={styles.subtitle}>You visited all five creative studios!</Text>

          <Animated.View style={[styles.trophyWrap, trophyStyle]}>
            <Text style={styles.trophy}>🏆</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Free Hand Star</Text>
            </View>
          </Animated.View>

          <View style={styles.studiosGrid}>
            {STUDIOS.map((s, i) => (
              <View
                key={s.step}
                style={[
                  styles.studioChip,
                  { borderColor: s.border },
                  i < completed && styles.studioChipDone,
                ]}
              >
                <Text style={styles.chipIcon}>{s.icon}</Text>
                <Text style={styles.chipLabel} numberOfLines={1}>{s.title.split(' ')[0]}</Text>
                {i < completed ? <Text style={styles.chipCheck}>✓</Text> : null}
              </View>
            ))}
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Studios visited</Text>
              <Text style={styles.statValue}>{completed} / {totalSteps}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Gallery exhibit</Text>
              <Text style={styles.statValue}>
                {taskSuccess === null ? '—' : taskSuccess ? '✓ Hung' : 'Try again'}
              </Text>
            </View>
          </View>

          <View style={styles.starsRow}>
            {Array.from({ length: totalSteps }, (_, i) => (
              <Text key={i} style={[styles.star, i < completed && styles.starLit]}>
                {i < completed ? '⭐' : '☆'}
              </Text>
            ))}
          </View>

          {onExit ? (
            <Pressable
              style={({ pressed }) => [styles.exitBtn, pressed && styles.pressed]}
              onPress={onExit}
            >
              <Ionicons name="home-outline" size={20} color={HUB.bgTop} />
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
  scroll: {
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: HUB.gold,
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: HUB.textLight,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: HUB.textMuted,
    textAlign: 'center',
    marginBottom: 28,
  },
  trophyWrap: { alignItems: 'center', marginBottom: 28 },
  trophy: { fontSize: 72, marginBottom: 12 },
  badge: {
    backgroundColor: HUB.gold,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: HUB.goldLight,
  },
  badgeText: { fontSize: 18, fontWeight: '900', color: HUB.bgTop },
  studiosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
    width: '100%',
  },
  studioChip: {
    width: '30%',
    minWidth: 90,
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
  },
  studioChipDone: { backgroundColor: 'rgba(255,255,255,0.2)' },
  chipIcon: { fontSize: 24, marginBottom: 4 },
  chipLabel: { fontSize: 10, fontWeight: '700', color: HUB.textLight, textAlign: 'center' },
  chipCheck: { fontSize: 12, color: HUB.gold, marginTop: 2, fontWeight: '800' },
  statsCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: 20,
  },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statLabel: { fontSize: 15, fontWeight: '600', color: HUB.textMuted },
  statValue: { fontSize: 16, fontWeight: '800', color: HUB.textLight },
  statDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 12 },
  starsRow: { flexDirection: 'row', gap: 6, marginBottom: 28 },
  star: { fontSize: 28, opacity: 0.35 },
  starLit: { opacity: 1 },
  exitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: HUB.gold,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 18,
  },
  exitText: { fontSize: 17, fontWeight: '800', color: HUB.bgTop },
  pressed: { opacity: 0.9 },
});
