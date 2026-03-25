/**
 * LettersIJSession5 — Level 1 Explorer, Session 5: Letters I & J
 * Flow: Intro → Game 1 (Find I) → Game 2 (Match I→Ice Cream, J→Juice) → Game 3 (Tap 5) → Game 4 (Count ice creams) → Notebook → Result
 * AAC-friendly: primary #4F46E5, success #22C55E, background #F3F4F6.
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
import { LetterTapGame } from './LetterTapGame';
import { LetterMatchGame } from './LetterMatchGame';
import { NumberTapGame } from './NumberTapGame';
import { ObjectCountGame } from './ObjectCountGame';
import { ExplorerNotebookUploadIJ } from './ExplorerNotebookUploadIJ';

const GAME_COUNT = 4;
const TOTAL_GAMES = 5;
const DESIGN = {
  primary: '#4F46E5',
  success: '#22C55E',
  background: '#F3F4F6',
  primaryLight: '#E0E7FF',
};

const IJ_PAIRS = [
  { letter: 'I', object: 'Ice Cream', emoji: '🍦' },
  { letter: 'J', object: 'Juice', emoji: '🧃' },
];

interface LettersIJSession5Props {
  onExit?: () => void;
}

export function LettersIJSession5({ onExit }: LettersIJSession5Props = {}) {
  const [step, setStep] = useState(0);
  const [stars, setStars] = useState(0);
  const [notebookCorrect, setNotebookCorrect] = useState<boolean | null>(null);

  const advance = useCallback(() => {
    setStars((s) => Math.min(s + 1, TOTAL_GAMES));
    setStep((g) => Math.min(g + 1, 6));
  }, []);

  const handleNotebookComplete = useCallback((correct: boolean) => {
    setNotebookCorrect(correct);
    if (correct) setStars((s) => Math.min(s + 1, TOTAL_GAMES));
    setStep(6);
  }, []);

  const progressPct = step >= 1 && step <= 5 ? (step / TOTAL_GAMES) * 100 : 0;

  if (step === 0) {
    const cards = [
      { icon: '🔤', title: 'Find the Letter', desc: 'Tap the letter I' },
      { icon: '🍦', title: 'Match Letter to Picture', desc: 'I → Ice Cream, J → Juice' },
      { icon: '5️⃣', title: 'Tap the Number', desc: 'Tap the number 5' },
      { icon: '🍦', title: 'Count the Ice Creams', desc: 'How many ice creams?' },
    ];
    return (
      <SafeAreaView style={styles.safe}>
        {onExit ? (
          <Pressable
            onPress={onExit}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={DESIGN.primary} />
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        ) : null}
        <ScrollView contentContainerStyle={styles.introScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.introHeader}>
            <Text style={styles.introTitle}>Letters I & J</Text>
            <Text style={styles.introSub}>Let's learn the letters I and J.</Text>
          </View>
          <View style={styles.letterVisuals}>
            <View style={styles.letterRow}>
              <Text style={styles.letterBig}>I</Text>
              <Text style={styles.letterArrow}>→</Text>
              <Text style={styles.letterEmoji}>🍦</Text>
              <Text style={styles.letterLabel}>Ice Cream</Text>
            </View>
            <View style={styles.letterRow}>
              <Text style={styles.letterBig}>J</Text>
              <Text style={styles.letterArrow}>→</Text>
              <Text style={styles.letterEmoji}>🧃</Text>
              <Text style={styles.letterLabel}>Juice</Text>
            </View>
          </View>
          <View style={styles.cardsWrap}>
            {cards.map((card, i) => (
              <Pressable
                key={i}
                onPress={() => setStep(i + 1)}
                style={({ pressed }) => [styles.introCard, pressed && styles.introCardPressed]}
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
            style={({ pressed }) => [styles.startBtn, pressed && styles.pressed]}
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
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultEmoji}>🎉</Text>
          <Text style={styles.resultTitle}>Great job learning I and J!</Text>
          <View style={styles.resultBadge}>
            <Text style={styles.resultBadgeStar}>⭐</Text>
            <Text style={styles.resultBadgeText}>Alphabet Explorer</Text>
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
        <Text style={[styles.title, { color: DESIGN.primary }]}>Letters I & J</Text>
        <Text style={styles.subtitle}>Session 5 · The Explorer</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: DESIGN.primary }]} />
          </View>
          <Text style={[styles.progressText, { color: DESIGN.primary }]}>{step} / {TOTAL_GAMES}</Text>
        </View>
        <View style={styles.starsRow}>
          {Array.from({ length: TOTAL_GAMES }, (_, i) => (
            <Text key={i} style={[styles.star, i < stars && styles.starEarned]}>⭐</Text>
          ))}
        </View>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <LetterTapGame
            onComplete={advance}
            letters={['I', 'L', 'T']}
            correctLetter="I"
          />
        )}
        {step === 2 && (
          <LetterMatchGame onComplete={advance} pairs={IJ_PAIRS} />
        )}
        {step === 3 && (
          <NumberTapGame
            onComplete={advance}
            numbers={['3', '5', '7']}
            correctNumber="5"
          />
        )}
        {step === 4 && (
          <ObjectCountGame
            onComplete={advance}
            objectDisplay="🍦🍦🍦🍦🍦"
            objectLabel="ice creams"
            icon="🍦"
            options={['4', '5', '6']}
            correct="5"
          />
        )}
        {step === 5 && <ExplorerNotebookUploadIJ onComplete={handleNotebookComplete} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DESIGN.background },
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
  introTitle: { fontSize: 28, fontWeight: '800', color: DESIGN.primary, textAlign: 'center', marginBottom: 12 },
  introSub: { fontSize: 18, color: '#4b5563', textAlign: 'center', lineHeight: 26 },
  letterVisuals: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 3,
    borderColor: DESIGN.primaryLight,
  },
  letterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 },
  letterBig: { fontSize: 48, fontWeight: '800', color: DESIGN.primary },
  letterArrow: { fontSize: 28, color: '#9ca3af' },
  letterEmoji: { fontSize: 40 },
  letterLabel: { fontSize: 20, fontWeight: '700', color: '#374151' },
  cardsWrap: { gap: 16, marginBottom: 32 },
  introCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 3,
    borderColor: DESIGN.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  introCardPressed: { opacity: 0.9 },
  introCardIcon: { fontSize: 40 },
  introCardTitle: { fontSize: 20, fontWeight: '800', color: '#1f2937', flex: 1 },
  introCardDesc: { fontSize: 16, color: '#6b7280' },
  startBtn: {
    backgroundColor: DESIGN.primary,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  startBtnText: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  pressed: { opacity: 0.9 },
  resultScroll: { flexGrow: 1, padding: 24, alignItems: 'center', paddingBottom: 40 },
  resultEmoji: { fontSize: 72, marginBottom: 16 },
  resultTitle: { fontSize: 24, fontWeight: '800', color: DESIGN.primary, textAlign: 'center', marginBottom: 24 },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DESIGN.primaryLight,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: DESIGN.primary,
    gap: 10,
    marginBottom: 24,
  },
  resultBadgeStar: { fontSize: 32 },
  resultBadgeText: { fontSize: 20, fontWeight: '800', color: '#1f2937' },
  resultStats: { marginBottom: 16 },
  resultStat: { fontSize: 18, color: '#374151', marginBottom: 4 },
  backToGamesBtn: {
    marginTop: 24,
    backgroundColor: DESIGN.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  backToGamesText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
