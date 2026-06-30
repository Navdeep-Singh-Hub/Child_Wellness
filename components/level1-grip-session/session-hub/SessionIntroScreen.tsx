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
import { speak } from '@/utils/tts';
import { SessionHubBackground } from './SessionHubBackground';
import { StudioCard } from './StudioCard';
import { HUB, STUDIOS } from './theme';

interface SessionIntroScreenProps {
  totalSteps: number;
  completedSteps: Set<number>;
  onExit?: () => void;
  onSelectStudio: (step: number) => void;
}

export function SessionIntroScreen({
  totalSteps,
  completedSteps,
  onExit,
  onSelectStudio,
}: SessionIntroScreenProps) {
  const progress = completedSteps.size / totalSteps;
  const wand = useSharedValue(0);

  useEffect(() => {
    speak('Welcome to the Grip Adventure! Visit each creative studio.', 0.72);
    wand.value = withRepeat(
      withSequence(withTiming(8, { duration: 600 }), withTiming(-8, { duration: 600 })),
      -1,
      true,
    );
  }, [wand]);

  const wandStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wand.value}deg` }],
  }));

  const nextStudio = STUDIOS.find((s) => !completedSteps.has(s.step));

  return (
    <View style={styles.root}>
      <SessionHubBackground />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {onExit ? (
          <Pressable onPress={onExit} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <Ionicons name="arrow-back" size={22} color={HUB.textLight} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        ) : null}

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Animated.Text style={[styles.heroIcon, wandStyle]}>✏️</Animated.Text>
            <Text style={styles.eyebrow}>SPECIAL EDUCATION · EXPLORER</Text>
            <Text style={styles.title}>Grip Adventure</Text>
            <Text style={styles.subtitle}>Session 1 · Free Hand Control</Text>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Journey Progress</Text>
              <Text style={styles.progressCount}>{completedSteps.size} / {totalSteps}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            {nextStudio ? (
              <Pressable
                style={({ pressed }) => [styles.continueBtn, pressed && styles.pressed]}
                onPress={() => onSelectStudio(nextStudio.step)}
              >
                <Text style={styles.continueText}>
                  Continue → {nextStudio.title}
                </Text>
              </Pressable>
            ) : (
              <Text style={styles.allDone}>All studios complete! 🎉</Text>
            )}
          </View>

          <Text style={styles.sectionLabel}>CREATIVE STUDIOS</Text>
          {STUDIOS.map((studio) => (
            <StudioCard
              key={studio.step}
              studio={studio}
              completed={completedSteps.has(studio.step)}
              onPress={() => onSelectStudio(studio.step)}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  backText: { fontSize: 16, fontWeight: '700', color: HUB.textLight },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 24 },
  heroIcon: { fontSize: 48, marginBottom: 12 },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: HUB.gold,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: HUB.textLight,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: { fontSize: 15, color: HUB.textMuted, textAlign: 'center' },
  progressCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressLabel: { fontSize: 13, fontWeight: '700', color: HUB.textMuted },
  progressCount: { fontSize: 15, fontWeight: '900', color: HUB.gold },
  progressTrack: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
    backgroundColor: HUB.gold,
    borderRadius: 5,
  },
  continueBtn: {
    backgroundColor: HUB.gold,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueText: { fontSize: 14, fontWeight: '800', color: HUB.bgTop },
  allDone: {
    fontSize: 14,
    fontWeight: '700',
    color: HUB.goldLight,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: HUB.textMuted,
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  pressed: { opacity: 0.88 },
});
