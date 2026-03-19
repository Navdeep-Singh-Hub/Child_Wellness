/**
 * Level 9 (Clockwise) — Session 2: Number Pattern, Spot 5 Differences, Shape Rotation (pentagon), Bicycle Assembly
 * 4 games + 1 real-world task (same shape, different colors). Galaxy/indigo theme.
 */
import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NumberPatternLevel9Session2Game } from './NumberPatternLevel9Session2Game';
import { SpotTheDifference5Level9Session2Game } from './SpotTheDifference5Level9Session2Game';
import { ShapeRotationPentagonLevel9Session2Game } from './ShapeRotationPentagonLevel9Session2Game';
import { BicycleAssemblyLevel9Session2Game } from './BicycleAssemblyLevel9Session2Game';
import { Level9NotebookUploadSameShapeDifferentColors } from './Level9NotebookUploadSameShapeDifferentColors';

const TOTAL_STEPS = 6;
const DESIGN = {
  primary: '#6366F1',
  background: '#EEF2FF',
  primaryLight: 'rgba(99,102,241,0.12)',
};

interface Level9Session2Props {
  onExit?: () => void;
}

export function Level9Session2({ onExit }: Level9Session2Props = {}) {
  const [step, setStep] = useState(0);
  const [stars, setStars] = useState(0);
  const [taskCorrect, setTaskCorrect] = useState<boolean | null>(null);

  const advance = useCallback(() => {
    setStars((s) => Math.min(s + 1, TOTAL_STEPS));
    setStep((g) => Math.min(g + 1, 6));
  }, []);

  const handleTaskComplete = useCallback((correct: boolean) => {
    setTaskCorrect(correct);
    if (correct) setStars((s) => Math.min(s + 1, TOTAL_STEPS));
    setStep(6);
  }, []);

  const progressPct = step >= 1 && step <= 5 ? (step / TOTAL_STEPS) * 100 : 0;

  if (step === 0) {
    const cards = [
      { icon: '🔢', title: 'Number Pattern', desc: '2, 6, 10, 14, ?' },
      { icon: '🔍', title: 'Spot the Difference', desc: 'Find 5 differences' },
      { icon: '⬠', title: 'Shape Rotation', desc: 'Select the rotated pentagon' },
      { icon: '🚲', title: 'Build the Bicycle', desc: 'Drag pieces to assemble' },
    ];
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: DESIGN.background }]}>
        {onExit ? (
          <Pressable
            onPress={onExit}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={DESIGN.primary} />
            <Text style={[styles.backButtonText, { color: DESIGN.primary }]}>Back</Text>
          </Pressable>
        ) : null}
        <ScrollView contentContainerStyle={styles.introScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.mascotRow}>
            <Text style={styles.mascot}>🌌</Text>
            <Text style={styles.mascotHint}>Number pattern, spot 5 differences, find the rotated pentagon, and build a bicycle! Then show two objects that are the same shape but different colors.</Text>
          </View>
          <View style={styles.introHeader}>
            <Text style={[styles.introTitle, { color: DESIGN.primary }]}>Level 9 · Session 2</Text>
            <Text style={styles.introSub}>Clockwise · Galaxy · Session 2</Text>
            <Text style={styles.introDesc}>
              Number pattern, spot the difference, shape rotation, bicycle assembly, then a real-world photo task!
            </Text>
          </View>
          <View style={styles.cardsWrap}>
            {cards.map((card, i) => (
              <Pressable
                key={i}
                onPress={() => setStep(i + 1)}
                style={({ pressed }) => [
                  styles.introCard,
                  { borderColor: DESIGN.primary },
                  pressed && styles.introCardPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${card.title}. Tap to play.`}
              >
                <Text style={styles.introCardIcon}>{card.icon}</Text>
                <Text style={styles.introCardTitle}>{card.title}</Text>
                <Text style={styles.introCardDesc}>{card.desc}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={() => setStep(1)}
            style={({ pressed }) => [styles.startBtn, { backgroundColor: DESIGN.primary }, pressed && styles.pressed]}
            accessibilityLabel="Start first game"
          >
            <Text style={styles.startBtnText}>Start</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 6) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: DESIGN.background }]}>
        <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultEmoji}>🎉</Text>
          <Text style={[styles.resultTitle, { color: DESIGN.primary }]}>Great job!</Text>
          <View style={[styles.resultBadge, { borderColor: DESIGN.primary, backgroundColor: DESIGN.primaryLight }]}>
            <Text style={styles.resultBadgeStar}>⭐</Text>
            <Text style={styles.resultBadgeText}>Session 2 Complete</Text>
          </View>
          <View style={styles.resultStats}>
            <Text style={styles.resultStat}>Games completed: {stars}</Text>
            <Text style={styles.resultStat}>
              Real-world task: {taskCorrect === null ? '—' : taskCorrect ? '✓ SUCCESS' : 'Try again'}
            </Text>
          </View>
          <View style={styles.starsRow}>
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <Text key={i} style={[styles.star, i < stars && styles.starEarned]}>⭐</Text>
            ))}
          </View>
          {onExit ? (
            <TouchableOpacity style={[styles.backToGamesBtn, { backgroundColor: DESIGN.primary }]} onPress={onExit} activeOpacity={0.8}>
              <Text style={styles.backToGamesText}>Back to games</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: DESIGN.background }]}>
      <View style={[styles.header, { borderBottomColor: DESIGN.primary }]}>
        <Pressable
          onPress={goBack}
          style={({ pressed }) => [styles.backButtonHeader, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back one step"
        >
          <Ionicons name="arrow-back" size={24} color={DESIGN.primary} />
          <Text style={[styles.backButtonText, { color: DESIGN.primary }]}>Back</Text>
        </Pressable>
        <View style={styles.titleRow}>
          <Text style={styles.mascotSmall}>🌌</Text>
          <Text style={[styles.title, { color: DESIGN.primary }]}>Level 9 · Session 2</Text>
        </View>
        <Text style={styles.subtitle}>Clockwise · Galaxy · Session 2</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: DESIGN.primary }]} />
          </View>
          <Text style={[styles.progressText, { color: DESIGN.primary }]}>{step} / {TOTAL_STEPS}</Text>
        </View>
        <View style={styles.starsRow}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <Text key={i} style={[styles.star, i < stars && styles.starEarned]}>⭐</Text>
          ))}
        </View>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {step === 1 && <NumberPatternLevel9Session2Game onComplete={advance} />}
        {step === 2 && <SpotTheDifference5Level9Session2Game onComplete={advance} />}
        {step === 3 && <ShapeRotationPentagonLevel9Session2Game onComplete={advance} />}
        {step === 4 && <BicycleAssemblyLevel9Session2Game onComplete={advance} />}
        {step === 5 && <Level9NotebookUploadSameShapeDifferentColors onComplete={handleTaskComplete} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  backButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
    marginBottom: 4,
  },
  backButtonText: { fontSize: 17, fontWeight: '700' },
  mascotRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, paddingHorizontal: 4 },
  mascot: { fontSize: 40 },
  mascotHint: { fontSize: 16, color: '#4338CA', fontWeight: '600', flex: 1 },
  mascotSmall: { fontSize: 24, marginRight: 8 },
  header: {
    backgroundColor: DESIGN.background,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 3,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center', flex: 1 },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 4 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 12 },
  progressBg: { flex: 1, height: 14, backgroundColor: 'rgba(99,102,241,0.25)', borderRadius: 7, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 7 },
  progressText: { fontSize: 16, fontWeight: '700', minWidth: 48 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 6 },
  star: { fontSize: 24, opacity: 0.35 },
  starEarned: { opacity: 1 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 24 },
  introScroll: { flexGrow: 1, padding: 24, paddingBottom: 40 },
  introHeader: { marginBottom: 20 },
  introTitle: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  introSub: { fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 4 },
  introDesc: { fontSize: 18, color: '#475569', textAlign: 'center' },
  cardsWrap: { gap: 16, marginBottom: 32 },
  introCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  introCardPressed: { opacity: 0.9 },
  introCardIcon: { fontSize: 40 },
  introCardTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', flex: 1 },
  introCardDesc: { fontSize: 16, color: '#64748B' },
  startBtn: { paddingVertical: 18, borderRadius: 20, alignItems: 'center' },
  startBtnText: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  pressed: { opacity: 0.9 },
  resultScroll: { flexGrow: 1, padding: 24, alignItems: 'center', paddingBottom: 40 },
  resultEmoji: { fontSize: 72, marginBottom: 16 },
  resultTitle: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 20,
    borderWidth: 3,
    gap: 10,
    marginBottom: 24,
  },
  resultBadgeStar: { fontSize: 32 },
  resultBadgeText: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  resultStats: { marginBottom: 16 },
  resultStat: { fontSize: 18, color: '#334155', marginBottom: 4 },
  backToGamesBtn: { marginTop: 24, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12 },
  backToGamesText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
