/**
 * Builder Session 4 — Game 2: Socket Shape Bench
 * Tap a shape, then tap its matching hole.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { BUILDER_SESSION, SOCKET_BENCH_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const SHAPES = [
  { id: 'circle', label: 'Circle', emoji: '⭕' },
  { id: 'square', label: 'Square', emoji: '⬜' },
  { id: 'triangle', label: 'Triangle', emoji: '🔺' },
];

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface ShapeHolesGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function ShapeHolesGame({
  onComplete,
  onBack,
  currentStep = 2,
  totalSteps = 5,
  sessionTitle,
}: ShapeHolesGameProps) {
  const [shuffledShapes] = useState(() => shuffleArray(SHAPES));
  const [shuffledHoles] = useState(() => shuffleArray(SHAPES));
  const [placed, setPlaced] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const shake = useSharedValue(0);

  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakBuilderHint('Place each shape in its matching socket. Tap a shape, then tap the correct hole.');
    return () => stopBuilderSpeech();
  }, []);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const triggerWrong = useCallback(() => {
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-5, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    speakBuilderHint('Try again. Match the shape to its socket.');
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      /* ignore */
    }
  }, [shake]);

  const handleShapeTap = useCallback(
    (id: string) => {
      if (placed.has(id)) return;
      setSelectedId(id);
      speakBuilderHint(SHAPES.find((s) => s.id === id)?.label ?? id);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* ignore */
      }
    },
    [placed]
  );

  const handleHoleTap = useCallback(
    (holeId: string) => {
      if (!selectedId) return;
      if (selectedId !== holeId) {
        triggerWrong();
        setSelectedId(null);
        return;
      }

      speakBuilderHint(`Correct! ${SHAPES.find((s) => s.id === selectedId)?.label} fits!`);
      const nextPlaced = new Set(placed).add(selectedId);
      setPlaced(nextPlaced);
      setSelectedId(null);

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        /* ignore */
      }

      if (nextPlaced.size >= shuffledShapes.length) {
        speakBuilderHint('All shapes placed!');
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [onComplete, placed, selectedId, shuffledShapes.length, triggerWrong]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Sockets Filled!"
          subtitle="Every shape found its matching hole!"
          badgeEmoji="⬜"
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

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <View style={styles.stepPill}>
              <Text style={styles.stepPillText}>
                Build {currentStep} · {progressPct}%
              </Text>
            </View>
            <View style={styles.placedPill}>
              <Text style={styles.placedPillText}>
                {placed.size}/{shuffledShapes.length} placed
              </Text>
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
                  speakBuilderHint('Tap a shape, then tap the matching socket hole.')
                }
              >
                <Text style={styles.prompt}>Match shapes to sockets 🔊</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Animated.View style={[styles.bench, shakeStyle]}>
          <Text style={styles.sectionLabel}>Shapes</Text>
          <View style={styles.shapesRow}>
            {shuffledShapes.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => handleShapeTap(s.id)}
                style={[
                  styles.shapeBtn,
                  selectedId === s.id && styles.shapeSelected,
                  placed.has(s.id) && styles.shapePlaced,
                ]}
                accessibilityLabel={s.label}
              >
                <Text style={styles.shapeEmoji}>{s.emoji}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Sockets</Text>
          <View style={styles.holesRow}>
            {shuffledHoles.map((s) => (
              <View key={`hole-${s.id}`} style={styles.holeWrap}>
                <Pressable
                  onPress={() => handleHoleTap(s.id)}
                  style={[styles.hole, placed.has(s.id) && styles.holeFilled]}
                  accessibilityLabel={`${s.label} socket`}
                >
                  {placed.has(s.id) ? (
                    <Text style={styles.filledEmoji}>{s.emoji}</Text>
                  ) : (
                    <Text style={styles.holeGhost}>{s.emoji}</Text>
                  )}
                </Pressable>
                <Text style={styles.holeLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.hint}>
            {selectedId
              ? `Tap the ${SHAPES.find((s) => s.id === selectedId)?.label.toLowerCase()} socket`
              : 'First tap a shape, then tap its matching socket'}
          </Text>
        </Animated.View>
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
    backgroundColor: 'rgba(237, 233, 254, 0.55)',
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
  bench: {
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
  shapesRow: { flexDirection: 'row', gap: 16, marginBottom: 20, justifyContent: 'center' },
  shapeBtn: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: T.shapeCard,
    borderWidth: 3,
    borderColor: T.shapeBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shapeEmoji: { fontSize: 36 },
  shapeSelected: { borderColor: T.accent, backgroundColor: T.selected },
  shapePlaced: { opacity: 0.35 },
  holesRow: { flexDirection: 'row', gap: 20, justifyContent: 'center' },
  holeWrap: { alignItems: 'center', gap: 6 },
  hole: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: T.holeBg,
    borderWidth: 3,
    borderColor: T.holeBorder,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  holeFilled: { backgroundColor: T.placed, borderStyle: 'solid', borderColor: '#22C55E' },
  holeGhost: { fontSize: 30, opacity: 0.3 },
  holeLabel: { fontSize: 12, fontWeight: '700', color: T.inkMuted },
  filledEmoji: { fontSize: 34 },
  hint: { marginTop: 14, fontSize: 14, fontWeight: '700', color: T.inkMuted, textAlign: 'center' },
});
