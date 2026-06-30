/**
 * Counter Session 3 — Game 4: Cloud House Builder
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { CLOUD_HOUSE_THEME as T, COUNTER_SESSION } from '../counterSessionTheme';
import { speakCounterHint, speakCounterWord, stopCounterSpeech } from '../counterSessionSpeech';
import { ShapeSkywayBackground } from '../ShapeSkywayBackground';

const PARTS = [
  { id: 'roof', label: 'Roof', emoji: '🏠' },
  { id: 'wall', label: 'Wall', emoji: '🧱' },
  { id: 'door', label: 'Door', emoji: '🚪' },
] as const;

type PartId = (typeof PARTS)[number]['id'];

export function DragPartsHouseGame({
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
  const [slots, setSlots] = useState<Record<PartId, boolean>>({ roof: false, wall: false, door: false });
  const [selectedPart, setSelectedPart] = useState<PartId | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const progressPct = Math.round((currentStep / totalSteps) * 100);
  const placedCount = Object.values(slots).filter(Boolean).length;

  useEffect(() => {
    speakCounterHint(
      'Assemble the house. Tap a part, then tap where it goes: roof on top, wall in middle, door at bottom.'
    );
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
        speakCounterHint('You built a house!');
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
        <SuccessCelebration
          title="House Built!"
          subtitle="Roof, wall, and door are in place!"
          badgeEmoji="🏠"
          variant="ocean"
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={[...T.gradient]} locations={[...T.gradientLocations]} style={StyleSheet.absoluteFill} />
      <ShapeSkywayBackground />

      {onBack ? (
        <Pressable onPress={onBack} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
          <Ionicons name="arrow-back" size={22} color={T.accentDeep} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      ) : null}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <View style={styles.stepPill}>
              <Text style={styles.stepPillText}>
                Quest {currentStep} · {progressPct}%
              </Text>
            </View>
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>
                {placedCount}/{PARTS.length} placed
              </Text>
            </View>
          </View>
          <Text style={styles.title}>{T.name}</Text>
          {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}
          <View style={styles.speechBubble}>
            <Text style={styles.mascot}>{T.mascot}</Text>
            <View style={styles.bubbleBody}>
              <Text style={styles.mascotName}>{T.mascotName} says:</Text>
              <Pressable onPress={() => speakCounterHint('Tap a part, then tap a slot on the house.')}>
                <Text style={styles.prompt}>Build the cloud house 🔊</Text>
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
              style={[styles.partBtn, selectedPart === p.id && styles.partSelected]}
            >
              <Text style={styles.partEmoji}>{p.emoji}</Text>
              <Text style={styles.partLabel}>{p.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>House</Text>
        <View style={styles.houseFrame}>
          {(['roof', 'wall', 'door'] as PartId[]).map((slotId) => {
            const part = PARTS.find((p) => p.id === slotId);
            return (
              <Pressable
                key={slotId}
                style={[styles.slot, slots[slotId] && styles.slotFilled]}
                onPress={() => handleSlotTap(slotId)}
              >
                <Text style={styles.slotText}>{slots[slotId] ? part?.emoji : '?'}</Text>
                <Text style={styles.slotLabel}>{part?.label}</Text>
              </Pressable>
            );
          })}
        </View>
        {selectedPart ? (
          <Text style={styles.hint}>
            Tap a slot to place the {PARTS.find((p) => p.id === selectedPart)?.label.toLowerCase()}
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: Platform.OS === 'ios' ? 32 : 20 },
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
  header: { paddingHorizontal: 20, paddingTop: 8, gap: 8, zIndex: 5 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepPill: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: COUNTER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
  countPill: {
    backgroundColor: 'rgba(186, 230, 253, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: COUNTER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.accentSoft,
  },
  countPillText: { fontSize: 12, fontWeight: '800', color: T.ink },
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
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: T.inkMuted,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
  },
  partsRow: { flexDirection: 'row', gap: 12, justifyContent: 'center', paddingHorizontal: 20 },
  partBtn: {
    width: 88,
    paddingVertical: 14,
    borderRadius: COUNTER_SESSION.radius.card,
    borderWidth: 3,
    borderColor: T.panelBorder,
    backgroundColor: T.panel,
    alignItems: 'center',
    ...COUNTER_SESSION.shadow.soft,
  },
  partSelected: { borderColor: T.accent, backgroundColor: T.partSelected },
  partEmoji: { fontSize: 32, marginBottom: 4 },
  partLabel: { fontSize: 13, fontWeight: '800', color: T.ink },
  houseFrame: {
    marginHorizontal: 20,
    borderWidth: 2,
    borderColor: T.frameBorder,
    borderRadius: COUNTER_SESSION.radius.card,
    padding: 14,
    backgroundColor: T.frame,
    gap: 8,
    ...COUNTER_SESSION.shadow.soft,
  },
  slot: {
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: T.panelBorder,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  slotFilled: { backgroundColor: T.slotFilled, borderColor: '#22C55E' },
  slotText: { fontSize: 28 },
  slotLabel: { fontSize: 11, fontWeight: '700', color: T.inkMuted, marginTop: 4 },
  hint: { marginTop: 16, fontSize: 14, fontWeight: '700', color: T.inkMuted, textAlign: 'center', paddingHorizontal: 20 },
});
