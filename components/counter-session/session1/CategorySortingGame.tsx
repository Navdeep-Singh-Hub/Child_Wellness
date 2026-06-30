/**
 * Counter Session 1 — Game 4: Cloud Sort Bay — Animals / Fruits
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
import { CLOUD_SORT_THEME as T, COUNTER_SESSION } from '../counterSessionTheme';
import { speakCounterHint, speakCounterWord, stopCounterSpeech } from '../counterSessionSpeech';
import { CloudTerraceBackground } from '../CloudTerraceBackground';

const ITEMS = [
  { id: 'dog', category: 'animals' as const, label: 'Dog', emoji: '🐕' },
  { id: 'apple', category: 'fruits' as const, label: 'Apple', emoji: '🍎' },
  { id: 'cat', category: 'animals' as const, label: 'Cat', emoji: '🐱' },
  { id: 'banana', category: 'fruits' as const, label: 'Banana', emoji: '🍌' },
];

export function CategorySortingGame({
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
  const [sorted, setSorted] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const shake = useSharedValue(0);
  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakCounterHint(
      'Sort into categories. Put each item in Animals or Fruits. Tap an item, then tap the category.'
    );
    return () => stopCounterSpeech();
  }, []);

  const triggerWrong = useCallback(() => {
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    speakCounterHint('Try again. Is it an animal or a fruit?');
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
      const item = ITEMS.find((i) => i.id === id);
      speakCounterWord(item?.label ?? id);
    },
    [sorted]
  );

  const handleCategoryTap = useCallback(
    (category: 'animals' | 'fruits') => {
      if (!selectedId) return;
      const item = ITEMS.find((i) => i.id === selectedId);
      if (!item || item.category !== category) {
        triggerWrong();
        setSelectedId(null);
        return;
      }
      speakCounterHint(`Correct! ${item.label} is a ${category === 'animals' ? 'animal' : 'fruit'}!`);
      setSorted((s) => {
        const next = new Set(s).add(selectedId);
        if (next.size >= ITEMS.length) {
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch {
            /* ignore */
          }
          setCelebrating(true);
          setTimeout(() => onComplete(), 2200);
        }
        return next;
      });
      setSelectedId(null);
    },
    [selectedId, onComplete, triggerWrong]
  );

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Sorted!"
          subtitle="Every item is in the right cloud!"
          badgeEmoji="📂"
          variant="ocean"
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
      <CloudTerraceBackground />

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
                {sorted.size}/{ITEMS.length} sorted
              </Text>
            </View>
          </View>
          <Text style={styles.title}>{T.name}</Text>
          {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}
          <View style={styles.speechBubble}>
            <Text style={styles.mascot}>{T.mascot}</Text>
            <View style={styles.bubbleBody}>
              <Text style={styles.mascotName}>{T.mascotName} says:</Text>
              <Pressable onPress={() => speakCounterHint('Tap an item, then tap Animals or Fruits.')}>
                <Text style={styles.prompt}>Sort into clouds 🔊</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Items</Text>
        <Animated.View style={[styles.itemsRow, shakeStyle]}>
          {ITEMS.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handleItemTap(item.id)}
              style={[
                styles.itemBtn,
                selectedId === item.id && styles.itemSelected,
                sorted.has(item.id) && styles.itemSorted,
              ]}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={styles.itemLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </Animated.View>

        <Text style={styles.sectionLabel}>Categories</Text>
        <View style={styles.categoriesRow}>
          <Pressable
            onPress={() => handleCategoryTap('animals')}
            style={({ pressed }) => [styles.categoryBtn, styles.animalsBtn, pressed && styles.pressed]}
          >
            <Text style={styles.categoryEmoji}>🐾</Text>
            <Text style={styles.categoryLabel}>Animals</Text>
          </Pressable>
          <Pressable
            onPress={() => handleCategoryTap('fruits')}
            style={({ pressed }) => [styles.categoryBtn, styles.fruitsBtn, pressed && styles.pressed]}
          >
            <Text style={styles.categoryEmoji}>🍎</Text>
            <Text style={styles.categoryLabel}>Fruits</Text>
          </Pressable>
        </View>
        {selectedId ? <Text style={styles.hint}>Now tap Animals or Fruits</Text> : null}
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
    backgroundColor: 'rgba(209, 250, 229, 0.9)',
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
    fontSize: 14,
    fontWeight: '800',
    color: T.inkMuted,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', paddingHorizontal: 20 },
  itemBtn: {
    width: 90,
    paddingVertical: 14,
    borderRadius: COUNTER_SESSION.radius.card,
    borderWidth: 3,
    borderColor: T.panelBorder,
    backgroundColor: T.panel,
    alignItems: 'center',
    ...COUNTER_SESSION.shadow.soft,
  },
  itemSelected: { borderColor: T.accent, backgroundColor: T.itemSelected },
  itemSorted: { opacity: 0.45 },
  emoji: { fontSize: 34, marginBottom: 4 },
  itemLabel: { fontSize: 13, fontWeight: '800', color: T.ink },
  categoriesRow: { flexDirection: 'row', gap: 16, justifyContent: 'center', paddingHorizontal: 20, marginTop: 8 },
  categoryBtn: {
    minWidth: 130,
    paddingVertical: 20,
    borderRadius: COUNTER_SESSION.radius.card,
    borderWidth: 3,
    alignItems: 'center',
    ...COUNTER_SESSION.shadow.soft,
  },
  animalsBtn: { backgroundColor: T.animals, borderColor: T.animalsBorder },
  fruitsBtn: { backgroundColor: T.fruits, borderColor: T.fruitsBorder },
  categoryEmoji: { fontSize: 36, marginBottom: 6 },
  categoryLabel: { fontSize: 16, fontWeight: '900', color: T.ink },
  hint: { marginTop: 16, fontSize: 15, color: T.inkMuted, fontWeight: '700', textAlign: 'center' },
});
