/**
 * Level 10 – The Graduate, Session 7: Real Life Problems
 * Flow: Intro → Game 1 (Story Comprehension) → Game 2 (Conversation) → Game 3 (Word Problem) → Game 4 (Pattern) → Notebook → Result
 * AAC-friendly: clear, predictable, sensory-friendly.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getLastCompletedGameIndex, markSessionGameComplete } from '@/components/special-education/shared/useSessionIntroProgress';
import { StoryQuestionPencils } from './StoryQuestionPencils';
import { ConversationCompleteBorrowPencil } from './ConversationCompleteBorrowPencil';
import { WordProblemPencils } from './WordProblemPencils';
import { PatternPuzzleBlueGreen } from './PatternPuzzleBlueGreen';
import { RealLifeProblemsNotebookUpload } from './RealLifeProblemsNotebookUpload';

const TOTAL_GAMES = 5;
const GAME_COUNT = 4;
const SECTION_NUMBER = 10;
const SESSION_NUMBER = 7;
const BG = '#F3F4F6';
const GRADUATE_COLOR = '#4F46E5';

interface RealLifeProblemsSession7Props {
  onExit?: () => void;
}

export function RealLifeProblemsSession7({ onExit }: RealLifeProblemsSession7Props = {}) {
  const [step, setStep] = useState(0);
  const [stars, setStars] = useState(0);
  const [notebookCorrect, setNotebookCorrect] = useState<boolean | null>(null);
  const [lastCompletedGameIndex, setLastCompletedGameIndex] = useState(0);

  useEffect(() => {
    if (step === 0) {
      getLastCompletedGameIndex(SECTION_NUMBER, SESSION_NUMBER, GAME_COUNT).then(setLastCompletedGameIndex);
    }
  }, [step]);

  const advance = useCallback(async () => {
    const currentStep = step;
    setStars((s) => Math.min(s + 1, TOTAL_GAMES));
    setStep((g) => Math.min(g + 1, 6));
    if (currentStep >= 1 && currentStep <= GAME_COUNT) {
      await markSessionGameComplete(SECTION_NUMBER, SESSION_NUMBER, currentStep);
      setLastCompletedGameIndex((prev) => Math.max(prev, currentStep));
    }
  }, [step]);

  const handleNotebookComplete = useCallback((correct: boolean) => {
    setNotebookCorrect(correct);
    if (correct) setStars((s) => Math.min(s + 1, TOTAL_GAMES));
    setStep(6);
  }, []);

  if (step === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        {onExit ? (
          <Pressable
            onPress={onExit}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={GRADUATE_COLOR} />
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        ) : null}
        <ScrollView contentContainerStyle={styles.introScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.introHeader}>
            <Text style={styles.introTitle}>Real Life Problems</Text>
            <Text style={styles.introSub}>Let's solve problems from everyday life.</Text>
            <Text style={styles.introSkills}>Story · Conversation · Addition · Patterns</Text>
          </View>
          <View style={styles.cardsWrap}>
            {[
              { icon: '📖', title: 'Understand the story', desc: 'What does the child have?' },
              { icon: '💬', title: 'Finish the conversation', desc: 'Can I borrow a pencil?' },
              { icon: '✏️', title: 'Solve the story', desc: '7 pencils + 2 more' },
              { icon: '🔢', title: 'Complete the pattern', desc: '🟦 🟩 🟦 🟩 __' },
            ].map((card, i) => {
              const gameNum = i + 1;
              const unlocked = lastCompletedGameIndex >= i;
              return (
                <Pressable
                  key={i}
                  onPress={() => unlocked && setStep(gameNum)}
                  style={({ pressed }) => [
                    styles.introCard,
                    !unlocked && styles.introCardLocked,
                    unlocked && pressed && styles.introCardPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={unlocked ? `${card.title}. Tap to play.` : `${card.title}. Complete game ${gameNum - 1} first.`}
                  accessibilityState={{ disabled: !unlocked }}
                >
                  <Text style={styles.introCardIcon}>{card.icon}</Text>
                  <Text style={[styles.introCardTitle, !unlocked && styles.introCardTextLocked]}>{card.title}</Text>
                  <Text style={[styles.introCardDesc, !unlocked && styles.introCardTextLocked]}>{card.desc}</Text>
                  {!unlocked && (
                    <View style={styles.introCardLockBadge}>
                      <Ionicons name="lock-closed" size={20} color="#94A3B8" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
          {(() => {
            const nextStep = Math.min(lastCompletedGameIndex + 1, 5);
            const startLabel = nextStep <= GAME_COUNT ? `Start Game ${nextStep}` : 'Notebook';
            return (
              <Pressable
                onPress={() => setStep(nextStep)}
                style={({ pressed }) => [styles.startBtn, pressed && styles.pressed]}
                accessibilityLabel={nextStep === 1 ? 'Start first game' : `Start game ${nextStep}`}
              >
                <Text style={styles.startBtnText}>{nextStep === 1 ? 'Start' : startLabel}</Text>
              </Pressable>
            );
          })()}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 6) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultTitle}>Great job solving real-life problems!</Text>
          <View style={styles.resultBadge}>
            <Text style={styles.resultBadgeEmoji}>⭐</Text>
            <Text style={styles.resultBadgeText}>Problem Solver</Text>
          </View>
          <View style={styles.resultStats}>
            <Text style={styles.resultStat}>Games completed: {stars}</Text>
            <Text style={styles.resultStat}>
              Notebook: {notebookCorrect === null ? '—' : notebookCorrect ? '✓ Done' : 'Try again'}
            </Text>
          </View>
          <View style={styles.starsRow}>
            {Array.from({ length: TOTAL_GAMES }, (_, i) => (
              <Text key={i} style={styles.star}>{i < stars ? '⭐' : '☆'}</Text>
            ))}
          </View>
          {onExit && (
            <Pressable
              onPress={onExit}
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
              accessibilityLabel="Back to sessions"
            >
              <Text style={styles.backBtnText}>Back to sessions</Text>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const goBack = () => setStep((s) => Math.max(0, s - 1));
  return (
    <SafeAreaView style={styles.safe}>
      <Pressable
        onPress={goBack}
        style={({ pressed }) => [styles.backButtonHeader, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Go back one step"
      >
        <Ionicons name="arrow-back" size={24} color={GRADUATE_COLOR} />
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
      {step === 1 && <StoryQuestionPencils onComplete={advance} />}
      {step === 2 && <ConversationCompleteBorrowPencil onComplete={advance} />}
      {step === 3 && <WordProblemPencils onComplete={advance} />}
      {step === 4 && <PatternPuzzleBlueGreen onComplete={advance} />}
      {step === 5 && <RealLifeProblemsNotebookUpload onComplete={handleNotebookComplete} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
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
  backButtonText: { fontSize: 17, fontWeight: '700', color: GRADUATE_COLOR },
  introScroll: { padding: 24, paddingBottom: 48, alignItems: 'center' },
  introHeader: { alignItems: 'center', marginBottom: 28 },
  introTitle: { fontSize: 26, fontWeight: '800', color: GRADUATE_COLOR, marginBottom: 8 },
  introSub: { fontSize: 18, color: '#374151', marginBottom: 8 },
  introSkills: { fontSize: 14, color: '#6B7280' },
  cardsWrap: { width: '100%', gap: 12, marginBottom: 28 },
  introCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  introCardLocked: { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1', opacity: 0.9 },
  introCardPressed: { opacity: 0.9 },
  introCardTextLocked: { color: '#94A3B8' },
  introCardLockBadge: { marginLeft: 'auto', padding: 6 },
  introCardIcon: { fontSize: 36 },
  introCardTitle: { fontSize: 18, fontWeight: '800', color: '#1f2937', flex: 1 },
  introCardDesc: { fontSize: 14, color: '#6B7280' },
  startBtn: {
    backgroundColor: GRADUATE_COLOR,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 16,
  },
  pressed: { opacity: 0.9 },
  startBtnText: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  resultScroll: { padding: 24, alignItems: 'center', paddingBottom: 48 },
  resultTitle: { fontSize: 22, fontWeight: '800', color: '#374151', marginBottom: 24, textAlign: 'center' },
  resultBadge: {
    backgroundColor: '#EDE9FE',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderWidth: 3,
    borderColor: GRADUATE_COLOR,
    alignItems: 'center',
    marginBottom: 24,
  },
  resultBadgeEmoji: { fontSize: 48, marginBottom: 8 },
  resultBadgeText: { fontSize: 20, fontWeight: '800', color: GRADUATE_COLOR },
  resultStats: { marginBottom: 16 },
  resultStat: { fontSize: 16, color: '#374151', marginBottom: 4 },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  star: { fontSize: 28 },
  backBtn: {
    backgroundColor: GRADUATE_COLOR,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  backBtnText: { fontSize: 18, fontWeight: '700', color: '#FFF' },
});
