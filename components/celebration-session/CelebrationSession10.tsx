/**
 * CelebrationSession10 — Special Ed Level 2 · Session 10: Celebration Party (FINAL SESSION)
 * Flow: Intro → Game 1 (Find Party Sounds) → Game 2 (I Spy Party Rhymes) → Game 3 (Clap Party Words) → Game 4 (Count Party Items) → Notebook → Final celebration
 * Design: Party Pink #F472B6, Celebration Yellow #FACC15, Sky Blue #38BDF8. Festive, tablet-friendly.
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
import { PartyCleanUp } from './PartyCleanUp';
import { PartyRhymeGame } from './PartyRhymeGame';
import { PartySyllableGame } from './PartySyllableGame';
import { PartyDragToCount } from './PartyDragToCount';
import { PartyNotebookUpload } from './PartyNotebookUpload';

const TOTAL_GAMES = 5;
const GAME_COUNT = 4;
const SECTION_NUMBER = 2;
const SESSION_NUMBER = 10;
const PARTY_PINK = '#F472B6';
const CELEBRATION_YELLOW = '#FACC15';
const SKY_BLUE = '#38BDF8';

interface CelebrationSession10Props {
  onExit?: () => void;
}

export function CelebrationSession10({ onExit }: CelebrationSession10Props = {}) {
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
      { icon: '🎂', title: 'Find the Party Sounds', desc: 'Initial sound /c/' },
      { icon: '👀', title: 'I Spy Party Rhymes', desc: 'Rhyming hunt' },
      { icon: '👏', title: 'Clap the Party Words', desc: 'Syllables' },
      { icon: '🎈', title: 'Count the Party Items', desc: 'Tap items 1–15' },
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
            <Ionicons name="arrow-back" size={24} color="#C2410C" />
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        ) : null}
        <ScrollView contentContainerStyle={styles.introScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.introHeader}>
            <Text style={styles.introTitle}>Celebration Party</Text>
            <Text style={styles.introSub}>
              Congratulations! Let's celebrate by playing fun sound and counting games!
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
          <View style={styles.balloonsRow}>
            {['🎈', '🏆', '🎂', '✨', '🎉', '🎈'].map((e, i) => (
              <Text key={i} style={styles.balloonEmoji}>{e}</Text>
            ))}
          </View>
          <Text style={styles.resultTitle}>Congratulations! You finished all learning adventures!</Text>
          <View style={styles.resultBadge}>
            <Text style={styles.resultBadgeEmoji}>🏆</Text>
            <Text style={styles.resultBadgeText}>Learning Champion Badge</Text>
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
          <Ionicons name="arrow-back" size={24} color="#C2410C" />
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Celebration Party</Text>
        <Text style={styles.subtitle}>Session 10 – Final</Text>
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
        {step === 1 && <PartyCleanUp onComplete={advance} />}
        {step === 2 && <PartyRhymeGame onComplete={advance} />}
        {step === 3 && <PartySyllableGame onComplete={advance} />}
        {step === 4 && <PartyDragToCount onComplete={advance} />}
        {step === 5 && <PartyNotebookUpload onComplete={handleNotebookComplete} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FDF2F8' },
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
  backButtonText: { fontSize: 17, fontWeight: '700', color: '#C2410C' },
  header: {
    backgroundColor: '#FCE7F3',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 3,
    borderBottomColor: PARTY_PINK,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#9D174D', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#DB2777', textAlign: 'center', marginTop: 4 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 12 },
  progressBg: { flex: 1, height: 14, backgroundColor: '#FBCFE8', borderRadius: 7, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: PARTY_PINK, borderRadius: 7 },
  progressText: { fontSize: 16, fontWeight: '700', color: '#9D174D', minWidth: 48 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 6 },
  star: { fontSize: 24, opacity: 0.35 },
  starEarned: { opacity: 1 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 24 },
  introScroll: { flexGrow: 1, padding: 24, paddingBottom: 40 },
  introHeader: { marginBottom: 28 },
  introTitle: { fontSize: 28, fontWeight: '800', color: '#9D174D', textAlign: 'center', marginBottom: 12 },
  introSub: { fontSize: 18, color: '#DB2777', textAlign: 'center', lineHeight: 26 },
  cardsWrap: { gap: 16, marginBottom: 32 },
  introCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 3,
    borderColor: SKY_BLUE,
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
    backgroundColor: PARTY_PINK,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  startBtnText: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  pressed: { opacity: 0.9 },
  resultScroll: { flexGrow: 1, padding: 24, alignItems: 'center', paddingBottom: 40 },
  balloonsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 16 },
  balloonEmoji: { fontSize: 32 },
  resultTitle: { fontSize: 24, fontWeight: '800', color: '#9D174D', textAlign: 'center', marginBottom: 24 },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9C3',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: CELEBRATION_YELLOW,
    gap: 10,
    marginBottom: 24,
  },
  resultBadgeEmoji: { fontSize: 32 },
  resultBadgeText: { fontSize: 20, fontWeight: '800', color: '#1f2937' },
  resultStats: { marginBottom: 16 },
  resultStat: { fontSize: 18, color: '#374151', marginBottom: 4 },
  backToGamesBtn: {
    marginTop: 24,
    backgroundColor: PARTY_PINK,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  backToGamesText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
