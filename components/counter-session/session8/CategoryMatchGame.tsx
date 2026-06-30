/**
 * Counter Session 8 — Game 2: Habitat Match — fish/water, bird/sky, dog/home
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { HABITAT_MATCH_THEME as T, COUNTER_SESSION } from '../counterSessionTheme';
import { speakCounterHint, stopCounterSpeech } from '../counterSessionSpeech';
import { MoodMeadowBackground } from '../MoodMeadowBackground';

const PAIRS = [
  { id: 'fish', animal: 'Fish', animalEmoji: '🐟', habitatId: 'water', habitat: 'Water', habitatEmoji: '🌊' },
  { id: 'bird', animal: 'Bird', animalEmoji: '🐦', habitatId: 'sky', habitat: 'Sky', habitatEmoji: '☁️' },
  { id: 'dog', animal: 'Dog', animalEmoji: '🐕', habitatId: 'home', habitat: 'Home', habitatEmoji: '🏠' },
];

const HABITATS = [
  { id: 'water', label: 'Water', emoji: '🌊' },
  { id: 'sky', label: 'Sky', emoji: '☁️' },
  { id: 'home', label: 'Home', emoji: '🏠' },
];

export function CategoryMatchGame({
  onComplete,
  onBack,
  currentStep = 2,
  totalSteps = 5,
  sessionTitle,
}: {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}) {
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const shake = useSharedValue(0);
  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakCounterHint('Match each animal to its home. Tap an animal, then tap where it lives.');
    return () => stopCounterSpeech();
  }, []);

  const triggerWrong = useCallback(() => {
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    speakCounterHint('Try again. Where does this animal live?');
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      /* ignore */
    }
  }, [shake]);

  const handleAnimalTap = useCallback(
    (id: string) => {
      if (matched.has(id)) return;
      setSelectedId(id);
      const pair = PAIRS.find((p) => p.id === id);
      if (pair) speakCounterHint(pair.animal);
    },
    [matched]
  );

  const handleHabitatTap = useCallback(
    (habitatId: string) => {
      if (!selectedId) return;
      const pair = PAIRS.find((p) => p.id === selectedId);
      if (!pair || habitatId !== pair.habitatId) {
        triggerWrong();
        setSelectedId(null);
        return;
      }
      speakCounterHint(`Correct! ${pair.animal} lives in ${pair.habitat}!`);
      setMatched((m) => {
        const next = new Set(m).add(selectedId);
        if (next.size >= PAIRS.length) {
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
        <SuccessCelebration title="Homes Matched!" subtitle="Animals matched to their homes!" badgeEmoji="🐾" variant="ocean" />
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
              <Pressable onPress={() => speakCounterHint('Tap an animal, then tap its home.')}>
                <Text style={styles.prompt}>Match each animal 🔊</Text>
              </Pressable>
            </View>
          </View>
        </View>
        <Text style={styles.sectionLabel}>Animals</Text>
        <Animated.View style={[styles.animalsRow, shakeStyle]}>
          {PAIRS.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => handleAnimalTap(p.id)}
              style={[
                styles.animalBtn,
                selectedId === p.id && styles.selected,
                matched.has(p.id) && styles.matched,
              ]}
              accessibilityLabel={p.animal}
            >
              <Text style={styles.animalEmoji}>{p.animalEmoji}</Text>
              <Text style={styles.animalLabel}>{p.animal}</Text>
            </Pressable>
          ))}
        </Animated.View>
        <Text style={styles.sectionLabel}>Habitats</Text>
        <View style={styles.habitatsRow}>
          {HABITATS.map((h) => (
            <Pressable
              key={h.id}
              onPress={() => handleHabitatTap(h.id)}
              style={styles.habitatBtn}
              accessibilityLabel={h.label}
            >
              <Text style={styles.habitatEmoji}>{h.emoji}</Text>
              <Text style={styles.habitatLabel}>{h.label}</Text>
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
  animalsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 20 },
  animalBtn: {
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
  selected: { backgroundColor: '#FEF3C7', borderColor: T.accent },
  matched: { opacity: 0.55 },
  animalEmoji: { fontSize: 38, marginBottom: 4 },
  animalLabel: { fontSize: 14, fontWeight: '700', color: T.ink },
  habitatsRow: { flexDirection: 'row', gap: 14 },
  habitatBtn: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 18,
    backgroundColor: T.habitatBg,
    borderWidth: 4,
    borderColor: T.habitatBorder,
    alignItems: 'center',
    minWidth: 88,
    ...COUNTER_SESSION.shadow.soft,
  },
  habitatEmoji: { fontSize: 34, marginBottom: 6 },
  habitatLabel: { fontSize: 14, fontWeight: '800', color: T.ink },
});
