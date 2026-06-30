/**
 * Builder Session 5 — Game 4: Sorting Crate Yard
 * Sort animals and fruits into the correct crates.
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
import { BUILDER_SESSION, CATEGORY_CRATE_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const ANIMALS = [
  { id: 'dog', label: 'Dog', emoji: '🐕', category: 'animal' as const },
  { id: 'cat', label: 'Cat', emoji: '🐱', category: 'animal' as const },
  { id: 'bird', label: 'Bird', emoji: '🐦', category: 'animal' as const },
];
const FRUITS = [
  { id: 'apple', label: 'Apple', emoji: '🍎', category: 'fruit' as const },
  { id: 'banana', label: 'Banana', emoji: '🍌', category: 'fruit' as const },
  { id: 'orange', label: 'Orange', emoji: '🍊', category: 'fruit' as const },
];
const ITEMS = [...ANIMALS, ...FRUITS];

function shuffleArray<U>(arr: U[]): U[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface PictureCategoryGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function PictureCategoryGame({
  onComplete,
  onBack,
  currentStep = 4,
  totalSteps = 5,
  sessionTitle,
}: PictureCategoryGameProps) {
  const [shuffledItems] = useState(() => shuffleArray(ITEMS));
  const [basketOrder] = useState(() => shuffleArray(['animal', 'fruit'] as const));
  const [sorted, setSorted] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const shake = useSharedValue(0);

  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakBuilderHint(
      'Put animals in the animal crate and fruits in the fruit crate. Tap an item, then tap the correct crate.'
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
    speakBuilderHint('Try again. Animals go in the animal crate, fruits in the fruit crate.');
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

  const handleCrateTap = useCallback(
    (category: 'animal' | 'fruit') => {
      if (!selectedId) return;
      const item = ITEMS.find((i) => i.id === selectedId);
      if (!item || item.category !== category) {
        triggerWrong();
        setSelectedId(null);
        return;
      }

      speakBuilderHint(
        `Correct! ${item.label} is ${item.category === 'animal' ? 'an animal' : 'a fruit'}!`
      );
      const nextSorted = new Set(sorted).add(selectedId);
      setSorted(nextSorted);
      setSelectedId(null);

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        /* ignore */
      }

      if (nextSorted.size >= shuffledItems.length) {
        speakBuilderHint('All sorted!');
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [onComplete, selectedId, shuffledItems.length, sorted, triggerWrong]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Crates Sorted!"
          subtitle="Every picture found its crate!"
          badgeEmoji="🧺"
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
            <View style={styles.sortPill}>
              <Text style={styles.sortPillText}>
                {sorted.size}/{shuffledItems.length} sorted
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
                  speakBuilderHint('Sort animals and fruits into the right crates.')
                }
              >
                <Text style={styles.prompt}>Sort into crates 🔊</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Animated.View style={[styles.yard, shakeStyle]}>
          <Text style={styles.sectionLabel}>Pictures</Text>
          <View style={styles.itemsRow}>
            {shuffledItems.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => handleItemTap(item.id)}
                style={[
                  styles.itemCard,
                  selectedId === item.id && styles.itemSelected,
                  sorted.has(item.id) && styles.itemSorted,
                ]}
                accessibilityLabel={item.label}
              >
                <Text style={styles.emoji}>{item.emoji}</Text>
                <Text style={styles.itemLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Crates</Text>
          <View style={styles.cratesRow}>
            {basketOrder.map((crate) => (
              <Pressable
                key={crate}
                onPress={() => handleCrateTap(crate)}
                style={[
                  styles.crate,
                  crate === 'animal' ? styles.animalCrate : styles.fruitCrate,
                ]}
                accessibilityLabel={`${crate === 'animal' ? 'Animal' : 'Fruit'} crate`}
              >
                <Text style={styles.crateEmoji}>{crate === 'animal' ? '🐕' : '🍎'}</Text>
                <Text style={styles.crateLabel}>{crate === 'animal' ? 'Animal' : 'Fruit'}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.hint}>
            {selectedId
              ? `Tap the ${ITEMS.find((i) => i.id === selectedId)?.category} crate`
              : 'Tap a picture first, then its crate'}
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
    backgroundColor: 'rgba(254, 243, 199, 0.55)',
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
  itemsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
    justifyContent: 'center',
  },
  itemCard: {
    width: 78,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 3,
    borderColor: T.panelBorder,
    alignItems: 'center',
  },
  itemSelected: { borderColor: T.accent, backgroundColor: T.selected },
  itemSorted: { opacity: 0.45, backgroundColor: T.sorted },
  emoji: { fontSize: 34, marginBottom: 4 },
  itemLabel: { fontSize: 11, fontWeight: '800', color: T.ink },
  cratesRow: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  crate: {
    width: 118,
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 3,
    alignItems: 'center',
  },
  animalCrate: { backgroundColor: T.animalCrate, borderColor: T.animalBorder },
  fruitCrate: { backgroundColor: T.fruitCrate, borderColor: T.fruitBorder },
  crateEmoji: { fontSize: 38, marginBottom: 6 },
  crateLabel: { fontSize: 14, fontWeight: '900', color: T.ink },
  hint: { marginTop: 14, fontSize: 14, fontWeight: '700', color: T.inkMuted, textAlign: 'center' },
});
