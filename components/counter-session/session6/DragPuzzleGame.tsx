/**
 * Counter Session 6 — Game 3: Pup Puzzle Ridge — complete the dog puzzle
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { PUP_PUZZLE_THEME as T, COUNTER_SESSION } from '../counterSessionTheme';
import { speakCounterHint, speakCounterWord, stopCounterSpeech } from '../counterSessionSpeech';
import { EagleLookoutBackground } from '../EagleLookoutBackground';

const PARTS = [
  { id: 'top', label: 'Top', emoji: '🐕' },
  { id: 'mid', label: 'Middle', emoji: '🐾' },
  { id: 'bottom', label: 'Bottom', emoji: '🐕' },
] as const;

type PartId = (typeof PARTS)[number]['id'];

export function DragPuzzleGame({
  onComplete,
  onBack,
  currentStep = 3,
  totalSteps = 5,
  sessionTitle,
}: {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}) {
  const [slots, setSlots] = useState<Record<PartId, boolean>>({ top: false, mid: false, bottom: false });
  const [selectedPart, setSelectedPart] = useState<PartId | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const progressPct = Math.round((currentStep / totalSteps) * 100);
  const placedCount = Object.values(slots).filter(Boolean).length;

  useEffect(() => {
    speakCounterHint('Complete the dog puzzle. Tap a part, then tap a slot to place it.');
    return () => stopCounterSpeech();
  }, []);

  const handlePartTap = useCallback(
    (id: PartId) => {
      if (placedCount >= PARTS.length) return;
      setSelectedPart(id);
      const part = PARTS.find((p) => p.id === id);
      speakCounterWord(part?.label ?? id);
    },
    [placedCount]
  );

  const handleSlotTap = useCallback(
    (slotId: PartId) => {
      if (!selectedPart || slots[slotId]) return;
      const next = { ...slots, [slotId]: true };
      setSlots(next);
      setSelectedPart(null);
      const allFilled = PARTS.every((p) => next[p.id]);
      if (allFilled) {
        speakCounterHint('You completed the dog puzzle!');
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          /* ignore */
        }
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [selectedPart, slots, onComplete]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration title="Pup Complete!" subtitle="You built the dog puzzle!" badgeEmoji="🐕" variant="ocean" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={[...T.gradient]} locations={[...T.gradientLocations]} style={StyleSheet.absoluteFill} />
      <EagleLookoutBackground />
      {onBack ? (
        <Pressable onPress={onBack} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
          <Ionicons name="arrow-back" size={22} color={T.accentDeep} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      ) : null}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>Quest {currentStep} · {progressPct}%</Text>
          </View>
          <Text style={styles.title}>{T.name}</Text>
          {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}
          <View style={styles.speechBubble}>
            <Text style={styles.mascot}>{T.mascot}</Text>
            <View style={styles.bubbleBody}>
              <Text style={styles.mascotName}>{T.mascotName} says:</Text>
              <Pressable onPress={() => speakCounterHint('Tap a part, then tap a slot.')}>
                <Text style={styles.prompt}>Build the dog 🔊</Text>
              </Pressable>
            </View>
          </View>
        </View>
        <Text style={styles.sectionLabel}>Puzzle parts</Text>
        <View style={styles.partsRow}>
          {PARTS.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => handlePartTap(p.id)}
              style={[styles.partBtn, selectedPart === p.id && styles.selected]}
              accessibilityLabel={p.label}
            >
              <Text style={styles.partEmoji}>{p.emoji}</Text>
              <Text style={styles.partLabel}>{p.label}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.sectionLabel}>Put the dog together ({placedCount}/3)</Text>
        <View style={styles.puzzleFrame}>
          <Pressable style={[styles.slot, slots.top && styles.slotFilled]} onPress={() => handleSlotTap('top')}>
            <Text style={styles.slotText}>{slots.top ? '🐕' : '?'}</Text>
          </Pressable>
          <Pressable style={[styles.slot, slots.mid && styles.slotFilled]} onPress={() => handleSlotTap('mid')}>
            <Text style={styles.slotText}>{slots.mid ? '🐾' : '?'}</Text>
          </Pressable>
          <Pressable style={[styles.slot, slots.bottom && styles.slotFilled]} onPress={() => handleSlotTap('bottom')}>
            <Text style={styles.slotText}>{slots.bottom ? '🐕' : '?'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: Platform.OS === 'ios' ? 32 : 20, alignItems: 'center', paddingHorizontal: 20 },
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
    borderRadius: COUNTER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
    zIndex: 10,
    ...COUNTER_SESSION.shadow.soft,
  },
  backText: { fontSize: 15, fontWeight: '700', color: T.accentDeep },
  header: { paddingHorizontal: 0, paddingTop: 8, gap: 8, zIndex: 5, width: '100%' },
  stepPill: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: COUNTER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
  title: { fontSize: 26, fontWeight: '900', color: T.ink, textAlign: 'center' },
  subtitle: { fontSize: 12, fontWeight: '600', color: T.inkMuted, textAlign: 'center' },
  speechBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: T.panel,
    borderRadius: COUNTER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 14,
    ...COUNTER_SESSION.shadow.soft,
  },
  mascot: { fontSize: 32 },
  bubbleBody: { flex: 1, gap: 2 },
  mascotName: { fontSize: 12, fontWeight: '800', color: T.accentDeep, textTransform: 'uppercase' },
  prompt: { fontSize: 14, fontWeight: '700', color: T.ink },
  sectionLabel: { fontSize: 16, fontWeight: '800', color: T.accentDeep, marginTop: 16, marginBottom: 12, alignSelf: 'flex-start' },
  partsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  partBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: T.partBtn,
    borderWidth: 3,
    borderColor: T.partBorder,
    alignItems: 'center',
    minWidth: 80,
    ...COUNTER_SESSION.shadow.soft,
  },
  selected: { backgroundColor: '#FEF3C7', borderColor: T.accent },
  partEmoji: { fontSize: 34, marginBottom: 4 },
  partLabel: { fontSize: 13, fontWeight: '700', color: T.ink },
  puzzleFrame: {
    backgroundColor: T.panel,
    borderRadius: COUNTER_SESSION.radius.card,
    padding: 20,
    borderWidth: 4,
    borderColor: T.panelBorder,
    gap: 12,
    ...COUNTER_SESSION.shadow.card,
  },
  slot: {
    width: 110,
    height: 58,
    borderRadius: 14,
    backgroundColor: T.slot,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: T.slotBorder,
  },
  slotFilled: { backgroundColor: '#FEF9C3' },
  slotText: { fontSize: 32 },
});
