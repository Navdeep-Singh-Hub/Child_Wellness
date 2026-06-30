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
import { StudioCard } from '@/components/level1-grip-session/session-hub/StudioCard';
import { HUB_S6, STUDIOS_S6 } from './theme';

function S6HubBg() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ flex: 1, backgroundColor: HUB_S6.bgTop }} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(52,211,153,0.1)' }]} />
    </View>
  );
}

interface Session6IntroProps {
  totalSteps: number;
  completedSteps: Set<number>;
  onExit?: () => void;
  onSelectStudio: (step: number) => void;
}

export function Session6IntroScreen({
  totalSteps,
  completedSteps,
  onExit,
  onSelectStudio,
}: Session6IntroProps) {
  const progress = completedSteps.size / totalSteps;
  const pulse = useSharedValue(1);

  useEffect(() => {
    speak('Welcome to the A to Z Expedition! Let us master every letter with strong guidance.', 0.72);
    pulse.value = withRepeat(
      withSequence(withTiming(1.06, { duration: 700 }), withTiming(1, { duration: 700 })),
      -1,
      true,
    );
  }, [pulse]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const nextStudio = STUDIOS_S6.find((s) => !completedSteps.has(s.step));

  return (
    <View style={styles.root}>
      <S6HubBg />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {onExit ? (
          <Pressable onPress={onExit} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <Ionicons name="arrow-back" size={22} color={HUB_S6.textLight} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        ) : null}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Animated.Text style={[styles.heroIcon, iconStyle]}>🅰️</Animated.Text>
            <Text style={styles.eyebrow}>SESSION 6 · FULL A–Z TRACING</Text>
            <Text style={styles.title}>A–Z Expedition</Text>
            <Text style={styles.subtitle}>Guided tracing from A to Z</Text>
          </View>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Expedition Progress</Text>
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
                <Text style={styles.continueText}>Continue → {nextStudio.title}</Text>
              </Pressable>
            ) : (
              <Text style={styles.allDone}>All camps explored! 🏆</Text>
            )}
          </View>
          <Text style={styles.sectionLabel}>TRACING CAMPS</Text>
          {STUDIOS_S6.map((studio) => (
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
  root: { flex: 1, backgroundColor: HUB_S6.bgTop },
  safe: { flex: 1 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 10 },
  backText: { fontSize: 16, fontWeight: '700', color: HUB_S6.textLight },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 24 },
  heroIcon: { fontSize: 48, marginBottom: 12 },
  eyebrow: { fontSize: 10, fontWeight: '800', color: HUB_S6.accent, letterSpacing: 1.2, marginBottom: 6 },
  title: { fontSize: 30, fontWeight: '900', color: HUB_S6.textLight, marginBottom: 4 },
  subtitle: { fontSize: 15, color: HUB_S6.textMuted },
  progressCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.25)',
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { fontSize: 13, fontWeight: '700', color: HUB_S6.textMuted },
  progressCount: { fontSize: 15, fontWeight: '900', color: HUB_S6.accent },
  progressTrack: { height: 10, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 5, overflow: 'hidden', marginBottom: 14 },
  progressFill: { height: '100%', backgroundColor: HUB_S6.accent, borderRadius: 5 },
  continueBtn: { backgroundColor: HUB_S6.accent, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  continueText: { fontSize: 14, fontWeight: '800', color: HUB_S6.bgTop },
  allDone: { fontSize: 14, fontWeight: '700', color: HUB_S6.accentLight, textAlign: 'center' },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: HUB_S6.textMuted, letterSpacing: 1.2, marginBottom: 12 },
  pressed: { opacity: 0.88 },
});
