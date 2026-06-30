/**
 * Builder Session 9 — Game 3: House Build Yard
 * Place roof, wall, and door to build a house.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { BUILDER_SESSION, HOUSE_BUILD_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const PARTS = [
  { id: 'roof', label: 'Roof', emoji: '🏠', slotEmoji: '🏠' },
  { id: 'wall', label: 'Wall', emoji: '🧱', slotEmoji: '🧱' },
  { id: 'door', label: 'Door', emoji: '🚪', slotEmoji: '🚪' },
] as const;

type PartId = (typeof PARTS)[number]['id'];

export interface DragToBuildHouseGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function DragToBuildHouseGame({
  onComplete,
  onBack,
  currentStep = 3,
  totalSteps = 5,
  sessionTitle,
}: DragToBuildHouseGameProps) {
  const [slots, setSlots] = useState<Record<PartId, boolean>>({
    roof: false,
    wall: false,
    door: false,
  });
  const [selectedPart, setSelectedPart] = useState<PartId | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  const progressPct = Math.round((currentStep / totalSteps) * 100);
  const placedCount = Object.values(slots).filter(Boolean).length;

  useEffect(() => {
    speakBuilderHint(
      'Build the house. Tap a part, then tap a slot: roof on top, wall in middle, door at bottom.'
    );
    return () => stopBuilderSpeech();
  }, []);

  const handlePartTap = useCallback(
    (id: PartId) => {
      if (placedCount >= PARTS.length) return;
      setSelectedPart(id);
      speakBuilderHint(PARTS.find((p) => p.id === id)?.label ?? id);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* ignore */
      }
    },
    [placedCount]
  );

  const handleSlotTap = useCallback(
    (slotId: PartId) => {
      if (!selectedPart || slots[slotId]) return;

      const next = { ...slots, [slotId]: true };
      setSlots(next);
      setSelectedPart(null);

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        /* ignore */
      }

      const allFilled = PARTS.every((p) => next[p.id]);
      if (allFilled) {
        speakBuilderHint('You built a house!');
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          /* ignore */
        }
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [onComplete, selectedPart, slots]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="House Complete!"
          subtitle="You built the whole house!"
          badgeEmoji="🏠"
          variant="sunset"
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

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <View style={styles.stepPill}>
              <Text style={styles.stepPillText}>
                Build {currentStep} · {progressPct}%
              </Text>
            </View>
            <View style={styles.placedPill}>
              <Text style={styles.placedPillText}>{placedCount}/3 parts</Text>
            </View>
          </View>

          <Text style={styles.title}>{T.name}</Text>
          {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}

          <View style={styles.speechBubble}>
            <Text style={styles.mascot}>{T.mascot}</Text>
            <View style={styles.bubbleBody}>
              <Text style={styles.mascotName}>{T.mascotName} says:</Text>
              <Pressable
                onPress={() => speakBuilderHint('Tap a part, then tap where it goes on the house.')}
              >
                <Text style={styles.prompt}>Build the house 🔊</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.yard}>
          <Text style={styles.sectionLabel}>Parts</Text>
          <View style={styles.partsRow}>
            {PARTS.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => handlePartTap(p.id)}
                style={[
                  styles.partCard,
                  selectedPart === p.id && styles.partSelected,
                  placedCount >= PARTS.length && styles.partDone,
                ]}
                accessibilityLabel={p.label}
              >
                <Text style={styles.partEmoji}>{p.emoji}</Text>
                <Text style={styles.partLabel}>{p.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionLabel}>House frame</Text>
          <View style={styles.houseFrame}>
            {PARTS.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => handleSlotTap(p.id)}
                style={[styles.slot, slots[p.id] && styles.slotFilled]}
                accessibilityLabel={`${p.label} slot`}
              >
                <Text style={styles.slotText}>{slots[p.id] ? p.slotEmoji : '?'}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.hint}>
            {selectedPart
              ? `Tap a slot to place the ${PARTS.find((p) => p.id === selectedPart)?.label.toLowerCase()}`
              : 'Tap a part first, then a slot on the house'}
          </Text>
        </View>
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
  placedPill: {
    backgroundColor: 'rgba(254, 243, 199, 0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.accentSoft,
  },
  placedPillText: { fontSize: 12, fontWeight: '800', color: T.ink },
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
  yard: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: BUILDER_SESSION.radius.card,
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.panelBorder,
    ...BUILDER_SESSION.shadow.card,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: T.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  partsRow: { flexDirection: 'row', gap: 10, marginBottom: 18, justifyContent: 'center' },
  partCard: {
    width: 88,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: T.partCard,
    borderWidth: 3,
    borderColor: T.partBorder,
    alignItems: 'center',
  },
  partSelected: { borderColor: '#22C55E', backgroundColor: T.selected },
  partDone: { opacity: 0.45 },
  partEmoji: { fontSize: 30, marginBottom: 4 },
  partLabel: { fontSize: 12, fontWeight: '800', color: T.ink },
  houseFrame: {
    borderWidth: 3,
    borderColor: T.slotBorder,
    borderRadius: 16,
    padding: 12,
    backgroundColor: T.slot,
    marginBottom: 8,
  },
  slot: {
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: T.slotBorder,
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  slotFilled: { backgroundColor: T.slotFilled, borderColor: '#22C55E', marginBottom: 8 },
  slotText: { fontSize: 28 },
  hint: { marginTop: 8, fontSize: 14, fontWeight: '700', color: T.inkMuted, textAlign: 'center' },
});
