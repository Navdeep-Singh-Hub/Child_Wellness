/**
 * Counter Session 9 — Game 3: Size Sort — tap ball then matching size box
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { SIZE_SORT_THEME as T, COUNTER_SESSION } from '../counterSessionTheme';
import { speakCounterHint, stopCounterSpeech } from '../counterSessionSpeech';
import { LogicLoftBackground } from '../LogicLoftBackground';

const ITEMS = [
  { id: 'small', size: 'small' as const, label: 'Small', emoji: '🔵' },
  { id: 'medium', size: 'medium' as const, label: 'Medium', emoji: '🔵' },
  { id: 'large', size: 'large' as const, label: 'Large', emoji: '🔵' },
];

export function SizeSortGame({
  onComplete,
  onBack,
  currentStep = 3,
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
    speakCounterHint('Sort by size. Tap a ball, then tap the matching size box.');
    return () => stopCounterSpeech();
  }, []);

  const triggerWrong = useCallback(() => {
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    speakCounterHint('Try again. Match small, medium, or large.');
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
      speakCounterHint(item?.label ?? id);
    },
    [sorted]
  );

  const handleBinTap = useCallback(
    (size: 'small' | 'medium' | 'large') => {
      if (!selectedId) return;
      const item = ITEMS.find((i) => i.id === selectedId);
      if (!item || item.size !== size) {
        triggerWrong();
        setSelectedId(null);
        return;
      }
      speakCounterHint(`Correct! ${item.label}!`);
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
        <SuccessCelebration title="Sorted!" subtitle="You sorted all three sizes!" badgeEmoji="📏" variant="ocean" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={[...T.gradient]} locations={[...T.gradientLocations]} style={StyleSheet.absoluteFill} />
      <LogicLoftBackground />
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
              <Pressable onPress={() => speakCounterHint('Tap a ball, then tap the matching size box.')}>
                <Text style={styles.prompt}>Sort by size 🔊</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Balls</Text>
        <Animated.View style={[styles.itemsRow, shakeStyle]}>
          {ITEMS.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handleItemTap(item.id)}
              style={[
                styles.itemBtn,
                item.size === 'small' && styles.smallBtn,
                item.size === 'medium' && styles.mediumBtn,
                item.size === 'large' && styles.largeBtn,
                selectedId === item.id && styles.selected,
                sorted.has(item.id) && styles.sorted,
              ]}
              accessibilityLabel={item.label}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
            </Pressable>
          ))}
        </Animated.View>

        <Text style={styles.sectionLabel}>Boxes</Text>
        <View style={styles.binsRow}>
          {(['small', 'medium', 'large'] as const).map((size) => (
            <Pressable
              key={size}
              onPress={() => handleBinTap(size)}
              style={({ pressed }) => [styles.binBtn, pressed && styles.pressed]}
              accessibilityLabel={size}
            >
              <Text style={styles.binLabel}>{size.charAt(0).toUpperCase() + size.slice(1)}</Text>
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
  sectionLabel: { fontSize: 18, fontWeight: '800', color: T.accentDeep, marginTop: 20, marginBottom: 12 },
  itemsRow: { flexDirection: 'row', gap: 20, marginBottom: 24 },
  itemBtn: {
    borderRadius: 999,
    backgroundColor: '#3B82F6',
    borderWidth: 4,
    borderColor: T.itemBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallBtn: { width: 44, height: 44 },
  mediumBtn: { width: 56, height: 56 },
  largeBtn: { width: 72, height: 72 },
  selected: { borderColor: T.accent, backgroundColor: '#60A5FA' },
  sorted: { opacity: 0.45 },
  emoji: { fontSize: 24 },
  binsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  binBtn: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: T.binBorder,
    backgroundColor: T.binBg,
    alignItems: 'center',
    minWidth: 88,
    ...COUNTER_SESSION.shadow.soft,
  },
  binLabel: { fontSize: 16, fontWeight: '800', color: T.ink },
});
