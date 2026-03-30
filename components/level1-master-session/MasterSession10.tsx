/**
 * Level 1 – Session 10 (FINAL): Master Capital Letter Writing
 * Flow: Intro → Game 1 (Full A–Z) → Game 2 (Memory) → Game 3 (Mixed) → Game 4 (Fun) → Task → BIG Celebration
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Animated as RNAnimated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GameCardGrip } from '@/components/level1-grip-session/GameCardGrip';
import { FullAZWritingGame } from './FullAZWritingGame';
import { MemoryChallengeGame } from './MemoryChallengeGame';
import { MixedChallengeGame } from './MixedChallengeGame';
import { FunWritingGame } from './FunWritingGame';
import { MasterWritingUploadTask } from './MasterWritingUploadTask';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';

const TOTAL_STEPS = 5;
const DESIGN = { primary: '#B45309', accent: '#F59E0B', background: '#FFFBEB' };

interface Props { onExit?: () => void }

function Level1CompleteCelebration({ onDone }: { onDone: () => void }) {
  const scaleAnim = useRef(new RNAnimated.Value(0)).current;
  const rotateAnim = useRef(new RNAnimated.Value(0)).current;
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const starsAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.sequence([
      RNAnimated.parallel([
        RNAnimated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
        RNAnimated.timing(rotateAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
      RNAnimated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      RNAnimated.spring(starsAnim, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
    ]).start();
  }, [scaleAnim, rotateAnim, fadeAnim, starsAnim]);

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <SafeAreaView style={celebStyles.safe}>
      <ConfettiEffect />
      <View style={celebStyles.center}>
        <RNAnimated.View style={[celebStyles.trophyWrap, { transform: [{ scale: scaleAnim }, { rotate: spin }] }]}>
          <Text style={celebStyles.trophy}>🏆</Text>
        </RNAnimated.View>

        <RNAnimated.View style={{ opacity: fadeAnim }}>
          <Text style={celebStyles.title}>Level 1 Complete!</Text>
          <Text style={celebStyles.subtitle}>You have mastered capital letter writing!</Text>
        </RNAnimated.View>

        <RNAnimated.View style={[celebStyles.starsRow, { transform: [{ scale: starsAnim }] }]}>
          {['🌟', '⭐', '🏅', '⭐', '🌟'].map((s, i) => (
            <Text key={i} style={celebStyles.star}>{s}</Text>
          ))}
        </RNAnimated.View>

        <RNAnimated.View style={[celebStyles.badgeBox, { opacity: fadeAnim }]}>
          <Text style={celebStyles.badgeEmoji}>👑</Text>
          <Text style={celebStyles.badgeTitle}>Writing Master</Text>
          <Text style={celebStyles.badgeSub}>From scribbles to full A–Z — amazing journey!</Text>
        </RNAnimated.View>

        <RNAnimated.View style={[celebStyles.milestones, { opacity: fadeAnim }]}>
          {[
            'Free hand scribbling',
            'Controlled strokes',
            'Curved & straight lines',
            'Letter tracing A–Z',
            'Independent writing',
            'Copy from reference',
            'Free writing mastery',
          ].map((m, i) => (
            <View key={i} style={celebStyles.milestoneRow}>
              <Text style={celebStyles.milestoneCheck}>✅</Text>
              <Text style={celebStyles.milestoneText}>{m}</Text>
            </View>
          ))}
        </RNAnimated.View>

        <Pressable onPress={onDone} style={({ pressed }) => [celebStyles.doneBtn, pressed && celebStyles.pressed]}>
          <Text style={celebStyles.doneBtnText}>Finish Level 1</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const celebStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFBEB' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  trophyWrap: { marginBottom: 16 },
  trophy: { fontSize: 90 },
  title: { fontSize: 32, fontWeight: '900', color: '#92400E', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 17, fontWeight: '600', color: '#B45309', textAlign: 'center', marginBottom: 20, lineHeight: 24 },
  starsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  star: { fontSize: 36 },
  badgeBox: { backgroundColor: '#FEF3C7', borderRadius: 24, padding: 20, alignItems: 'center', borderWidth: 3, borderColor: '#F59E0B', marginBottom: 20, width: '100%', maxWidth: 340 },
  badgeEmoji: { fontSize: 44, marginBottom: 8 },
  badgeTitle: { fontSize: 22, fontWeight: '900', color: '#92400E', marginBottom: 4 },
  badgeSub: { fontSize: 14, color: '#B45309', textAlign: 'center', lineHeight: 20 },
  milestones: { width: '100%', maxWidth: 340, marginBottom: 20 },
  milestoneRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  milestoneCheck: { fontSize: 18 },
  milestoneText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  doneBtn: { backgroundColor: '#B45309', paddingVertical: 18, paddingHorizontal: 40, borderRadius: 20 },
  doneBtnText: { color: '#FFF', fontSize: 20, fontWeight: '900' },
  pressed: { opacity: 0.9 },
});

export function MasterSession10({ onExit }: Props = {}) {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [taskSuccess, setTaskSuccess] = useState<boolean | null>(null);
  const [showFinalCelebration, setShowFinalCelebration] = useState(false);

  const advance = useCallback(() => {
    setCompleted((c) => Math.min(c + 1, TOTAL_STEPS));
    setStep((s) => Math.min(s + 1, 6));
  }, []);

  const handleTaskComplete = useCallback((success: boolean) => {
    setTaskSuccess(success);
    if (success) {
      setCompleted((c) => Math.min(c + 1, TOTAL_STEPS));
      setShowFinalCelebration(true);
    }
  }, []);

  if (showFinalCelebration) {
    return <Level1CompleteCelebration onDone={() => { setShowFinalCelebration(false); setStep(6); }} />;
  }

  if (step === 0) {
    const cards = [
      { icon: '🏆', title: 'Full A–Z Writing', desc: 'Write the entire alphabet', step: 1 },
      { icon: '🧠', title: 'Memory Challenge', desc: 'Write letters from audio only', step: 2 },
      { icon: '🔥', title: 'Mixed Challenge', desc: 'Identify + write + trace combo', step: 3 },
      { icon: '🎨', title: 'Fun Writing', desc: 'Creative letter styles', step: 4 },
      { icon: '📷', title: 'Master Task', desc: 'Write A–Z clearly on paper', step: 5 },
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
            <Text style={styles.mascot}>👑</Text>
            <Text style={styles.mascotHint}>Final session — prove you're a writing master!</Text>
          </View>
          <Text style={styles.introTitle}>Master Writing</Text>
          <Text style={styles.introSub}>Session 10 · FINAL</Text>
          <View style={styles.finalBadge}>
            <Text style={styles.finalBadgeText}>🏆 LEVEL 1 FINALE 🏆</Text>
          </View>
          <View style={styles.progressRow}>
            <View style={styles.progressBg}><View style={[styles.progressFill, { width: pctW, backgroundColor: DESIGN.accent }]} /></View>
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
          <Text style={styles.resultTitle}>Level 1 Complete!</Text>
          <Text style={styles.resultSub}>You have mastered capital letter writing from A to Z!</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeStar}>👑</Text>
            <Text style={styles.badgeText}>Writing Master</Text>
          </View>
          <View style={styles.stats}>
            <Text style={styles.stat}>Games Completed: {completed}/{TOTAL_STEPS}</Text>
            <Text style={styles.stat}>Master Task: {taskSuccess === null ? '—' : taskSuccess ? '✓ Complete' : 'Try again'}</Text>
          </View>
          <View style={styles.starsRow}>
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <Text key={i} style={[styles.star, i < completed && styles.starEarned]}>⭐</Text>
            ))}
          </View>
          <View style={styles.journeyBox}>
            <Text style={styles.journeyTitle}>Your Journey:</Text>
            <Text style={styles.journeyItem}>Session 1: Free Hand & Grip</Text>
            <Text style={styles.journeyItem}>Session 2: Controlled Scribbling</Text>
            <Text style={styles.journeyItem}>Session 3: Curved Lines</Text>
            <Text style={styles.journeyItem}>Session 4: Straight-Line Letters</Text>
            <Text style={styles.journeyItem}>Session 5: Slant & Curve Letters</Text>
            <Text style={styles.journeyItem}>Session 6: Full A–Z Tracing</Text>
            <Text style={styles.journeyItem}>Session 7: Independent Tracing</Text>
            <Text style={styles.journeyItem}>Session 8: Copy Letters</Text>
            <Text style={styles.journeyItem}>Session 9: Free Writing</Text>
            <Text style={styles.journeyBold}>Session 10: Master Writing ✅</Text>
          </View>
          {onExit && (
            <Pressable style={({ pressed }) => [styles.doneBtn, pressed && styles.pressed]} onPress={onExit}>
              <Text style={styles.doneBtnText}>Finish Level 1</Text>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const goBack = () => setStep(0);

  return (
    <View style={styles.safe}>
      {step === 1 && <FullAZWritingGame currentStep={1} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={advance} />}
      {step === 2 && <MemoryChallengeGame currentStep={2} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={advance} />}
      {step === 3 && <MixedChallengeGame currentStep={3} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={advance} />}
      {step === 4 && <FunWritingGame currentStep={4} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={advance} />}
      {step === 5 && <MasterWritingUploadTask currentStep={5} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={handleTaskComplete} />}
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
  introTitle: { fontSize: 28, fontWeight: '900', color: DESIGN.primary, textAlign: 'center', marginBottom: 4 },
  introSub: { fontSize: 16, fontWeight: '800', color: '#DC2626', textAlign: 'center', marginBottom: 10 },
  finalBadge: { alignSelf: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 16, borderWidth: 2, borderColor: '#F59E0B', marginBottom: 16 },
  finalBadgeText: { fontSize: 16, fontWeight: '900', color: '#92400E' },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  progressBg: { flex: 1, height: 14, backgroundColor: '#FDE68A', borderRadius: 7, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 7 },
  progressText: { fontSize: 16, fontWeight: '700', minWidth: 48, color: DESIGN.primary },
  resultScroll: { flexGrow: 1, padding: 24, alignItems: 'center', paddingBottom: 40 },
  resultEmoji: { fontSize: 80, marginBottom: 16 },
  resultTitle: { fontSize: 28, fontWeight: '900', color: DESIGN.primary, textAlign: 'center', marginBottom: 6 },
  resultSub: { fontSize: 16, color: '#B45309', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingVertical: 18, paddingHorizontal: 30, borderRadius: 22, borderWidth: 3, borderColor: '#F59E0B', gap: 12, marginBottom: 24 },
  badgeStar: { fontSize: 36 },
  badgeText: { fontSize: 22, fontWeight: '900', color: '#92400E' },
  stats: { marginBottom: 16 },
  stat: { fontSize: 18, color: '#374151', marginBottom: 4 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  star: { fontSize: 30, opacity: 0.35 },
  starEarned: { opacity: 1 },
  journeyBox: { backgroundColor: '#FEF3C7', borderRadius: 20, padding: 18, width: '100%', marginBottom: 20 },
  journeyTitle: { fontSize: 16, fontWeight: '800', color: '#92400E', marginBottom: 8 },
  journeyItem: { fontSize: 14, color: '#78350F', marginBottom: 3 },
  journeyBold: { fontSize: 15, fontWeight: '800', color: '#059669', marginTop: 4 },
  doneBtn: { backgroundColor: DESIGN.primary, paddingVertical: 18, paddingHorizontal: 36, borderRadius: 18 },
  doneBtnText: { color: '#FFF', fontWeight: '900', fontSize: 20 },
});
