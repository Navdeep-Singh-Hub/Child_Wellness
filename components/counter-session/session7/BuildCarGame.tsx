/**
 * Counter Session 7 — Game 4: Car Build Workshop — body + two wheels
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { CAR_BUILD_THEME as T, COUNTER_SESSION } from '../counterSessionTheme';
import { speakCounterHint, speakCounterWord, stopCounterSpeech } from '../counterSessionSpeech';
import { PuzzlePeakBackground } from '../PuzzlePeakBackground';

const PARTS = [
  { id: 'body', label: 'Body', emoji: '🚗' },
  { id: 'wheel1', label: 'Wheel', emoji: '⚙️' },
  { id: 'wheel2', label: 'Wheel', emoji: '⚙️' },
] as const;

type PartId = (typeof PARTS)[number]['id'];

export function BuildCarGame({
  onComplete,
  onBack,
  currentStep = 4,
  totalSteps = 5,
  sessionTitle,
}: {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}) {
  const [slots, setSlots] = useState<Record<PartId, boolean>>({ body: false, wheel1: false, wheel2: false });
  const [selectedPart, setSelectedPart] = useState<PartId | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const progressPct = Math.round((currentStep / totalSteps) * 100);
  const placedCount = Object.values(slots).filter(Boolean).length;

  useEffect(() => {
    speakCounterHint('Build the car. Tap a part, then tap where it goes: body in the middle, wheels on the sides.');
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
        speakCounterHint('You built a car!');
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
        <SuccessCelebration title="Car Built!" subtitle="You built the car!" badgeEmoji="🚗" variant="ocean" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={[...T.gradient]} locations={[...T.gradientLocations]} style={StyleSheet.absoluteFill} />
      <PuzzlePeakBackground />
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
              <Pressable onPress={() => speakCounterHint('Tap a part, then tap a slot to build the car.')}>
                <Text style={styles.prompt}>Build the car 🔊</Text>
              </Pressable>
            </View>
          </View>
        </View>
        <Text style={styles.sectionLabel}>Parts</Text>
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
        <Text style={styles.sectionLabel}>Car ({placedCount}/3)</Text>
        <View style={styles.carFrame}>
          <Pressable
            style={[styles.slot, styles.slotBody, slots.body && styles.slotFilled]}
            onPress={() => handleSlotTap('body')}
            accessibilityLabel="Body slot"
          >
            <Text style={styles.slotText}>{slots.body ? '🚗' : '?'}</Text>
          </Pressable>
          <View style={styles.wheelsRow}>
            <Pressable
              style={[styles.slot, styles.slotWheel, slots.wheel1 && styles.slotFilled]}
              onPress={() => handleSlotTap('wheel1')}
              accessibilityLabel="Wheel slot"
            >
              <Text style={styles.slotText}>{slots.wheel1 ? '⚙️' : '?'}</Text>
            </Pressable>
            <Pressable
              style={[styles.slot, styles.slotWheel, slots.wheel2 && styles.slotFilled]}
              onPress={() => handleSlotTap('wheel2')}
              accessibilityLabel="Wheel slot"
            >
              <Text style={styles.slotText}>{slots.wheel2 ? '⚙️' : '?'}</Text>
            </Pressable>
          </View>
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
  selected: { backgroundColor: '#FEE2E2', borderColor: T.accent },
  partEmoji: { fontSize: 34, marginBottom: 4 },
  partLabel: { fontSize: 13, fontWeight: '700', color: T.ink },
  carFrame: {
    backgroundColor: T.panel,
    borderRadius: COUNTER_SESSION.radius.card,
    padding: 20,
    borderWidth: 4,
    borderColor: T.panelBorder,
    alignItems: 'center',
    gap: 12,
    ...COUNTER_SESSION.shadow.card,
  },
  slot: {
    borderRadius: 14,
    backgroundColor: T.slot,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: T.slotBorder,
  },
  slotBody: { width: 120, height: 56 },
  wheelsRow: { flexDirection: 'row', gap: 24 },
  slotWheel: { width: 56, height: 56 },
  slotFilled: { backgroundColor: '#FECACA' },
  slotText: { fontSize: 28 },
});
