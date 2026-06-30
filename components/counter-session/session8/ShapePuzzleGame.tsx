/**
 * Counter Session 8 — Game 4: Shape Hole Puzzle — fit shapes into matching holes
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { SHAPE_HOLE_THEME as T, COUNTER_SESSION } from '../counterSessionTheme';
import { speakCounterHint, speakCounterWord, stopCounterSpeech } from '../counterSessionSpeech';
import { MoodMeadowBackground } from '../MoodMeadowBackground';

const SHAPES = [
  { id: 'circle', label: 'Circle', symbol: '⭕' },
  { id: 'square', label: 'Square', symbol: '⬜' },
  { id: 'triangle', label: 'Triangle', symbol: '🔺' },
] as const;

type ShapeId = (typeof SHAPES)[number]['id'];

export function ShapePuzzleGame({
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
  const [slots, setSlots] = useState<Record<ShapeId, boolean>>({ circle: false, square: false, triangle: false });
  const [selectedShape, setSelectedShape] = useState<ShapeId | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const shake = useSharedValue(0);
  const progressPct = Math.round((currentStep / totalSteps) * 100);
  const placedCount = Object.values(slots).filter(Boolean).length;

  useEffect(() => {
    speakCounterHint('Fit each shape into its matching hole. Tap a shape, then tap the correct hole.');
    return () => stopCounterSpeech();
  }, []);

  const triggerWrong = useCallback(() => {
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    speakCounterHint('Try again. Each shape fits in its own hole.');
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      /* ignore */
    }
  }, [shake]);

  const handleShapeTap = useCallback(
    (id: ShapeId) => {
      if (placedCount >= 3) return;
      setSelectedShape(id);
      const shape = SHAPES.find((s) => s.id === id);
      speakCounterWord(shape?.label ?? id);
    },
    [placedCount]
  );

  const handleHoleTap = useCallback(
    (holeId: ShapeId) => {
      if (!selectedShape || slots[holeId]) return;
      if (selectedShape !== holeId) {
        triggerWrong();
        setSelectedShape(null);
        return;
      }
      const next = { ...slots, [holeId]: true };
      setSlots(next);
      setSelectedShape(null);
      speakCounterHint('Correct!');
      const allFilled = SHAPES.every((s) => next[s.id]);
      if (allFilled) {
        speakCounterHint('You fitted all the shapes!');
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          /* ignore */
        }
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [selectedShape, slots, onComplete, triggerWrong]
  );

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration title="Shapes Fitted!" subtitle="All shapes in their holes!" badgeEmoji="🧩" variant="ocean" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={[...T.gradient]} locations={[...T.gradientLocations]} style={StyleSheet.absoluteFill} />
      <MoodMeadowBackground />
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
              <Pressable onPress={() => speakCounterHint('Tap a shape, then tap its matching hole.')}>
                <Text style={styles.prompt}>Fit the shapes 🔊</Text>
              </Pressable>
            </View>
          </View>
        </View>
        <Text style={styles.sectionLabel}>Shapes ({placedCount}/3)</Text>
        <Animated.View style={[styles.shapesRow, shakeStyle]}>
          {SHAPES.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => handleShapeTap(s.id)}
              style={[styles.shapeBtn, selectedShape === s.id && styles.selected]}
              accessibilityLabel={s.label}
            >
              <Text style={styles.shapeSymbol}>{s.symbol}</Text>
              <Text style={styles.shapeLabel}>{s.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
        <Text style={styles.sectionLabel}>Holes</Text>
        <View style={styles.holesRow}>
          {SHAPES.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => handleHoleTap(s.id)}
              style={[styles.hole, slots[s.id] && styles.holeFilled]}
              accessibilityLabel={`${s.label} hole`}
            >
              <Text style={styles.holeText}>{slots[s.id] ? s.symbol : '?'}</Text>
            </Pressable>
          ))}
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
  shapesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 20 },
  shapeBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: T.shapeBtn,
    borderWidth: 3,
    borderColor: T.shapeBorder,
    alignItems: 'center',
    minWidth: 88,
    ...COUNTER_SESSION.shadow.soft,
  },
  selected: { backgroundColor: '#EDE9FE', borderColor: T.accent },
  shapeSymbol: { fontSize: 38, marginBottom: 4 },
  shapeLabel: { fontSize: 13, fontWeight: '700', color: T.ink },
  holesRow: { flexDirection: 'row', gap: 16 },
  hole: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: T.hole,
    borderWidth: 4,
    borderColor: T.holeBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holeFilled: { backgroundColor: '#EDE9FE' },
  holeText: { fontSize: 34 },
});
