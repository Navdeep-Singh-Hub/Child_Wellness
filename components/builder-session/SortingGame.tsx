/**
 * Builder Session 2 — Game 3: Twin Basket Station
 * Tap item → tap fruit or toy basket to sort.
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
import { BUILDER_SESSION, SORT_STATION_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const FRUITS = [
  { id: 'apple', label: 'Apple', emoji: '🍎', category: 'fruit' as const },
  { id: 'banana', label: 'Banana', emoji: '🍌', category: 'fruit' as const },
  { id: 'orange', label: 'Orange', emoji: '🍊', category: 'fruit' as const },
];
const TOYS = [
  { id: 'ball', label: 'Ball', emoji: '⚽', category: 'toy' as const },
  { id: 'teddy', label: 'Teddy', emoji: '🧸', category: 'toy' as const },
  { id: 'block', label: 'Block', emoji: '🧱', category: 'toy' as const },
];
const ITEMS = [...FRUITS, ...TOYS];

export interface SortingGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function SortingGame({
  onComplete,
  onBack,
  currentStep = 3,
  totalSteps = 5,
  sessionTitle,
}: SortingGameProps) {
  const [sorted, setSorted] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);

  const shake = useSharedValue(0);
  const progressPct = Math.round((currentStep / totalSteps) * 100);
  const sortCount = sorted.size;

  useEffect(() => {
    speakBuilderHint(
      'Put fruits in the fruit basket and toys in the toy basket. Tap an item, then tap the correct basket.'
    );
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
    speakBuilderHint('Try again. Fruits go in the fruit basket, toys in the toy basket.');
    setTimeout(() => setWrongFlash(false), 400);
  }, [shake]);

  const handleItemTap = useCallback(
    (id: string) => {
      if (sorted.has(id)) return;
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* ignore */
      }
      setSelectedId(id);
      speakBuilderHint(ITEMS.find((i) => i.id === id)?.label ?? id);
    },
    [sorted]
  );

  const handleBasketTap = useCallback(
    (category: 'fruit' | 'toy') => {
      if (!selectedId) return;
      const item = ITEMS.find((i) => i.id === selectedId);
      if (!item) return;
      if (item.category !== category) {
        triggerWrong();
        setSelectedId(null);
        return;
      }
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        /* ignore */
      }
      speakBuilderHint(`Correct! ${item.label} is a ${category}!`);
      const next = new Set(sorted).add(selectedId);
      setSorted(next);
      setSelectedId(null);
      if (next.size >= ITEMS.length) {
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [selectedId, sorted, onComplete, triggerWrong]
  );

  const rowShake = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="All Sorted!"
          subtitle="Every item found its basket!"
          badgeEmoji="🧺"
          variant="mint"
        />
      </View>
    );
  }

  const selectedItem = ITEMS.find((i) => i.id === selectedId);

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
          <View style={styles.sortPill}>
            <Text style={styles.sortPillText}>
              {sortCount}/{ITEMS.length} sorted
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
                speakBuilderHint(
                  'Put fruits in the fruit basket and toys in the toy basket. Tap an item, then tap the correct basket.'
                )
              }
            >
              <Text style={styles.prompt}>Tap item → tap basket 🔊</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.stationArea}>
        <View style={[styles.itemsPanel, wrongFlash && styles.panelWrong]}>
          <Text style={styles.panelLabel}>Sort These</Text>
          <Animated.View style={[styles.itemsRow, rowShake]}>
            {ITEMS.map((item) => (
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
                <Text style={styles.itemEmoji}>{item.emoji}</Text>
                <Text style={styles.itemLabel}>{item.label}</Text>
                {sorted.has(item.id) ? <Text style={styles.itemCheck}>✓</Text> : null}
              </Pressable>
            ))}
          </Animated.View>
        </View>

        <View style={styles.connector}>
          <Ionicons name="arrow-down" size={22} color={T.accent} />
        </View>

        <View style={styles.basketsRow}>
          <Pressable
            onPress={() => handleBasketTap('fruit')}
            style={[
              styles.basket,
              styles.fruitBasket,
              selectedItem?.category === 'fruit' && styles.basketTarget,
            ]}
            accessibilityLabel="Fruit basket"
          >
            <Text style={styles.basketEmoji}>🍎</Text>
            <Text style={styles.basketLabel}>Fruit Basket</Text>
            <Text style={styles.basketCount}>
              {FRUITS.filter((f) => sorted.has(f.id)).length}/{FRUITS.length}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleBasketTap('toy')}
            style={[
              styles.basket,
              styles.toyBasket,
              selectedItem?.category === 'toy' && styles.basketTarget,
            ]}
            accessibilityLabel="Toy basket"
          >
            <Text style={styles.basketEmoji}>🧸</Text>
            <Text style={styles.basketLabel}>Toy Basket</Text>
            <Text style={styles.basketCount}>
              {TOYS.filter((t) => sorted.has(t.id)).length}/{TOYS.length}
            </Text>
          </Pressable>
        </View>

        {selectedId ? (
          <Text style={styles.hint}>
            Now tap the {selectedItem?.category === 'fruit' ? 'fruit' : 'toy'} basket
          </Text>
        ) : (
          <Text style={styles.hint}>Pick an item above to begin sorting</Text>
        )}
      </View>

      <View style={styles.meterRow}>
        <View style={[styles.meterChip, styles.fruitChip]}>
          <Text style={styles.meterEmoji}>🍎</Text>
        </View>
        <View style={[styles.meterChip, styles.toyChip]}>
          <Text style={styles.meterEmoji}>🧸</Text>
        </View>
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
  sortPill: {
    backgroundColor: 'rgba(254, 243, 199, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.fruitBorder,
  },
  sortPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
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
  stationArea: { flex: 1, paddingHorizontal: 20, justifyContent: 'center', gap: 8 },
  itemsPanel: {
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
  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  itemCard: {
    width: 78,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: T.panelBorder,
    alignItems: 'center',
    position: 'relative',
  },
  itemSelected: { borderColor: '#22C55E', backgroundColor: T.selected },
  itemSorted: { opacity: 0.55 },
  itemEmoji: { fontSize: 32, marginBottom: 2 },
  itemLabel: { fontSize: 10, fontWeight: '800', color: T.ink },
  itemCheck: {
    position: 'absolute',
    top: 2,
    right: 6,
    fontSize: 12,
    fontWeight: '900',
    color: '#16A34A',
  },
  connector: { alignItems: 'center', paddingVertical: 2 },
  basketsRow: { flexDirection: 'row', justifyContent: 'center', gap: 14 },
  basket: {
    flex: 1,
    maxWidth: 150,
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 4,
    alignItems: 'center',
    ...BUILDER_SESSION.shadow.soft,
  },
  fruitBasket: { backgroundColor: T.fruitBasket, borderColor: T.fruitBorder },
  toyBasket: { backgroundColor: T.toyBasket, borderColor: T.toyBorder },
  basketTarget: { borderWidth: 5, transform: [{ scale: 1.02 }] },
  basketEmoji: { fontSize: 36, marginBottom: 4 },
  basketLabel: { fontSize: 13, fontWeight: '900', color: T.ink },
  basketCount: { fontSize: 11, fontWeight: '700', color: T.inkMuted, marginTop: 4 },
  hint: { fontSize: 14, fontWeight: '700', color: T.inkMuted, textAlign: 'center', marginTop: 4 },
  meterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  meterChip: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  fruitChip: { backgroundColor: T.fruitBasket, borderColor: T.fruitBorder },
  toyChip: { backgroundColor: T.toyBasket, borderColor: T.toyBorder },
  meterEmoji: { fontSize: 24 },
});
