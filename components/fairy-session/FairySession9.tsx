/**
 * FairySession9 — Special Ed Level 2 · Session 9: Fairy Tale Forest
 * Flow: Intro → Game 1 (Find Fairy Tale Sounds) → Game 2 (I Spy Fairy Rhymes) → Game 3 (Clap Magical Words) → Game 4 (Frog Lily-Pad Maze) → Notebook → Result
 * Design: Forest Green #16A34A, Magic Purple #9333EA, Golden Glow #FACC15. Storybook fairy-tale, touch-friendly.
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
import { FairyCleanUp } from './FairyCleanUp';
import { FairyRhymeGame } from './FairyRhymeGame';
import { FairySyllableGame } from './FairySyllableGame';
import { FairyDotMaze } from './FairyDotMaze';
import { FairyNotebookUpload } from './FairyNotebookUpload';

const TOTAL_GAMES = 5;
const GAME_COUNT = 4;
const SECTION_NUMBER = 2;
const SESSION_NUMBER = 9;
const FOREST_GREEN = '#16A34A';
const MAGIC_PURPLE = '#9333EA';
const GOLDEN_GLOW = '#FACC15';

interface FairySession9Props {
  onExit?: () => void;
}

export function FairySession9({ onExit }: FairySession9Props = {}) {
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
    const cards = [
      { icon: '🧙', title: 'Find the Fairy Tale Sounds', desc: 'Initial sound /p/' },
      { icon: '👀', title: 'I Spy Fairy Rhymes', desc: 'Rhyming hunt' },
      { icon: '👏', title: 'Clap the Magical Words', desc: 'Syllables' },
      { icon: '🐸', title: 'Frog Lily-Pad Maze', desc: 'Count dots 1–12' },
    ];
    const nextStep = Math.min(lastCompletedGameIndex + 1, 5);
    const startLabel = nextStep <= 4 ? `Start Game ${nextStep}` : 'Notebook';
    return (
      <SafeAreaView style={styles.safe}>
        {onExit ? (
          <Pressable
            onPress={onExit}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#BE185D" />
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        ) : null}
        <ScrollView contentContainerStyle={styles.introScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.introHeader}>
            <Text style={styles.introTitle}>Fairy Tale Forest</Text>
            <Text style={styles.introSub}>
              Enter the magical forest and solve sound and counting challenges!
            </Text>
          </View>
          <View style={styles.cardsWrap}>
            {cards.map((card, i) => {
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
          <Pressable
            onPress={() => setStep(nextStep)}
            style={({ pressed }) => [styles.startBtn, pressed && styles.pressed]}
            accessibilityLabel={nextStep === 1 ? 'Start first game' : `Start game ${nextStep}`}
          >
            <Text style={styles.startBtnText}>{nextStep === 1 ? 'Start' : startLabel}</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 6) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.firefliesRow}>
            {['🧙', '✨', '🍄', '🐸', '⭐', '✨'].map((e, i) => (
              <Text key={i} style={styles.fireflyEmoji}>{e}</Text>
            ))}
          </View>
          <Text style={styles.resultTitle}>You explored the magical forest and learned amazing skills!</Text>
          <View style={styles.resultBadge}>
            <Text style={styles.resultBadgeEmoji}>🧙</Text>
            <Text style={styles.resultBadgeText}>Forest Magic Badge</Text>
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
            <TouchableOpacity style={styles.backToGamesBtn} onPress={onExit} activeOpacity={0.8}>
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
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          onPress={goBack}
          style={({ pressed }) => [styles.backButtonHeader, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back to sessions"
        >
          <Ionicons name="arrow-back" size={24} color="#BE185D" />
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Fairy Tale Forest</Text>
        <Text style={styles.subtitle}>Session 9</Text>
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
        {step === 1 && <FairyCleanUp onComplete={advance} />}
        {step === 2 && <FairyRhymeGame onComplete={advance} />}
        {step === 3 && <FairySyllableGame onComplete={advance} />}
        {step === 4 && <FairyDotMaze onComplete={advance} />}
        {step === 5 && <FairyNotebookUpload onComplete={handleNotebookComplete} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0FDF4' },
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
  backButtonText: { fontSize: 17, fontWeight: '700', color: '#BE185D' },
  header: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 3,
    borderBottomColor: FOREST_GREEN,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#166534', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#15803d', textAlign: 'center', marginTop: 4 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 12 },
  progressBg: { flex: 1, height: 14, backgroundColor: '#BBF7D0', borderRadius: 7, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: FOREST_GREEN, borderRadius: 7 },
  progressText: { fontSize: 16, fontWeight: '700', color: '#166534', minWidth: 48 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 6 },
  star: { fontSize: 24, opacity: 0.35 },
  starEarned: { opacity: 1 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 24 },
  introScroll: { flexGrow: 1, padding: 24, paddingBottom: 40 },
  introHeader: { marginBottom: 28 },
  introTitle: { fontSize: 28, fontWeight: '800', color: '#166534', textAlign: 'center', marginBottom: 12 },
  introSub: { fontSize: 18, color: '#15803d', textAlign: 'center', lineHeight: 26 },
  cardsWrap: { gap: 16, marginBottom: 32 },
  introCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 3,
    borderColor: MAGIC_PURPLE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  introCardLocked: { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1', opacity: 0.9 },
  introCardPressed: { opacity: 0.9 },
  introCardTextLocked: { color: '#94A3B8' },
  introCardLockBadge: { marginLeft: 'auto', padding: 6 },
  introCardIcon: { fontSize: 40 },
  introCardTitle: { fontSize: 20, fontWeight: '800', color: '#1f2937', flex: 1 },
  introCardDesc: { fontSize: 16, color: '#6b7280' },
  startBtn: {
    backgroundColor: FOREST_GREEN,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  startBtnText: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  pressed: { opacity: 0.9 },
  resultScroll: { flexGrow: 1, padding: 24, alignItems: 'center', paddingBottom: 40 },
  firefliesRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 16 },
  fireflyEmoji: { fontSize: 32 },
  resultTitle: { fontSize: 24, fontWeight: '800', color: '#166534', textAlign: 'center', marginBottom: 24 },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: MAGIC_PURPLE,
    gap: 10,
    marginBottom: 24,
  },
  resultBadgeEmoji: { fontSize: 32 },
  resultBadgeText: { fontSize: 20, fontWeight: '800', color: '#1f2937' },
  resultStats: { marginBottom: 16 },
  resultStat: { fontSize: 18, color: '#374151', marginBottom: 4 },
  backToGamesBtn: {
    marginTop: 24,
    backgroundColor: FOREST_GREEN,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  backToGamesText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
