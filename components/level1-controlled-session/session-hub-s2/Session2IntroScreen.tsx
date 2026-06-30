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
import { HUB_S2, STUDIOS_S2 } from './theme';

/** Teal-tinted hub background for Session 2 */
function S2HubBg() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ flex: 1, backgroundColor: HUB_S2.bgTop }} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(13,148,136,0.35)' }]} />
    </View>
  );
}

interface Session2IntroProps {
  totalSteps: number;
  completedSteps: Set<number>;
  onExit?: () => void;
  onSelectStudio: (step: number) => void;
}

export function Session2IntroScreen({
  totalSteps,
  completedSteps,
  onExit,
  onSelectStudio,
}: Session2IntroProps) {
  const progress = completedSteps.size / totalSteps;
  const pulse = useSharedValue(1);

  useEffect(() => {
    speak('Welcome to the Boundary Quest! Stay inside each shape.', 0.72);
    pulse.value = withRepeat(
      withSequence(withTiming(1.06, { duration: 700 }), withTiming(1, { duration: 700 })),
      -1,
      true,
    );
  }, [pulse]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const nextStudio = STUDIOS_S2.find((s) => !completedSteps.has(s.step));

  return (
    <View style={styles.root}>
      <S2HubBg />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {onExit ? (
          <Pressable onPress={onExit} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <Ionicons name="arrow-back" size={22} color={HUB_S2.textLight} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        ) : null}

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Animated.Text style={[styles.heroIcon, iconStyle]}>🎯</Animated.Text>
            <Text style={styles.eyebrow}>SESSION 2 · CONTROLLED SCRIBBLING</Text>
            <Text style={styles.title}>Boundary Quest</Text>
            <Text style={styles.subtitle}>Learn to stay inside the lines</Text>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Precision Progress</Text>
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
              <Text style={styles.allDone}>All studios mastered! 🏆</Text>
            )}
          </View>

          <Text style={styles.sectionLabel}>PRECISION STUDIOS</Text>
          {STUDIOS_S2.map((studio) => (
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
  root: { flex: 1, backgroundColor: HUB_S2.bgTop },
  safe: { flex: 1 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 10 },
  backText: { fontSize: 16, fontWeight: '700', color: HUB_S2.textLight },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 24 },
  heroIcon: { fontSize: 48, marginBottom: 12 },
  eyebrow: { fontSize: 10, fontWeight: '800', color: HUB_S2.accent, letterSpacing: 1.2, marginBottom: 6 },
  title: { fontSize: 30, fontWeight: '900', color: HUB_S2.textLight, marginBottom: 4 },
  subtitle: { fontSize: 15, color: HUB_S2.textMuted },
  progressCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(45,212,191,0.25)',
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { fontSize: 13, fontWeight: '700', color: HUB_S2.textMuted },
  progressCount: { fontSize: 15, fontWeight: '900', color: HUB_S2.accent },
  progressTrack: { height: 10, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 5, overflow: 'hidden', marginBottom: 14 },
  progressFill: { height: '100%', backgroundColor: HUB_S2.accent, borderRadius: 5 },
  continueBtn: { backgroundColor: HUB_S2.accent, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  continueText: { fontSize: 14, fontWeight: '800', color: HUB_S2.bgTop },
  allDone: { fontSize: 14, fontWeight: '700', color: HUB_S2.accentLight, textAlign: 'center' },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: HUB_S2.textMuted, letterSpacing: 1.2, marginBottom: 12 },
  pressed: { opacity: 0.88 },
});
