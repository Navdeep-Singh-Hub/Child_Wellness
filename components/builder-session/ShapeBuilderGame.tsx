/**
 * Builder Session 7 — Game 4: Stick Frame Workshop
 * Build a square by placing 4 sticks on its sides.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { BUILDER_SESSION, STICK_FRAME_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const SIDES = ['top', 'right', 'bottom', 'left'] as const;
type Side = (typeof SIDES)[number];

const sideLength = 96;
const slotThickness = 24;

export interface ShapeBuilderGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function ShapeBuilderGame({
  onComplete,
  onBack,
  currentStep = 4,
  totalSteps = 5,
  sessionTitle,
}: ShapeBuilderGameProps) {
  const [slots, setSlots] = useState<Record<Side, boolean>>({
    top: false,
    right: false,
    bottom: false,
    left: false,
  });
  const [selectedStick, setSelectedStick] = useState<number | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  const progressPct = Math.round((currentStep / totalSteps) * 100);
  const placedCount = Object.values(slots).filter(Boolean).length;

  useEffect(() => {
    speakBuilderHint('Build the square. Tap a stick, then tap a side to place it.');
    return () => stopBuilderSpeech();
  }, []);

  const handleStickTap = useCallback(
    (index: number) => {
      if (placedCount >= 4) return;
      setSelectedStick(index);
      speakBuilderHint(`Stick ${index + 1}`);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* ignore */
      }
    },
    [placedCount]
  );

  const handleSlotTap = useCallback(
    (side: Side) => {
      if (selectedStick === null || slots[side]) return;

      const next = { ...slots, [side]: true };
      setSlots(next);
      setSelectedStick(null);

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        /* ignore */
      }

      const allFilled = SIDES.every((s) => next[s]);
      if (allFilled) {
        speakBuilderHint('You built a square!');
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          /* ignore */
        }
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [onComplete, selectedStick, slots]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Frame Complete!"
          subtitle="You built a perfect square!"
          badgeEmoji="⬜"
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
              <Text style={styles.placedPillText}>{placedCount}/4 sides</Text>
            </View>
          </View>

          <Text style={styles.title}>{T.name}</Text>
          {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}

          <View style={styles.speechBubble}>
            <Text style={styles.mascot}>{T.mascot}</Text>
            <View style={styles.bubbleBody}>
              <Text style={styles.mascotName}>{T.mascotName} says:</Text>
              <Pressable
                onPress={() => speakBuilderHint('Tap a stick, then tap a side of the square.')}
              >
                <Text style={styles.prompt}>Build the square 🔊</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.workbench}>
          <Text style={styles.sectionLabel}>Sticks</Text>
          <View style={styles.sticksRow}>
            {[0, 1, 2, 3].map((i) => (
              <Pressable
                key={i}
                onPress={() => handleStickTap(i)}
                style={[
                  styles.stick,
                  selectedStick === i && styles.stickSelected,
                  placedCount > i && styles.stickPlaced,
                ]}
                accessibilityLabel={`Stick ${i + 1}`}
              >
                <View style={styles.stickLine} />
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Square frame</Text>
          <View style={styles.squareFrame}>
            <Pressable
              style={[styles.slot, styles.slotTop, slots.top && styles.slotFilled]}
              onPress={() => handleSlotTap('top')}
              accessibilityLabel="Top side"
            />
            <Pressable
              style={[styles.slot, styles.slotRight, slots.right && styles.slotFilled]}
              onPress={() => handleSlotTap('right')}
              accessibilityLabel="Right side"
            />
            <Pressable
              style={[styles.slot, styles.slotBottom, slots.bottom && styles.slotFilled]}
              onPress={() => handleSlotTap('bottom')}
              accessibilityLabel="Bottom side"
            />
            <Pressable
              style={[styles.slot, styles.slotLeft, slots.left && styles.slotFilled]}
              onPress={() => handleSlotTap('left')}
              accessibilityLabel="Left side"
            />
          </View>

          <Text style={styles.hint}>
            {selectedStick !== null
              ? 'Tap a side of the square to place the stick'
              : 'Tap a stick first, then a side'}
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
  workbench: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: BUILDER_SESSION.radius.card,
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.panelBorder,
    alignItems: 'center',
    ...BUILDER_SESSION.shadow.card,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: T.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  sticksRow: { flexDirection: 'row', gap: 12, marginBottom: 22 },
  stick: {
    width: 48,
    height: 24,
    borderRadius: 4,
    backgroundColor: T.stick,
    borderWidth: 3,
    borderColor: T.stickBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickLine: { width: 36, height: 4, backgroundColor: T.accentDeep, borderRadius: 2 },
  stickSelected: { borderColor: '#22C55E', backgroundColor: T.stickSelected },
  stickPlaced: { opacity: 0.35 },
  squareFrame: {
    width: sideLength + slotThickness * 2,
    height: sideLength + slotThickness * 2,
    position: 'relative',
    marginBottom: 8,
  },
  slot: {
    position: 'absolute',
    backgroundColor: T.slot,
    borderWidth: 4,
    borderColor: T.slotBorder,
    borderRadius: 8,
  },
  slotTop: { top: 0, left: slotThickness, width: sideLength, height: slotThickness },
  slotRight: { top: slotThickness, right: 0, width: slotThickness, height: sideLength },
  slotBottom: { bottom: 0, left: slotThickness, width: sideLength, height: slotThickness },
  slotLeft: { top: slotThickness, left: 0, width: slotThickness, height: sideLength },
  slotFilled: { backgroundColor: T.slotFilled, borderColor: T.slotFilled },
  hint: { marginTop: 8, fontSize: 14, fontWeight: '700', color: T.inkMuted, textAlign: 'center' },
});
