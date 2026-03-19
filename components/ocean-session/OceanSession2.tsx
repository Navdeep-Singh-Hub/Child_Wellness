/**
 * OceanSession2 — Special Ed Level 2 · Session 2: Ocean Adventure
 * Flow: Intro → Game 1 (Clean the Beach) → Game 2 (I Spy Rhymes) → Game 3 (Clap Ocean Words) → Game 4 (Count Sea Creatures) → Notebook → Result
 * Design: Ocean Blue #38BDF8, Coral #FB7185, Sea Green #34D399.
 * Intro: Clickable game cards; first game only for new users; Start = next game.
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
import { OceanCleanUp } from './OceanCleanUp';
import { OceanRhymeGame } from './OceanRhymeGame';
import { OceanSyllableGame } from './OceanSyllableGame';
import { OceanMatchSets } from './OceanMatchSets';
import { OceanNotebookUpload } from './OceanNotebookUpload';

const TOTAL_GAMES = 5;
const GAME_COUNT = 4;
const SECTION_NUMBER = 2;
const SESSION_NUMBER = 2;
const OCEAN_BLUE = '#38BDF8';
const CORAL = '#FB7185';
const SEA_GREEN = '#34D399';

interface OceanSession2Props {
  onExit?: () => void;
}

export function OceanSession2({ onExit }: OceanSession2Props = {}) {
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

  // —— Intro ——
  if (step === 0) {
    const cards = [
      { icon: '🧹', title: 'Clean the Beach', desc: 'Find the sound' },
      { icon: '👀', title: 'I Spy Rhymes', desc: 'Rhyming hunt' },
      { icon: '👏', title: 'Clap the Ocean Words', desc: 'Syllables' },
      { icon: '🐚', title: 'Count the Sea Creatures', desc: 'Match sets to numbers' },
    ];
    const nextStep = Math.min(lastCompletedGameIndex + 1, 5);
    const startLabel = nextStep <= GAME_COUNT ? `Start Game ${nextStep}` : 'Notebook';
    return (
      <SafeAreaView style={styles.safe}>
        {onExit ? (
          <Pressable
            onPress={onExit}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#0369A1" />
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        ) : null}
        <ScrollView contentContainerStyle={styles.introScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.introHeader}>
            <Text style={styles.introTitle}>Ocean Adventure</Text>
            <Text style={styles.introSub}>
              Help clean the ocean and learn fun word and counting games!
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

  // —— Result ——
  if (step === 6) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.bubblesRow}>
            {['🫧', '🌊', '🐟', '🫧', '⭐', '🫧'].map((e, i) => (
              <Text key={i} style={styles.bubbleEmoji}>{e}</Text>
            ))}
          </View>
          <Text style={styles.resultTitle}>You did a great job exploring the ocean!</Text>
          <View style={styles.resultBadge}>
            <Text style={styles.resultBadgeEmoji}>🏅</Text>
            <Text style={styles.resultBadgeText}>Ocean Explorer Badge</Text>
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

  // —— Games 1–5 ——
  const goBack = () => setStep((s) => Math.max(0, s - 1));
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          onPress={goBack}
          style={({ pressed }) => [styles.backButtonHeader, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back one step"
        >
          <Ionicons name="arrow-back" size={24} color="#0369A1" />
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Ocean Adventure</Text>
        <Text style={styles.subtitle}>Session 2</Text>
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
        {step === 1 && <OceanCleanUp onComplete={advance} />}
        {step === 2 && <OceanRhymeGame onComplete={advance} />}
        {step === 3 && <OceanSyllableGame onComplete={advance} />}
        {step === 4 && <OceanMatchSets onComplete={advance} />}
        {step === 5 && <OceanNotebookUpload onComplete={handleNotebookComplete} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E0F2FE' },
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
  backButtonText: { fontSize: 17, fontWeight: '700', color: '#0369A1' },
  header: {
    backgroundColor: '#BAE6FD',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 3,
    borderBottomColor: OCEAN_BLUE,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#0369A1', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#0284C7', textAlign: 'center', marginTop: 4 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 12 },
  progressBg: { flex: 1, height: 14, backgroundColor: '#7DD3FC', borderRadius: 7, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: OCEAN_BLUE, borderRadius: 7 },
  progressText: { fontSize: 16, fontWeight: '700', color: '#0369A1', minWidth: 48 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 6 },
  star: { fontSize: 24, opacity: 0.35 },
  starEarned: { opacity: 1 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 24 },
  introScroll: { flexGrow: 1, padding: 24, paddingBottom: 40 },
  introHeader: { marginBottom: 28 },
  introTitle: { fontSize: 28, fontWeight: '800', color: '#0369A1', textAlign: 'center', marginBottom: 12 },
  introSub: { fontSize: 18, color: '#0284C7', textAlign: 'center', lineHeight: 26 },
  cardsWrap: { gap: 16, marginBottom: 32 },
  introCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 3,
    borderColor: CORAL,
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
    backgroundColor: SEA_GREEN,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  startBtnText: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  pressed: { opacity: 0.9 },
  resultScroll: { flexGrow: 1, padding: 24, alignItems: 'center', paddingBottom: 40 },
  bubblesRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 16 },
  bubbleEmoji: { fontSize: 32 },
  resultTitle: { fontSize: 24, fontWeight: '800', color: '#0369A1', textAlign: 'center', marginBottom: 24 },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CCFBF1',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: SEA_GREEN,
    gap: 10,
    marginBottom: 24,
  },
  resultBadgeEmoji: { fontSize: 32 },
  resultBadgeText: { fontSize: 20, fontWeight: '800', color: '#1f2937' },
  resultStats: { marginBottom: 16 },
  resultStat: { fontSize: 18, color: '#374151', marginBottom: 4 },
  backToGamesBtn: {
    marginTop: 24,
    backgroundColor: OCEAN_BLUE,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  backToGamesText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
