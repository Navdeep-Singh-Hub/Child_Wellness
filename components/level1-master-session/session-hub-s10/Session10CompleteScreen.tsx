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
import { HUB_S10, STUDIOS_S10, JOURNEY_MILESTONES } from './theme';

interface Session10CompleteProps {
  completed: number;
  totalSteps: number;
  taskSuccess: boolean | null;
  onExit?: () => void;
}

export function Session10CompleteScreen({
  completed,
  totalSteps,
  taskSuccess,
  onExit,
}: Session10CompleteProps) {
  const medal = useSharedValue(1);

  useEffect(() => {
    medal.value = withRepeat(
      withSequence(withTiming(1.12, { duration: 800 }), withTiming(1, { duration: 800 })),
      -1,
      true,
    );
  }, [medal]);

  const medalStyle = useAnimatedStyle(() => ({ transform: [{ scale: medal.value }] }));

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={{ flex: 1, backgroundColor: HUB_S10.bgMid }} />
      </View>
      <ConfettiEffect />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.eyebrow}>LEVEL 1 COMPLETE</Text>
          <Text style={styles.title}>Writing Master!</Text>
          <Text style={styles.subtitle}>You have mastered capital letter writing from A to Z</Text>
          <Animated.View style={[styles.trophyWrap, medalStyle]}>
            <Text style={styles.trophy}>👑</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Crown Earned</Text>
            </View>
          </Animated.View>
          <View style={styles.chips}>
            {STUDIOS_S10.map((s, i) => (
              <View key={s.step} style={[styles.chip, { borderColor: s.border }, i < completed && styles.chipDone]}>
                <Text style={styles.chipIcon}>{s.icon}</Text>
                {i < completed ? <Text style={styles.chipCheck}>✓</Text> : null}
              </View>
            ))}
          </View>
          <View style={styles.stats}>
            <Text style={styles.stat}>Studios: {completed} / {totalSteps}</Text>
            <Text style={styles.stat}>
              Royal Decree: {taskSuccess === null ? '—' : taskSuccess ? '✓ Verified' : 'Try again'}
            </Text>
          </View>
          <View style={styles.journeyBox}>
            <Text style={styles.journeyTitle}>Your Journey</Text>
            {JOURNEY_MILESTONES.map((m, i) => (
              <Text key={i} style={[styles.journeyItem, i === JOURNEY_MILESTONES.length - 1 && styles.journeyFinal]}>
                {m}
              </Text>
            ))}
          </View>
          {onExit ? (
            <Pressable style={({ pressed }) => [styles.exitBtn, pressed && styles.pressed]} onPress={onExit}>
              <Ionicons name="home-outline" size={20} color={HUB_S10.bgTop} />
              <Text style={styles.exitText}>Finish Level 1</Text>
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
  eyebrow: { fontSize: 11, fontWeight: '800', color: HUB_S10.accent, letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 30, fontWeight: '900', color: HUB_S10.textLight, marginBottom: 6 },
  subtitle: { fontSize: 16, color: HUB_S10.textMuted, marginBottom: 28, textAlign: 'center' },
  trophyWrap: { alignItems: 'center', marginBottom: 28 },
  trophy: { fontSize: 72, marginBottom: 12 },
  badge: {
    backgroundColor: HUB_S10.accent,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: HUB_S10.accentLight,
  },
  badgeText: { fontSize: 18, fontWeight: '900', color: HUB_S10.bgTop },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 24 },
  chip: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 2,
  },
  chipDone: { backgroundColor: 'rgba(255,255,255,0.15)' },
  chipIcon: { fontSize: 26 },
  chipCheck: { position: 'absolute', top: 2, right: 6, fontSize: 12, color: HUB_S10.accentLight, fontWeight: '800' },
  stats: { marginBottom: 20, alignItems: 'center', gap: 6 },
  stat: { fontSize: 16, fontWeight: '600', color: HUB_S10.textLight },
  journeyBox: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 18,
    width: '100%',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.25)',
  },
  journeyTitle: { fontSize: 15, fontWeight: '800', color: HUB_S10.accent, marginBottom: 10 },
  journeyItem: { fontSize: 13, color: HUB_S10.textMuted, marginBottom: 4 },
  journeyFinal: { fontWeight: '800', color: '#34D399', marginTop: 4 },
  exitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: HUB_S10.accent,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 18,
  },
  exitText: { fontSize: 17, fontWeight: '800', color: HUB_S10.bgTop },
  pressed: { opacity: 0.9 },
});
