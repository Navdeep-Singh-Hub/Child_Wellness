/**
 * Builder Session 6 — Game 2: Compass Trail Crossing
 * Tap LEFT or RIGHT to follow direction prompts.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { BUILDER_SESSION, COMPASS_TRAIL_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const ROUNDS = [
  { direction: 'left' as const, prompt: 'Move LEFT.', label: 'Left' },
  { direction: 'right' as const, prompt: 'Move RIGHT.', label: 'Right' },
  { direction: 'left' as const, prompt: 'Move LEFT.', label: 'Left' },
];

export interface DirectionGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function DirectionGame({
  onComplete,
  onBack,
  currentStep = 2,
  totalSteps = 5,
  sessionTitle,
}: DirectionGameProps) {
  const [round, setRound] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [leftState, setLeftState] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [rightState, setRightState] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [locked, setLocked] = useState(false);

  const current = ROUNDS[round];
  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakBuilderHint(current.prompt);
    return () => stopBuilderSpeech();
  }, [round, current.prompt]);

  const handleTap = useCallback(
    (direction: 'left' | 'right') => {
      if (locked) return;

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* ignore */
      }

      if (direction !== current.direction) {
        if (direction === 'left') setLeftState('wrong');
        else setRightState('wrong');
        speakBuilderHint(`Try again. Tap ${current.label}.`);
        setTimeout(() => {
          setLeftState('idle');
          setRightState('idle');
        }, 500);
        return;
      }

      setLocked(true);
      if (direction === 'left') setLeftState('correct');
      else setRightState('correct');
      speakBuilderHint(`Correct! ${current.label}!`);

      if (round + 1 >= ROUNDS.length) {
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setTimeout(() => {
          setRound((r) => r + 1);
          setLeftState('idle');
          setRightState('idle');
          setLocked(false);
        }, 700);
      }
    },
    [current, locked, onComplete, round]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Trail Complete!"
          subtitle="You followed every direction!"
          badgeEmoji="🧭"
          variant="indigo"
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...T.gradient]}
        locations={[...T.gradientLocations]}
        style={StyleSheet.absoluteFill}
      />
      <MountainWorkshopBackground />

      {onBack ? (
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={T.accentDeep} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      ) : null}

      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>
              Build {currentStep} · {progressPct}%
            </Text>
          </View>
          <View style={styles.roundPill}>
            <Text style={styles.roundPillText}>
              Round {round + 1}/{ROUNDS.length}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{T.name}</Text>
        {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}

        <View style={styles.speechBubble}>
          <Text style={styles.mascot}>{T.mascot}</Text>
          <View style={styles.bubbleBody}>
            <Text style={styles.mascotName}>{T.mascotName} says:</Text>
            <Pressable onPress={() => speakBuilderHint(current.prompt)}>
              <Text style={styles.prompt}>{current.prompt} 🔊</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.playArea}>
        <View style={styles.panel}>
          <Text style={styles.travelEmoji}>🚗</Text>
          <View style={styles.buttonsRow}>
            <Pressable
              onPress={() => handleTap('left')}
              disabled={locked}
              style={({ pressed }) => [
                styles.dirBtn,
                { backgroundColor: T.leftBtn },
                leftState === 'correct' && styles.correctBtn,
                leftState === 'wrong' && styles.wrongBtn,
                pressed && !locked && styles.pressed,
              ]}
              accessibilityLabel="Move left"
            >
              <Ionicons name="arrow-back" size={40} color="#FFF" />
              <Text style={styles.dirLabel}>LEFT</Text>
            </Pressable>
            <Pressable
              onPress={() => handleTap('right')}
              disabled={locked}
              style={({ pressed }) => [
                styles.dirBtn,
                { backgroundColor: T.rightBtn },
                rightState === 'correct' && styles.correctBtn,
                rightState === 'wrong' && styles.wrongBtn,
                pressed && !locked && styles.pressed,
              ]}
              accessibilityLabel="Move right"
            >
              <Ionicons name="arrow-forward" size={40} color="#FFF" />
              <Text style={styles.dirLabel}>RIGHT</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: Platform.OS === 'web' ? 12 : 48,
    marginLeft: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
    zIndex: 10,
    ...BUILDER_SESSION.shadow.soft,
  },
  backText: { fontSize: 15, fontWeight: '700', color: T.accentDeep },
  header: { paddingHorizontal: 20, paddingTop: 8, gap: 8, zIndex: 5 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepPill: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
  roundPill: {
    backgroundColor: 'rgba(224, 242, 254, 0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.accentSoft,
  },
  roundPillText: { fontSize: 12, fontWeight: '800', color: T.ink },
  title: { fontSize: 26, fontWeight: '900', color: T.ink, textAlign: 'center' },
  subtitle: { fontSize: 12, fontWeight: '600', color: T.inkMuted, textAlign: 'center' },
  speechBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: T.panel,
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 14,
    ...BUILDER_SESSION.shadow.soft,
  },
  mascot: { fontSize: 32 },
  bubbleBody: { flex: 1, gap: 2 },
  mascotName: { fontSize: 11, fontWeight: '800', color: T.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  prompt: { fontSize: 14, fontWeight: '700', color: T.ink, lineHeight: 20 },
  playArea: { flex: 1, paddingHorizontal: 20, justifyContent: 'center' },
  panel: {
    backgroundColor: T.panel,
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 24,
    alignItems: 'center',
    ...BUILDER_SESSION.shadow.card,
  },
  travelEmoji: { fontSize: 56, marginBottom: 20 },
  buttonsRow: { flexDirection: 'row', gap: 20 },
  dirBtn: {
    width: 110,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  dirLabel: { fontSize: 13, fontWeight: '900', color: '#FFF' },
  correctBtn: { borderColor: T.tileCorrect },
  wrongBtn: { borderColor: T.tileWrong },
});
