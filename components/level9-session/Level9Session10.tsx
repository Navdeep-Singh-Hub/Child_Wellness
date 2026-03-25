/**
 * Level 9 (Clockwise) — Session 10 (final): Mixed Challenge, Advanced Memory 20, Word EDUCATION, Logic Pattern
 * 4 games + 1 real-world task (build tower with 5 objects). Galaxy/indigo theme.
 * On task success: celebration animation, unlock next level.
 */
import React, { useCallback, useEffect, useState } from 'react';
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
import { MixedChallengeLevel9Session10Game } from './MixedChallengeLevel9Session10Game';
import { MemoryAdvanced20Level9Session10Game } from './MemoryAdvanced20Level9Session10Game';
import { WordBuilderEducationLevel9Session10Game } from './WordBuilderEducationLevel9Session10Game';
import { LogicPatternTriangleSquareLevel9Session10Game } from './LogicPatternTriangleSquareLevel9Session10Game';
import { Level9NotebookUploadTowerFive } from './Level9NotebookUploadTowerFive';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

function FinalCelebrationWithTransition({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <SuccessCelebration
      variant="indigo"
      title="Level Complete!"
      subtitle="Clockwise Master — Next level unlocked! 🎉"
      badgeEmoji="🏆"
    />
  );
}

const TOTAL_STEPS = 6;
const DESIGN = {
  primary: '#6366F1',
  background: '#EEF2FF',
  primaryLight: 'rgba(99,102,241,0.12)',
};

interface Level9Session10Props {
  onExit?: () => void;
}

export function Level9Session10({ onExit }: Level9Session10Props = {}) {
  const [step, setStep] = useState(0);
  const [stars, setStars] = useState(0);
  const [taskCorrect, setTaskCorrect] = useState<boolean | null>(null);
  const [showFinalCelebration, setShowFinalCelebration] = useState(false);

  const advance = useCallback(() => {
    setStars((s) => Math.min(s + 1, TOTAL_STEPS));
    setStep((g) => Math.min(g + 1, 6));
  }, []);

  const handleTaskComplete = useCallback((correct: boolean) => {
    setTaskCorrect(correct);
    if (correct) {
      setStars((s) => Math.min(s + 1, TOTAL_STEPS));
      setShowFinalCelebration(true);
    } else {
      setStep(6);
    }
  }, []);

  const progressPct = step >= 1 && step <= 5 ? (step / TOTAL_STEPS) * 100 : 0;

  if (step === 0) {
    const cards = [
      { icon: '🎯', title: 'Mixed Challenge', desc: 'Shapes, colors, and numbers' },
      { icon: '🎴', title: 'Advanced Memory', desc: 'Match 20 cards (10 pairs)' },
      { icon: '📚', title: 'Word Builder', desc: 'Build EDUCATION' },
      { icon: '🔺', title: 'Logic Pattern', desc: 'Triangle, square...' },
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
            <Text style={styles.mascotHint}>Final session! Mixed challenge, memory 20, EDUCATION, and pattern. Then build a tower with five objects. Complete it to unlock the next level!</Text>
          </View>
          <View style={styles.introHeader}>
            <Text style={[styles.introTitle, { color: DESIGN.primary }]}>Level 9 · Session 10 (Final)</Text>
            <Text style={styles.introSub}>Clockwise · Galaxy · Session 10</Text>
            <Text style={styles.introDesc}>
              Mixed challenge, advanced memory, word EDUCATION, logic pattern, then build a tower!
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

  if (showFinalCelebration && taskCorrect) {
    return (
      <FinalCelebrationWithTransition
        onDone={() => {
          setShowFinalCelebration(false);
          setStep(6);
        }}
      />
    );
  }

  if (step === 6) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: DESIGN.background }]}>
        <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultEmoji}>{taskCorrect ? '🏆' : '🎉'}</Text>
          <Text style={[styles.resultTitle, { color: DESIGN.primary }]}>
            {taskCorrect ? 'Clockwise Master (Final)!' : 'Great job!'}
          </Text>
          <View style={[styles.resultBadge, { borderColor: DESIGN.primary, backgroundColor: DESIGN.primaryLight }]}>
            <Text style={styles.resultBadgeStar}>⭐</Text>
            <Text style={styles.resultBadgeText}>Session 10 Complete</Text>
          </View>
          {taskCorrect ? (
            <Text style={styles.unlockText}>Next level unlocked!</Text>
          ) : null}
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
        <View style={styles.titleRow}>
          <Text style={styles.mascotSmall}>🌌</Text>
          <Text style={[styles.title, { color: DESIGN.primary }]}>Level 9 · Session 10 (Final)</Text>
        </View>
        <Text style={styles.subtitle}>Clockwise · Galaxy · Session 10</Text>
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
        {step === 1 && <MixedChallengeLevel9Session10Game onComplete={advance} />}
        {step === 2 && <MemoryAdvanced20Level9Session10Game onComplete={advance} />}
        {step === 3 && <WordBuilderEducationLevel9Session10Game onComplete={advance} />}
        {step === 4 && <LogicPatternTriangleSquareLevel9Session10Game onComplete={advance} />}
        {step === 5 && <Level9NotebookUploadTowerFive onComplete={handleTaskComplete} />}
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
  unlockText: { fontSize: 20, fontWeight: '800', color: '#22C55E', marginBottom: 16 },
  resultStats: { marginBottom: 16 },
  resultStat: { fontSize: 18, color: '#334155', marginBottom: 4 },
  backToGamesBtn: { marginTop: 24, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12 },
  backToGamesText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
