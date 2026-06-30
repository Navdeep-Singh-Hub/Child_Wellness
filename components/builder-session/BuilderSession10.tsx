/**
 * Level 3 Builder — Session 10 (FINAL): Mixed Quiz, Memory Advanced, Word Builder, Drag Pattern
 * Flow: Intro → Game 1 (Mixed Quiz) → Game 2 (Memory Advanced) → Game 3 (Word Builder) → Game 4 (Drag Pattern) → Real World Task (Three in Line) → Result + celebration + unlock next level
 */
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MixedQuizGame } from './MixedQuizGame';
import { MemoryAdvancedGame } from './MemoryAdvancedGame';
import { WordBuilderGame } from './WordBuilderGame';
import { DragPatternGame } from './DragPatternGame';
import { BuilderNotebookUploadThreeInLine } from './BuilderNotebookUploadThreeInLine';

const TOTAL_STEPS = 6;
const DESIGN = {
  primary: '#8B5CF6',
  success: '#22C55E',
  background: '#F5F3FF',
  primaryLight: '#EDE9FE',
};

interface BuilderSession10Props {
  onExit?: () => void;
}

export function BuilderSession10({ onExit }: BuilderSession10Props = {}) {
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
      { icon: '❓', title: 'Mixed Quiz', desc: 'Choose correct object' },
      { icon: '🎴', title: 'Memory Advanced', desc: 'Match 6 cards' },
      { icon: '⚽', title: 'Word Builder', desc: 'Build word BALL' },
      { icon: '🔁', title: 'Drag Pattern', desc: 'Complete pattern sequence' },
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
          <View style={styles.introHeader}>
            <Text style={[styles.introTitle, { color: DESIGN.primary }]}>Builder Final Challenge</Text>
            <Text style={styles.introSub}>Session 10 · The Builder · Final Session</Text>
            <Text style={styles.introDesc}>Play 4 games, then arrange three objects in a line!</Text>
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
          <Text style={styles.resultEmoji}>🏆</Text>
          <Text style={[styles.resultTitle, { color: DESIGN.primary }]}>Builder Master!</Text>
          <View style={[styles.resultBadge, { borderColor: DESIGN.primary, backgroundColor: DESIGN.primaryLight }]}>
            <Text style={styles.resultBadgeStar}>⭐</Text>
            <Text style={styles.resultBadgeText}>You completed all Builder sessions!</Text>
          </View>
          <Text style={styles.unlockText}>Next level unlocked!</Text>
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

  const goBack = () => {
    if (onExit) {
      onExit();
      return;
    }
    setStep((s) => Math.max(0, s - 1));
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: DESIGN.background }]}>
      <View style={[styles.header, { borderBottomColor: DESIGN.primary }]}>
        <Pressable
          onPress={goBack}
          style={({ pressed }) => [styles.backButtonHeader, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back to sessions"
        >
          <Ionicons name="arrow-back" size={24} color={DESIGN.primary} />
          <Text style={[styles.backButtonText, { color: DESIGN.primary }]}>Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: DESIGN.primary }]}>Builder Final Challenge</Text>
        <Text style={styles.subtitle}>Session 10 · The Builder · Final</Text>
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
        {step === 1 && <MixedQuizGame onComplete={advance} />}
        {step === 2 && <MemoryAdvancedGame onComplete={advance} />}
        {step === 3 && <WordBuilderGame onComplete={advance} />}
        {step === 4 && <DragPatternGame onComplete={advance} />}
        {step === 5 && <BuilderNotebookUploadThreeInLine onComplete={handleTaskComplete} />}
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
  header: {
    backgroundColor: DESIGN.background,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 3,
  },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 4 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 12 },
  progressBg: { flex: 1, height: 14, backgroundColor: '#E5E7EB', borderRadius: 7, overflow: 'hidden' },
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
  introSub: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 4 },
  introDesc: { fontSize: 18, color: '#4b5563', textAlign: 'center' },
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
  introCardTitle: { fontSize: 20, fontWeight: '800', color: '#1f2937', flex: 1 },
  introCardDesc: { fontSize: 16, color: '#6b7280' },
  startBtn: {
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
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
    marginBottom: 12,
  },
  resultBadgeStar: { fontSize: 32 },
  resultBadgeText: { fontSize: 18, fontWeight: '800', color: '#1f2937', textAlign: 'center', flex: 1 },
  unlockText: { fontSize: 20, fontWeight: '800', color: DESIGN.success, marginBottom: 20 },
  resultStats: { marginBottom: 16 },
  resultStat: { fontSize: 18, color: '#374151', marginBottom: 4 },
  backToGamesBtn: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  backToGamesText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
