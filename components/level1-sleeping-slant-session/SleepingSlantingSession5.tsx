/**
 * Level 1 – Session 5: Sleeping Lines + Slanting Lines
 * Flow: Intro → Game 1 (Trace Horizontal) → Game 2 (Trace Slanting) → Game 3 (Identify) → Game 4 (Mix) → Task → Result
 */
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GameCardGrip } from '@/components/level1-grip-session/GameCardGrip';
import { TraceHorizontalLinesGame } from './TraceHorizontalLinesGame';
import { TraceSlantingLinesGame } from './TraceSlantingLinesGame';
import { IdentifyLineDirectionGame } from './IdentifyLineDirectionGame';
import { MixLineGame } from './MixLineGame';
import { LineTypesUploadTask } from './LineTypesUploadTask';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const TOTAL_STEPS = 5;
const DESIGN = { primary: '#5B21B6', background: '#EDE9FE' };

interface SleepingSlantingSession5Props {
  onExit?: () => void;
}

export function SleepingSlantingSession5({ onExit }: SleepingSlantingSession5Props = {}) {
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
      setTimeout(() => {
        setShowCelebration(false);
        setStep(6);
      }, 2500);
    }
  }, []);

  if (step === 0) {
    const cards = [
      { icon: '→', title: 'Trace Sleeping Lines', desc: 'Connect dots left to right', step: 1 },
      { icon: '↗️', title: 'Trace Slanting Lines', desc: 'Trace / and \\', step: 2 },
      { icon: '👆', title: 'Tap the Line', desc: 'Tap sleeping or slanting', step: 3 },
      { icon: '📐', title: 'Mix Line Game', desc: 'Trace all line types', step: 4 },
      { icon: '📷', title: 'Line Types Task', desc: 'Upload photo of your lines', step: 5 },
    ];
    return (
      <SafeAreaView style={styles.safe}>
        {onExit ? (
          <Pressable onPress={onExit} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]} accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={24} color={DESIGN.primary} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        ) : null}
        <ScrollView contentContainerStyle={styles.introScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.mascotRow}>
            <Text style={styles.mascot}>→</Text>
            <Text style={styles.mascotHint}>Sleeping & slanting lines — Try slanting lines!</Text>
          </View>
          <Text style={styles.introTitle}>Sleeping + Slanting Lines</Text>
          <Text style={styles.introSub}>Session 5 · Horizontal & diagonal</Text>
          <View style={styles.progressRow}>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: '0%', backgroundColor: DESIGN.primary }]} />
            </View>
            <Text style={styles.progressText}>0 / {TOTAL_STEPS}</Text>
          </View>
          {cards.map((card) => (
            <GameCardGrip key={card.step} icon={card.icon} title={card.title} description={card.desc} onPress={() => setStep(card.step)} isLocked={false} />
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 6) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultEmoji}>🎉</Text>
          <Text style={styles.resultTitle}>Great line control!</Text>
          <View style={styles.resultBadge}>
            <Text style={styles.resultBadgeStar}>⭐</Text>
            <Text style={styles.resultBadgeText}>Line Star</Text>
          </View>
          <View style={styles.resultStats}>
            <Text style={styles.resultStat}>Completed: {completed} of {TOTAL_STEPS}</Text>
            <Text style={styles.resultStat}>Task: {taskSuccess === null ? '—' : taskSuccess ? '✓ Done' : 'Try again'}</Text>
          </View>
          <View style={styles.starsRow}>
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <Text key={i} style={[styles.star, i < completed && styles.starEarned]}>⭐</Text>
            ))}
          </View>
          {onExit ? (
            <Pressable style={({ pressed }) => [styles.doneBtn, pressed && styles.pressed]} onPress={onExit}>
              <Text style={styles.doneBtnText}>Back to games</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const goBack = () => setStep((s) => (s === 1 ? 0 : s - 1));

  if (showCelebration) {
    return <SuccessCelebration title="Great line control!" subtitle="Session complete!" />;
  }

  return (
    <View style={styles.safe}>
      {step === 1 && <TraceHorizontalLinesGame currentStep={1} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={advance} />}
      {step === 2 && <TraceSlantingLinesGame currentStep={2} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={advance} />}
      {step === 3 && <IdentifyLineDirectionGame currentStep={3} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={advance} />}
      {step === 4 && <MixLineGame currentStep={4} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={advance} />}
      {step === 5 && <LineTypesUploadTask currentStep={5} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={handleTaskComplete} />}
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
  introSub: { fontSize: 16, color: '#6D28D9', textAlign: 'center', marginBottom: 16 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  progressBg: { flex: 1, height: 14, backgroundColor: '#C4B5FD', borderRadius: 7, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 7 },
  progressText: { fontSize: 16, fontWeight: '700', minWidth: 48, color: DESIGN.primary },
  resultScroll: { flexGrow: 1, padding: 24, alignItems: 'center', paddingBottom: 40 },
  resultEmoji: { fontSize: 72, marginBottom: 16 },
  resultTitle: { fontSize: 24, fontWeight: '800', color: DESIGN.primary, textAlign: 'center', marginBottom: 24 },
  resultBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#C4B5FD', paddingVertical: 16, paddingHorizontal: 28, borderRadius: 20, borderWidth: 3, borderColor: DESIGN.primary, gap: 10, marginBottom: 24 },
  resultBadgeStar: { fontSize: 32 },
  resultBadgeText: { fontSize: 20, fontWeight: '800', color: '#1F2937' },
  resultStats: { marginBottom: 16 },
  resultStat: { fontSize: 18, color: '#374151', marginBottom: 4 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  star: { fontSize: 28, opacity: 0.35 },
  starEarned: { opacity: 1 },
  doneBtn: { marginTop: 24, backgroundColor: DESIGN.primary, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16 },
  doneBtnText: { color: '#FFF', fontWeight: '800', fontSize: 18 },
});
