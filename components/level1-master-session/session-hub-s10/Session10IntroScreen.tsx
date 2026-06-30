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
import { HUB_S10, STUDIOS_S10 } from './theme';

function S10HubBg() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ flex: 1, backgroundColor: HUB_S10.bgTop }} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(251,191,36,0.12)' }]} />
    </View>
  );
}

interface Session10IntroProps {
  totalSteps: number;
  completedSteps: Set<number>;
  onExit?: () => void;
  onSelectStudio: (step: number) => void;
}

export function Session10IntroScreen({
  totalSteps,
  completedSteps,
  onExit,
  onSelectStudio,
}: Session10IntroProps) {
  const progress = completedSteps.size / totalSteps;
  const pulse = useSharedValue(1);

  useEffect(() => {
    speak('Welcome to Crown Hall! The final session — prove you are a writing master!', 0.72);
    pulse.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 700 }), withTiming(1, { duration: 700 })),
      -1,
      true,
    );
  }, [pulse]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const nextStudio = STUDIOS_S10.find((s) => !completedSteps.has(s.step));

  return (
    <View style={styles.root}>
      <S10HubBg />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {onExit ? (
          <Pressable onPress={onExit} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <Ionicons name="arrow-back" size={22} color={HUB_S10.textLight} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        ) : null}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Animated.Text style={[styles.heroIcon, iconStyle]}>👑</Animated.Text>
            <Text style={styles.eyebrow}>SESSION 10 · LEVEL 1 FINALE</Text>
            <Text style={styles.title}>Crown Hall</Text>
            <Text style={styles.subtitle}>The final test of your writing mastery</Text>
            <View style={styles.finaleBadge}>
              <Text style={styles.finaleBadgeText}>🏆 LEVEL 1 FINALE 🏆</Text>
            </View>
          </View>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Crown Progress</Text>
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
              <Text style={styles.allDone}>All crowns earned! 👑</Text>
            )}
          </View>
          <Text style={styles.sectionLabel}>MASTER STUDIOS</Text>
          {STUDIOS_S10.map((studio) => (
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
  root: { flex: 1, backgroundColor: HUB_S10.bgTop },
  safe: { flex: 1 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 10 },
  backText: { fontSize: 16, fontWeight: '700', color: HUB_S10.textLight },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 24 },
  heroIcon: { fontSize: 52, marginBottom: 12 },
  eyebrow: { fontSize: 10, fontWeight: '800', color: HUB_S10.accent, letterSpacing: 1.2, marginBottom: 6 },
  title: { fontSize: 32, fontWeight: '900', color: HUB_S10.textLight, marginBottom: 4 },
  subtitle: { fontSize: 15, color: HUB_S10.textMuted, marginBottom: 12 },
  finaleBadge: {
    backgroundColor: 'rgba(251,191,36,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: HUB_S10.accent,
  },
  finaleBadgeText: { fontSize: 14, fontWeight: '900', color: HUB_S10.accent },
  progressCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.25)',
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { fontSize: 13, fontWeight: '700', color: HUB_S10.textMuted },
  progressCount: { fontSize: 15, fontWeight: '900', color: HUB_S10.accent },
  progressTrack: { height: 10, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 5, overflow: 'hidden', marginBottom: 14 },
  progressFill: { height: '100%', backgroundColor: HUB_S10.accent, borderRadius: 5 },
  continueBtn: { backgroundColor: HUB_S10.accent, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  continueText: { fontSize: 14, fontWeight: '800', color: HUB_S10.bgTop },
  allDone: { fontSize: 14, fontWeight: '700', color: HUB_S10.accentLight, textAlign: 'center' },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: HUB_S10.textMuted, letterSpacing: 1.2, marginBottom: 12 },
  pressed: { opacity: 0.88 },
});
