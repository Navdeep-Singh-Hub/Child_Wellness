/**
 * Builder Session 8 — Game 2: Chroma Crate Lane
 * Sort colored balls into red, blue, and green crates.
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
import { BUILDER_SESSION, CHROMA_CRATE_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const ITEMS = [
  { id: 'red', color: 'red' as const, label: 'Red', emoji: '🔴' },
  { id: 'blue', color: 'blue' as const, label: 'Blue', emoji: '🔵' },
  { id: 'green', color: 'green' as const, label: 'Green', emoji: '🟢' },
];

const BINS = [
  { id: 'red' as const, label: 'Red' },
  { id: 'blue' as const, label: 'Blue' },
  { id: 'green' as const, label: 'Green' },
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

export interface ColorSortingGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function ColorSortingGame({
  onComplete,
  onBack,
  currentStep = 2,
  totalSteps = 5,
  sessionTitle,
}: ColorSortingGameProps) {
  const [itemOrder] = useState(() => shuffleArray(ITEMS));
  const [binOrder] = useState(() => shuffleWithoutSameColumn(itemOrder, BINS));
  const [sorted, setSorted] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const shake = useSharedValue(0);

  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakBuilderHint(
      'Sort by color. Tap a ball, then tap the matching color crate — red, blue, or green.'
    );
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
    speakBuilderHint('Try again. Match the color: red, blue, or green.');
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      /* ignore */
    }
  }, [shake]);

  const handleItemTap = useCallback(
    (id: string) => {
      if (sorted.has(id)) return;
      setSelectedId(id);
      speakBuilderHint(ITEMS.find((i) => i.id === id)?.label ?? id);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* ignore */
      }
    },
    [sorted]
  );

  const handleBinTap = useCallback(
    (color: 'red' | 'blue' | 'green') => {
      if (!selectedId) return;
      const item = ITEMS.find((i) => i.id === selectedId);
      if (!item || item.color !== color) {
        triggerWrong();
        setSelectedId(null);
        return;
      }

      speakBuilderHint(`Correct! ${item.label}!`);
      const nextSorted = new Set(sorted).add(selectedId);
      setSorted(nextSorted);
      setSelectedId(null);

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        /* ignore */
      }

      if (nextSorted.size >= itemOrder.length) {
        speakBuilderHint('All colors sorted!');
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [itemOrder.length, onComplete, selectedId, sorted, triggerWrong]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Chroma Complete!"
          subtitle="You sorted every color!"
          badgeEmoji="🎨"
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
            <View style={styles.sortPill}>
              <Text style={styles.sortPillText}>
                {sorted.size}/{itemOrder.length} sorted
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
                onPress={() => speakBuilderHint('Tap a ball, then tap the crate that matches its color.')}
              >
                <Text style={styles.prompt}>Sort by color 🔊</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Animated.View style={[styles.playArea, shakeStyle]}>
          <Text style={styles.sectionLabel}>Colored balls</Text>
          <View style={styles.itemsRow}>
            {itemOrder.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => handleItemTap(item.id)}
                style={[
                  styles.itemBtn,
                  selectedId === item.id && styles.selected,
                  sorted.has(item.id) && styles.sortedItem,
                ]}
                accessibilityLabel={item.label}
              >
                <Text style={styles.emoji}>{item.emoji}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Color crates</Text>
          <View style={styles.binsRow}>
            {binOrder.map((bin) => (
              <Pressable
                key={bin.id}
                onPress={() => handleBinTap(bin.id)}
                style={[
                  styles.bin,
                  bin.id === 'red' && styles.redBin,
                  bin.id === 'blue' && styles.blueBin,
                  bin.id === 'green' && styles.greenBin,
                ]}
                accessibilityLabel={`${bin.label} crate`}
              >
                <Text style={styles.binLabel}>{bin.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.hint}>
            {selectedId
              ? `Tap the ${ITEMS.find((i) => i.id === selectedId)?.label.toLowerCase()} crate`
              : 'Tap a ball first, then its color crate'}
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
  sortPill: {
    backgroundColor: 'rgba(237, 233, 254, 0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.accentSoft,
  },
  sortPillText: { fontSize: 12, fontWeight: '800', color: T.ink },
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
  playArea: {
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
  itemsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 22,
  },
  itemBtn: {
    width: 70,
    height: 70,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: T.accentSoft,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 36 },
  selected: { borderColor: '#22C55E', backgroundColor: T.selected },
  sortedItem: { opacity: 0.45, backgroundColor: T.sorted },
  binsRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 8 },
  bin: {
    flex: 1,
    maxWidth: 96,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 4,
    alignItems: 'center',
  },
  redBin: { backgroundColor: T.redBin, borderColor: T.redBorder },
  blueBin: { backgroundColor: T.blueBin, borderColor: T.blueBorder },
  greenBin: { backgroundColor: T.greenBin, borderColor: T.greenBorder },
  binLabel: { fontSize: 13, fontWeight: '800', color: T.ink },
  hint: { marginTop: 12, fontSize: 14, fontWeight: '700', color: T.inkMuted, textAlign: 'center' },
});
