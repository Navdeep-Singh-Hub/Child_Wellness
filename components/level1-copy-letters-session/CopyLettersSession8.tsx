/**
 * Level 1 – Session 8: Copy Letters from Reference
 * Flow: Intro → Game 1 (Side-by-Side) → Game 2 (Memory Copy) → Game 3 (Multi Letter) → Task → Result
 */
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GameCardGrip } from '@/components/level1-grip-session/GameCardGrip';
import { SideBySideWritingGame } from './SideBySideWritingGame';
import { MemoryCopyGame } from './MemoryCopyGame';
import { MultiLetterCopyGame } from './MultiLetterCopyGame';
import { CopyLettersUploadTask } from './CopyLettersUploadTask';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const TOTAL_STEPS = 4;
const DESIGN = { primary: '#1E40AF', background: '#EFF6FF' };

interface Props { onExit?: () => void }

export function CopyLettersSession8({ onExit }: Props = {}) {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [taskSuccess, setTaskSuccess] = useState<boolean | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const advance = useCallback(() => {
    setCompleted((c) => Math.min(c + 1, TOTAL_STEPS));
    setStep((s) => Math.min(s + 1, 5));
  }, []);

  const handleTaskComplete = useCallback((success: boolean) => {
    setTaskSuccess(success);
    if (success) {
      setCompleted((c) => Math.min(c + 1, TOTAL_STEPS));
      setShowCelebration(true);
      setTimeout(() => { setShowCelebration(false); setStep(5); }, 2500);
    }
  }, []);

  if (step === 0) {
    const cards = [
      { icon: '📝', title: 'Side-by-Side', desc: 'Letter left, write right', step: 1 },
      { icon: '🧠', title: 'Memory Copy', desc: 'See it, hide it, write it', step: 2 },
      { icon: '📋', title: 'Multi Letter Copy', desc: 'Write sequences: A B C', step: 3 },
      { icon: '📷', title: 'Letter Task', desc: 'Write 5 letters & upload', step: 4 },
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
            <Text style={styles.mascot}>✍️</Text>
            <Text style={styles.mascotHint}>Copy letters from a reference — no tracing!</Text>
          </View>
          <Text style={styles.introTitle}>Copy Letters</Text>
          <Text style={styles.introSub}>Session 8 · Look & Write</Text>
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

  if (step === 5) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultEmoji}>🏆</Text>
          <Text style={styles.resultTitle}>Copy Master!</Text>
          <Text style={styles.resultSub}>You can write letters by looking at them!</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeStar}>⭐</Text>
            <Text style={styles.badgeText}>Copy Champion</Text>
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
  if (showCelebration) return <SuccessCelebration title="Copy master!" subtitle="Session complete!" />;

  return (
    <View style={styles.safe}>
      {step === 1 && <SideBySideWritingGame currentStep={1} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={advance} />}
      {step === 2 && <MemoryCopyGame currentStep={2} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={advance} />}
      {step === 3 && <MultiLetterCopyGame currentStep={3} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={advance} />}
      {step === 4 && <CopyLettersUploadTask currentStep={4} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={handleTaskComplete} />}
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
  introSub: { fontSize: 14, color: '#2563EB', textAlign: 'center', marginBottom: 16 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  progressBg: { flex: 1, height: 14, backgroundColor: '#BFDBFE', borderRadius: 7, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 7 },
  progressText: { fontSize: 16, fontWeight: '700', minWidth: 48, color: DESIGN.primary },
  resultScroll: { flexGrow: 1, padding: 24, alignItems: 'center', paddingBottom: 40 },
  resultEmoji: { fontSize: 72, marginBottom: 16 },
  resultTitle: { fontSize: 24, fontWeight: '800', color: DESIGN.primary, textAlign: 'center', marginBottom: 6 },
  resultSub: { fontSize: 16, color: '#2563EB', textAlign: 'center', marginBottom: 24 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DBEAFE', paddingVertical: 16, paddingHorizontal: 28, borderRadius: 20, borderWidth: 3, borderColor: DESIGN.primary, gap: 10, marginBottom: 24 },
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
