/**
 * Counter Session 5 — Game 4: Room Sort Loft — Kitchen / Bedroom
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { ROOM_SORT_THEME as T, COUNTER_SESSION } from '../counterSessionTheme';
import { speakCounterHint, stopCounterSpeech } from '../counterSessionSpeech';
import { WindVaneBackground } from '../WindVaneBackground';

const ITEMS = [
  { id: 'spoon', category: 'kitchen' as const, label: 'Spoon', emoji: '🥄' },
  { id: 'bed', category: 'bedroom' as const, label: 'Bed', emoji: '🛏️' },
  { id: 'plate', category: 'kitchen' as const, label: 'Plate', emoji: '🍽️' },
  { id: 'teddy', category: 'bedroom' as const, label: 'Teddy', emoji: '🧸' },
];

export function ObjectClassificationGame({
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
    speakCounterHint('Sort into Kitchen or Bedroom. Tap an item, then tap the room.');
    return () => stopCounterSpeech();
  }, []);

  const triggerWrong = useCallback(() => {
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    speakCounterHint('Try again. Is it from the kitchen or the bedroom?');
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
      if (item) speakCounterHint(item.label);
    },
    [sorted]
  );

  const handleCategoryTap = useCallback(
    (category: 'kitchen' | 'bedroom') => {
      if (!selectedId) return;
      const item = ITEMS.find((i) => i.id === selectedId);
      if (!item || item.category !== category) {
        triggerWrong();
        setSelectedId(null);
        return;
      }
      const roomName = category === 'kitchen' ? 'kitchen' : 'bedroom';
      speakCounterHint(`Correct! ${item.label} goes in the ${roomName}!`);
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
        <SuccessCelebration title="Rooms Sorted!" subtitle="Kitchen and Bedroom sorted!" badgeEmoji="🏠" variant="ocean" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={[...T.gradient]} locations={[...T.gradientLocations]} style={StyleSheet.absoluteFill} />
      <WindVaneBackground />
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
              <Pressable onPress={() => speakCounterHint('Tap an item, then tap Kitchen or Bedroom.')}>
                <Text style={styles.prompt}>Sort each item 🔊</Text>
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
                selectedId === item.id && styles.selected,
                sorted.has(item.id) && styles.sorted,
              ]}
              accessibilityLabel={item.label}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={styles.itemLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
        <Text style={styles.sectionLabel}>Rooms</Text>
        <View style={styles.categoriesRow}>
          <Pressable
            onPress={() => handleCategoryTap('kitchen')}
            style={[styles.categoryBtn, styles.kitchenBtn]}
            accessibilityLabel="Kitchen"
          >
            <Text style={styles.categoryEmoji}>🍳</Text>
            <Text style={styles.categoryLabel}>Kitchen</Text>
          </Pressable>
          <Pressable
            onPress={() => handleCategoryTap('bedroom')}
            style={[styles.categoryBtn, styles.bedroomBtn]}
            accessibilityLabel="Bedroom"
          >
            <Text style={styles.categoryEmoji}>🛏️</Text>
            <Text style={styles.categoryLabel}>Bedroom</Text>
          </Pressable>
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
  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 24 },
  itemBtn: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: T.itemBtn,
    borderWidth: 3,
    borderColor: T.itemBorder,
    alignItems: 'center',
    minWidth: 88,
    ...COUNTER_SESSION.shadow.soft,
  },
  selected: { backgroundColor: '#DCFCE7', borderColor: T.accent },
  sorted: { opacity: 0.55 },
  emoji: { fontSize: 36, marginBottom: 4 },
  itemLabel: { fontSize: 14, fontWeight: '700', color: T.ink },
  categoriesRow: { flexDirection: 'row', gap: 16 },
  categoryBtn: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 18,
    borderWidth: 4,
    alignItems: 'center',
    minWidth: 120,
    ...COUNTER_SESSION.shadow.soft,
  },
  kitchenBtn: { backgroundColor: T.kitchenBg, borderColor: T.kitchenBorder },
  bedroomBtn: { backgroundColor: T.bedroomBg, borderColor: T.bedroomBorder },
  categoryEmoji: { fontSize: 40, marginBottom: 8 },
  categoryLabel: { fontSize: 18, fontWeight: '800', color: T.ink },
});
