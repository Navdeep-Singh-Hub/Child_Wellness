/**
 * Builder Session 1 — Game 4: Chroma Paint Dock
 * Tap a color chip, then tap its matching crate.
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
import { BUILDER_SESSION, COLOR_DOCK_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const COLORS = [
  { id: 'red', label: 'Red', color: '#EF4444', emoji: '🔴' },
  { id: 'blue', label: 'Blue', color: '#3B82F6', emoji: '🔵' },
  { id: 'yellow', label: 'Yellow', color: '#FBBF24', emoji: '🟡' },
];

function shuffleArray<U>(arr: U[]): U[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function shuffleWithoutSameColumn<U extends { id: string }>(base: U[], source: U[]): U[] {
  if (source.length <= 1) return [...source];
  let candidate = shuffleArray(source);
  let tries = 0;
  while (candidate.some((item, i) => item.id === base[i]?.id) && tries < 20) {
    candidate = shuffleArray(source);
    tries += 1;
  }
  if (candidate.some((item, i) => item.id === base[i]?.id)) {
    return [...source.slice(1), source[0]];
  }
  return candidate;
}

export interface ColorMatchGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function ColorMatchGame({
  onComplete,
  onBack,
  currentStep = 4,
  totalSteps = 5,
  sessionTitle,
}: ColorMatchGameProps) {
  const [chipOrder] = useState(() => shuffleArray(COLORS));
  const [crateOrder] = useState(() => shuffleWithoutSameColumn(chipOrder, COLORS));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [celebrating, setCelebrating] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);

  const shake = useSharedValue(0);
  const progressPct = Math.round((currentStep / totalSteps) * 100);
  const matchCount = matched.size;

  useEffect(() => {
    speakBuilderHint('Put each color in the matching crate. Tap a color, then tap its crate.');
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
    speakBuilderHint('Try again. Match the color to its crate.');
    setTimeout(() => setWrongFlash(false), 400);
  }, [shake]);

  const handleChipTap = useCallback(
    (id: string) => {
      if (matched.has(id)) return;
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* ignore */
      }
      setSelectedId(id);
      speakBuilderHint(COLORS.find((c) => c.id === id)?.label ?? id);
    },
    [matched]
  );

  const handleCrateTap = useCallback(
    (id: string) => {
      if (matched.has(id)) return;
      if (selectedId !== id) {
        triggerWrong();
        setSelectedId(null);
        return;
      }
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        /* ignore */
      }
      speakBuilderHint(`Correct! ${COLORS.find((c) => c.id === id)?.label} matches!`);
      const next = new Set(matched).add(id);
      setMatched(next);
      setSelectedId(null);
      if (next.size >= chipOrder.length) {
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [selectedId, matched, onComplete, triggerWrong, chipOrder.length]
  );

  const rowShake = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Colors Sorted!"
          subtitle="Every paint chip found its crate!"
          badgeEmoji="🎨"
          variant="sunset"
        />
      </View>
    );
  }

  const selectedLabel = COLORS.find((c) => c.id === selectedId)?.label;

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
          <View style={styles.matchPill}>
            <Text style={styles.matchPillText}>
              {matchCount}/{COLORS.length} sorted
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
                speakBuilderHint('Put each color in the matching crate. Tap a color, then tap its crate.')
              }
            >
              <Text style={styles.prompt}>Tap color → tap crate 🔊</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.dockArea}>
        <View style={[styles.chipPanel, wrongFlash && styles.panelWrong]}>
          <Text style={styles.panelLabel}>Paint Chips</Text>
          <Animated.View style={[styles.chipRow, rowShake]}>
            {chipOrder.map((c) => {
              const isSelected = selectedId === c.id;
              const isMatched = matched.has(c.id);
              return (
                <Pressable
                  key={c.id}
                  onPress={() => handleChipTap(c.id)}
                  style={[
                    styles.chip,
                    { backgroundColor: c.color },
                    isSelected && styles.chipSelected,
                    isMatched && styles.chipMatched,
                  ]}
                  accessibilityLabel={c.label}
                >
                  <Text style={styles.chipEmoji}>{c.emoji}</Text>
                  <Text style={styles.chipLabel}>{c.label}</Text>
                  {isMatched ? <Text style={styles.chipCheck}>✓</Text> : null}
                </Pressable>
              );
            })}
          </Animated.View>
        </View>

        <View style={styles.connector}>
          <Ionicons name="arrow-down" size={22} color={T.accent} />
        </View>

        <View style={styles.cratePanel}>
          <Text style={styles.cratePanelLabel}>Sorting Crates</Text>
          <View style={styles.crateRow}>
            {crateOrder.map((c) => {
              const isMatched = matched.has(c.id);
              const isTarget = selectedId === c.id;
              return (
                <Pressable
                  key={`crate-${c.id}`}
                  onPress={() => handleCrateTap(c.id)}
                  style={[
                    styles.crate,
                    { borderColor: c.color },
                    isMatched && [styles.crateMatched, { backgroundColor: c.color }],
                    isTarget && styles.crateTarget,
                  ]}
                  accessibilityLabel={`${c.label} crate`}
                >
                  {isMatched ? (
                    <Text style={styles.crateCheck}>✓</Text>
                  ) : (
                    <>
                      <View style={[styles.crateSwatch, { backgroundColor: c.color }]} />
                      <Text style={[styles.crateLabel, { color: c.color }]}>{c.label}</Text>
                    </>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {selectedId ? (
          <Text style={styles.hint}>Now tap the {selectedLabel} crate</Text>
        ) : (
          <Text style={styles.hint}>Pick a paint chip to begin</Text>
        )}
      </View>

      <View style={styles.paletteRow}>
        {COLORS.map((c) => (
          <View
            key={c.id}
            style={[styles.paletteDot, matched.has(c.id) && styles.paletteDotDone]}
          >
            <Text style={styles.paletteEmoji}>{matched.has(c.id) ? '✓' : c.emoji}</Text>
          </View>
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
    borderColor: T.dockBorder,
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
    borderColor: T.dockBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
  matchPill: {
    backgroundColor: 'rgba(252, 231, 243, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.dockBorder,
  },
  matchPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
  title: { fontSize: 26, fontWeight: '900', color: T.ink, textAlign: 'center' },
  subtitle: { fontSize: 14, fontWeight: '600', color: T.inkMuted, textAlign: 'center' },
  speechBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: T.dock,
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.dockBorder,
    padding: 14,
    ...BUILDER_SESSION.shadow.soft,
  },
  mascot: { fontSize: 32 },
  bubbleBody: { flex: 1, gap: 2 },
  mascotName: { fontSize: 12, fontWeight: '800', color: T.accentDeep, textTransform: 'uppercase' },
  prompt: { fontSize: 16, fontWeight: '800', color: T.ink },
  dockArea: { flex: 1, paddingHorizontal: 20, justifyContent: 'center', gap: 8 },
  chipPanel: {
    backgroundColor: T.dock,
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 2,
    borderColor: T.dockBorder,
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
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  chip: {
    width: 92,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.12)',
    alignItems: 'center',
    position: 'relative',
  },
  chipSelected: { borderColor: '#22C55E', borderWidth: 4 },
  chipMatched: { opacity: 0.88 },
  chipEmoji: { fontSize: 32, marginBottom: 4 },
  chipLabel: { fontSize: 13, fontWeight: '900', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.25)', textShadowRadius: 4 },
  chipCheck: {
    position: 'absolute',
    top: 4,
    right: 8,
    fontSize: 14,
    fontWeight: '900',
    color: '#FFF',
  },
  connector: { alignItems: 'center', paddingVertical: 2 },
  cratePanel: {
    backgroundColor: T.crate,
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 2,
    borderColor: T.crateBorder,
    padding: 14,
    ...BUILDER_SESSION.shadow.card,
  },
  cratePanelLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: T.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    textAlign: 'center',
  },
  crateRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  crate: {
    width: 92,
    height: 92,
    borderRadius: 16,
    borderWidth: 4,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crateTarget: { backgroundColor: 'rgba(252, 231, 243, 0.6)' },
  crateMatched: { opacity: 0.95 },
  crateSwatch: { width: 28, height: 28, borderRadius: 8, marginBottom: 6 },
  crateLabel: { fontSize: 13, fontWeight: '800' },
  crateCheck: { fontSize: 32, fontWeight: '900', color: '#FFF' },
  hint: { fontSize: 14, fontWeight: '700', color: T.inkMuted, textAlign: 'center', marginTop: 4 },
  paletteRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  paletteDot: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 2,
    borderColor: T.dockBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paletteDotDone: { backgroundColor: 'rgba(220, 252, 231, 0.9)', borderColor: '#22C55E' },
  paletteEmoji: { fontSize: 20 },
});
