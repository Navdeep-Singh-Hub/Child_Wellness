/**
 * Level 6 – The Logic Lab, Session 8: Pattern Builder
 * Flow: Intro → Game 1 (Preposition sentence) → Game 2 (Drag positions) → Game 3 (Build pattern) → Game 4 (Sequence) → Notebook → Result
 * AAC-friendly: clear, structured, sensory-friendly.
 */
import React, { useCallback, useEffect, useState } from 'react';
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
import { getLastCompletedGameIndex, markSessionGameComplete } from '@/components/special-education/shared/useSessionIntroProgress';
import { PrepositionSentenceGame } from './PrepositionSentenceGame';
import { DragPositionPatternBuilder } from './DragPositionPatternBuilder';
import { PatternBuilderGame } from './PatternBuilderGame';
import { SequencePuzzlePatternBuilder } from './SequencePuzzlePatternBuilder';
import { PatternBuilderNotebookUpload } from './PatternBuilderNotebookUpload';

const TOTAL_GAMES = 5;
const GAME_COUNT = 4;
const SECTION_NUMBER = 6;
const SESSION_NUMBER = 8;
const PRIMARY = '#4F46E5';
const SUCCESS = '#22C55E';
const BG = '#F3F4F6';

interface PatternBuilderSession8Props {
  onExit?: () => void;
}

export function PatternBuilderSession8({ onExit }: PatternBuilderSession8Props = {}) {
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

  const progressPct = step >= 1 && step <= 5 ? (step / TOTAL_GAMES) * 100 : 0;

  if (step === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.introScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.introHeader}>
            <Text style={styles.introTitle}>Pattern Builder</Text>
            <Text style={styles.introSub}>Let's practice positions and build patterns.</Text>
          </View>
          <View style={styles.cardsWrap}>
            {[
              { icon: '📝', title: 'Find the position word', desc: 'Complete the sentence' },
              { icon: '📦', title: 'Place the object correctly', desc: 'Ball, cup, cat' },
              { icon: '🔴', title: 'Build the pattern', desc: 'Complete the pattern' },
              { icon: '🪥', title: 'Put the actions in order', desc: 'Wash hands' },
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
          <Text style={styles.resultTitle}>Great job building patterns!</Text>
          <View style={styles.resultBadge}>
            <Text style={styles.resultBadgeEmoji}>⭐</Text>
            <Text style={styles.resultBadgeText}>Pattern Builder</Text>
          </View>
          <View style={styles.resultStats}>
            <Text style={styles.resultStat}>Games completed: {stars}</Text>
            <Text style={styles.resultStat}>
              Notebook: {notebookCorrect === null ? '—' : notebookCorrect ? '✓ Done' : 'Try again'}
            </Text>
          </View>
          <View style={styles.starsRow}>
            {Array.from({ length: TOTAL_GAMES }, (_, i) => (
              <Text key={i} style={[styles.star, i < stars && styles.starEarned]}>⭐</Text>
            ))}
          </View>
          {onExit ? (
            <TouchableOpacity style={styles.backBtn} onPress={onExit} activeOpacity={0.8}>
              <Text style={styles.backBtnText}>Back to sessions</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Pattern Builder</Text>
        <Text style={styles.subtitle}>Logic Lab · Session 8</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.progressText}>{step} / {TOTAL_GAMES}</Text>
        </View>
        <View style={styles.starsRow}>
          {Array.from({ length: TOTAL_GAMES }, (_, i) => (
            <Text key={i} style={[styles.star, i < stars && styles.starEarned]}>⭐</Text>
          ))}
        </View>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {step === 1 && <PrepositionSentenceGame onComplete={advance} />}
        {step === 2 && <DragPositionPatternBuilder onComplete={advance} />}
        {step === 3 && <PatternBuilderGame onComplete={advance} />}
        {step === 4 && <SequencePuzzlePatternBuilder onComplete={advance} />}
        {step === 5 && <PatternBuilderNotebookUpload onComplete={handleNotebookComplete} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 3,
    borderBottomColor: PRIMARY,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#3730A3', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#4F46E5', textAlign: 'center', marginTop: 4 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 12 },
  progressBg: { flex: 1, height: 14, backgroundColor: '#C7D2FE', borderRadius: 7, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: PRIMARY, borderRadius: 7 },
  progressText: { fontSize: 16, fontWeight: '700', color: '#3730A3', minWidth: 48 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 6 },
  star: { fontSize: 24, opacity: 0.35 },
  starEarned: { opacity: 1 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 24 },
  introScroll: { flexGrow: 1, padding: 24, paddingBottom: 40 },
  introHeader: { marginBottom: 24 },
  introTitle: { fontSize: 28, fontWeight: '800', color: '#3730A3', textAlign: 'center', marginBottom: 12 },
  introSub: { fontSize: 18, color: '#4F46E5', textAlign: 'center', lineHeight: 26 },
  cardsWrap: { gap: 16, marginBottom: 28 },
  introCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 3,
    borderColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  introCardLocked: { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1', opacity: 0.9 },
  introCardPressed: { opacity: 0.9 },
  introCardTextLocked: { color: '#94A3B8' },
  introCardLockBadge: { marginLeft: 'auto', padding: 6 },
  introCardIcon: { fontSize: 36 },
  introCardTitle: { fontSize: 20, fontWeight: '800', color: '#1f2937', flex: 1 },
  introCardDesc: { fontSize: 16, color: '#6b7280' },
  startBtn: {
    backgroundColor: PRIMARY,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  startBtnText: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  pressed: { opacity: 0.9 },
  resultScroll: { flexGrow: 1, padding: 24, alignItems: 'center', paddingBottom: 40 },
  resultTitle: { fontSize: 24, fontWeight: '800', color: '#3730A3', textAlign: 'center', marginBottom: 24 },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: SUCCESS,
    gap: 10,
    marginBottom: 24,
  },
  resultBadgeEmoji: { fontSize: 32 },
  resultBadgeText: { fontSize: 20, fontWeight: '800', color: '#166534' },
  resultStats: { marginBottom: 16 },
  resultStat: { fontSize: 18, color: '#374151', marginBottom: 4 },
  backBtn: {
    marginTop: 24,
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  backBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
