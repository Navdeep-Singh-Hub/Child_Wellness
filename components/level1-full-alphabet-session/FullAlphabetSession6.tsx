/**
 * Level 1 – Session 6: Full A–Z Tracing with Strong Guidance
 * Flow: Intro → Game 1 (Guided Tracing) → Game 2 (Hand Holding) → Game 3 (Repeat Practice) → Game 4 (Trace+Sound) → Task → Result
 */
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GameCardGrip } from '@/components/level1-grip-session/GameCardGrip';
import { GuidedLetterTracingGame } from './GuidedLetterTracingGame';
import { HandHoldingTraceGame } from './HandHoldingTraceGame';
import { LetterRepeatPracticeGame } from './LetterRepeatPracticeGame';
import { TraceSoundGame } from './TraceSoundGame';
import { AlphabetUploadTask } from './AlphabetUploadTask';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const TOTAL_STEPS = 5;
const DESIGN = { primary: '#0D9488', background: '#F0FDFA' };

interface Props { onExit?: () => void }

export function FullAlphabetSession6({ onExit }: Props = {}) {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [taskSuccess, setTaskSuccess] = useState<boolean | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const advance = useCallback(() => {
    setCompleted((c) => Math.min(c + 1, TOTAL_STEPS));
    setStep((s) => Math.min(s + 1, 6));
  }, []);

  const handleTaskComplete = useCallback((success: boolean) => {
    setTaskSuccess(success);
    if (success) {
      setCompleted((c) => Math.min(c + 1, TOTAL_STEPS));
      setShowCelebration(true);
      setTimeout(() => { setShowCelebration(false); setStep(6); }, 2500);
    }
  }, []);

  if (step === 0) {
    const cards = [
      { icon: '✏️', title: 'Guided Tracing', desc: 'A–Z with stroke animation & arrows', step: 1 },
      { icon: '🤝', title: 'Hand-Holding Trace', desc: 'Auto-guided path snapping', step: 2 },
      { icon: '💪', title: 'Repeat Practice', desc: 'Same letter 3 times for muscle memory', step: 3 },
      { icon: '🔊', title: 'Trace + Sound', desc: 'Hear the letter as you trace', step: 4 },
      { icon: '📷', title: 'A–Z Task', desc: 'Trace A–Z on paper & upload', step: 5 },
    ];
    const pctW = `${(completed / TOTAL_STEPS) * 100}%`;
    return (
      <SafeAreaView style={styles.safe}>
        {onExit && (
          <Pressable onPress={onExit} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]} accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={24} color={DESIGN.primary} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        )}
        <ScrollView contentContainerStyle={styles.introScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.mascotRow}>
            <Text style={styles.mascot}>🅰️</Text>
            <Text style={styles.mascotHint}>Full alphabet tracing — let's master every letter!</Text>
          </View>
          <Text style={styles.introTitle}>Full A–Z Tracing</Text>
          <Text style={styles.introSub}>Session 6 · Guided A to Z</Text>
          <View style={styles.progressRow}>
            <View style={styles.progressBg}><View style={[styles.progressFill, { width: pctW, backgroundColor: DESIGN.primary }]} /></View>
            <Text style={styles.progressText}>{completed}/{TOTAL_STEPS}</Text>
          </View>
          {cards.map((c) => (
            <GameCardGrip key={c.step} icon={c.icon} title={c.title} description={c.desc} onPress={() => setStep(c.step)} isLocked={false} />
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 6) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultEmoji}>🏆</Text>
          <Text style={styles.resultTitle}>A–Z Complete!</Text>
          <Text style={styles.resultSub}>You can trace every letter from A to Z!</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeStar}>⭐</Text>
            <Text style={styles.badgeText}>Alphabet Master</Text>
          </View>
          <View style={styles.stats}>
            <Text style={styles.stat}>Completed: {completed}/{TOTAL_STEPS}</Text>
            <Text style={styles.stat}>Task: {taskSuccess === null ? '—' : taskSuccess ? '✓ Done' : 'Try again'}</Text>
          </View>
          <View style={styles.starsRow}>
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <Text key={i} style={[styles.star, i < completed && styles.starEarned]}>⭐</Text>
            ))}
          </View>
          {onExit && (
            <Pressable style={({ pressed }) => [styles.doneBtn, pressed && styles.pressed]} onPress={onExit}>
              <Text style={styles.doneBtnText}>Back to games</Text>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const goBack = () => setStep(0);
  if (showCelebration) return <SuccessCelebration title="A–Z complete!" subtitle="Full alphabet session done!" />;

  return (
    <View style={styles.safe}>
      {step === 1 && <GuidedLetterTracingGame currentStep={1} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={advance} />}
      {step === 2 && <HandHoldingTraceGame currentStep={2} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={advance} />}
      {step === 3 && <LetterRepeatPracticeGame currentStep={3} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={advance} />}
      {step === 4 && <TraceSoundGame currentStep={4} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={advance} />}
      {step === 5 && <AlphabetUploadTask currentStep={5} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={handleTaskComplete} />}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DESIGN.background },
  backBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 8 },
  backText: { fontSize: 17, fontWeight: '700', color: DESIGN.primary },
  pressed: { opacity: 0.9 },
  introScroll: { padding: 20, paddingBottom: 40 },
  mascotRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  mascot: { fontSize: 40 },
  mascotHint: { fontSize: 15, color: DESIGN.primary, fontWeight: '600', flex: 1 },
  introTitle: { fontSize: 26, fontWeight: '800', color: DESIGN.primary, textAlign: 'center', marginBottom: 8 },
  introSub: { fontSize: 14, color: '#115E59', textAlign: 'center', marginBottom: 16 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  progressBg: { flex: 1, height: 14, backgroundColor: '#CCFBF1', borderRadius: 7, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 7 },
  progressText: { fontSize: 16, fontWeight: '700', minWidth: 48, color: DESIGN.primary },
  resultScroll: { flexGrow: 1, padding: 24, alignItems: 'center', paddingBottom: 40 },
  resultEmoji: { fontSize: 72, marginBottom: 16 },
  resultTitle: { fontSize: 24, fontWeight: '800', color: DESIGN.primary, textAlign: 'center', marginBottom: 6 },
  resultSub: { fontSize: 16, color: '#115E59', textAlign: 'center', marginBottom: 24 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#CCFBF1', paddingVertical: 16, paddingHorizontal: 28, borderRadius: 20, borderWidth: 3, borderColor: DESIGN.primary, gap: 10, marginBottom: 24 },
  badgeStar: { fontSize: 32 },
  badgeText: { fontSize: 20, fontWeight: '800', color: '#1F2937' },
  stats: { marginBottom: 16 },
  stat: { fontSize: 18, color: '#374151', marginBottom: 4 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  star: { fontSize: 28, opacity: 0.35 },
  starEarned: { opacity: 1 },
  doneBtn: { marginTop: 24, backgroundColor: DESIGN.primary, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16 },
  doneBtnText: { color: '#FFF', fontWeight: '800', fontSize: 18 },
});
