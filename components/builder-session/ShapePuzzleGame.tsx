/**
 * Builder Session 2 — Game 4: Mosaic Square Bench
 * Place 4 colored pieces into a 2×2 square puzzle.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { BUILDER_SESSION, PUZZLE_BENCH_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const PIECES = [
  { id: 'tl', label: 'Top-left', color: '#FBBF24' },
  { id: 'tr', label: 'Top-right', color: '#3B82F6' },
  { id: 'bl', label: 'Bottom-left', color: '#10B981' },
  { id: 'br', label: 'Bottom-right', color: '#EF4444' },
] as const;

const CORRECT_ORDER = ['tl', 'tr', 'bl', 'br'];
const SLOT_SIZE = 72;

export interface ShapePuzzleGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function ShapePuzzleGame({
  onComplete,
  onBack,
  currentStep = 4,
  totalSteps = 5,
  sessionTitle,
}: ShapePuzzleGameProps) {
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null, null]);
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);

  const shake = useSharedValue(0);
  const progressPct = Math.round((currentStep / totalSteps) * 100);
  const placedCount = slots.filter(Boolean).length;

  useEffect(() => {
    speakBuilderHint('Complete the square. Tap a piece, then tap a slot to place it.');
    return () => stopBuilderSpeech();
  }, []);

  const triggerWrong = useCallback(() => {
    setWrongFlash(true);
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-5, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    speakBuilderHint('Try again. Place the pieces to make a square.');
    setTimeout(() => setWrongFlash(false), 400);
  }, [shake]);

  const handlePieceTap = useCallback(
    (id: string) => {
      if (slots.some((s) => s === id)) return;
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* ignore */
      }
      setSelectedPiece(id);
      speakBuilderHint(PIECES.find((p) => p.id === id)?.label ?? id);
    },
    [slots]
  );

  const handleSlotTap = useCallback(
    (slotIndex: number) => {
      if (!selectedPiece) return;
      if (slots[slotIndex]) return;

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        /* ignore */
      }

      const next = [...slots];
      next[slotIndex] = selectedPiece;
      setSlots(next);
      setSelectedPiece(null);

      const allFilled = next.every((s) => s !== null);
      if (!allFilled) return;

      const correct = next.every((piece, i) => piece === CORRECT_ORDER[i]);
      if (correct) {
        speakBuilderHint('You completed the square!');
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          /* ignore */
        }
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        triggerWrong();
        setSlots([null, null, null, null]);
      }
    },
    [onComplete, selectedPiece, slots, triggerWrong]
  );

  const gridShake = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Square Complete!"
          subtitle="You built the mosaic square!"
          badgeEmoji="🧩"
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
          <View style={styles.placedPill}>
            <Text style={styles.placedPillText}>{placedCount}/4 placed</Text>
          </View>
        </View>

        <Text style={styles.title}>{T.name}</Text>
        {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}

        <View style={styles.speechBubble}>
          <Text style={styles.mascot}>{T.mascot}</Text>
          <View style={styles.bubbleBody}>
            <Text style={styles.mascotName}>{T.mascotName} says:</Text>
            <Pressable
              onPress={() =>
                speakBuilderHint('Complete the square. Tap a piece, then tap a slot to place it.')
              }
            >
              <Text style={styles.prompt}>Tap piece → tap slot 🔊</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.benchArea}>
        <View style={[styles.piecesPanel, wrongFlash && styles.panelWrong]}>
          <Text style={styles.panelLabel}>Puzzle Pieces</Text>
          <View style={styles.piecesRow}>
            {PIECES.map((p) => {
              const inSlot = slots.some((s) => s === p.id);
              return (
                <Pressable
                  key={p.id}
                  onPress={() => handlePieceTap(p.id)}
                  style={[
                    styles.piece,
                    { backgroundColor: p.color },
                    selectedPiece === p.id && styles.pieceSelected,
                    inSlot && styles.piecePlaced,
                  ]}
                  accessibilityLabel={p.label}
                />
              );
            })}
          </View>
        </View>

        <View style={styles.connector}>
          <Ionicons name="arrow-down" size={22} color={T.accent} />
        </View>

        <Animated.View style={[styles.gridWrap, gridShake]}>
          <Text style={styles.gridLabel}>Build the Square</Text>
          <View style={styles.grid}>
            {[0, 1, 2, 3].map((i) => {
              const pieceId = slots[i];
              const color = pieceId
                ? PIECES.find((p) => p.id === pieceId)?.color ?? T.slotEmpty
                : T.slotEmpty;
              return (
                <Pressable
                  key={i}
                  onPress={() => handleSlotTap(i)}
                  style={[
                    styles.slot,
                    { backgroundColor: color },
                    selectedPiece && !pieceId && styles.slotTarget,
                  ]}
                  accessibilityLabel={`Slot ${i + 1}`}
                >
                  {!pieceId ? <Text style={styles.slotHint}>?</Text> : null}
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {selectedPiece ? (
          <Text style={styles.hint}>Tap an empty slot to place the piece</Text>
        ) : (
          <Text style={styles.hint}>Pick a colored piece to begin</Text>
        )}
      </View>

      <View style={styles.colorLegend}>
        {PIECES.map((p) => (
          <View key={p.id} style={[styles.legendDot, { backgroundColor: p.color }]} />
        ))}
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
  placedPill: {
    backgroundColor: 'rgba(237, 233, 254, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
  },
  placedPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
  title: { fontSize: 26, fontWeight: '900', color: T.ink, textAlign: 'center' },
  subtitle: { fontSize: 14, fontWeight: '600', color: T.inkMuted, textAlign: 'center' },
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
  mascotName: { fontSize: 12, fontWeight: '800', color: T.accentDeep, textTransform: 'uppercase' },
  prompt: { fontSize: 16, fontWeight: '800', color: T.ink },
  benchArea: { flex: 1, paddingHorizontal: 20, justifyContent: 'center', gap: 8 },
  piecesPanel: {
    backgroundColor: T.panel,
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 2,
    borderColor: T.panelBorder,
    padding: 14,
    ...BUILDER_SESSION.shadow.soft,
  },
  panelWrong: { borderColor: T.wrong },
  panelLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: T.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    textAlign: 'center',
  },
  piecesRow: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  piece: {
    width: 58,
    height: 58,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  pieceSelected: { borderColor: '#22C55E', borderWidth: 4 },
  piecePlaced: { opacity: 0.35 },
  connector: { alignItems: 'center', paddingVertical: 2 },
  gridWrap: {
    backgroundColor: T.panel,
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 2,
    borderColor: T.panelBorder,
    padding: 16,
    alignItems: 'center',
    ...BUILDER_SESSION.shadow.card,
  },
  gridLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: T.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: SLOT_SIZE * 2 + 12,
  },
  slot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    margin: 3,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: T.slotBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotTarget: { borderColor: T.accentSoft, borderWidth: 4 },
  slotHint: { fontSize: 22, fontWeight: '900', color: '#94A3B8' },
  hint: { fontSize: 14, fontWeight: '700', color: T.inkMuted, textAlign: 'center', marginTop: 4 },
  colorLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
});
