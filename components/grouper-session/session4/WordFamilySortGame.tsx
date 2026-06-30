/**
 * Grouper Session 4 — Game 1: Family Sort Grove
 * Sort cat/hat → -at, pin/tin → -in, sun/bun → -un
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { MIXED_FAMILY_SORT_THEME as T, GROUPER_SESSION } from '../grouperSessionTheme';
import { speakGrouperHint, speakGrouperWord, stopGrouperSpeech } from '../grouperSessionSpeech';
import { OasisOrchardBackground } from '../OasisOrchardBackground';

type Family = 'at' | 'in' | 'un';

const BOXES: { id: Family; label: string; suffix: string; emoji: string }[] = [
  { id: 'at', label: 'AT Family', suffix: '-at', emoji: '🐱' },
  { id: 'in', label: 'IN Family', suffix: '-in', emoji: '📌' },
  { id: 'un', label: 'UN Family', suffix: '-un', emoji: '☀️' },
];

const ITEMS: { id: string; label: string; emoji: string; family: Family }[] = [
  { id: 'cat', label: 'cat', emoji: '🐱', family: 'at' },
  { id: 'hat', label: 'hat', emoji: '🎩', family: 'at' },
  { id: 'pin', label: 'pin', emoji: '📌', family: 'in' },
  { id: 'tin', label: 'tin', emoji: '🥫', family: 'in' },
  { id: 'sun', label: 'sun', emoji: '☀️', family: 'un' },
  { id: 'bun', label: 'bun', emoji: '🍞', family: 'un' },
];

export interface WordFamilySortGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function WordFamilySortGame({
  onComplete,
  onBack,
  currentStep = 1,
  totalSteps = 5,
  sessionTitle,
}: WordFamilySortGameProps) {
  const shuffledItems = useMemo(() => [...ITEMS].sort(() => Math.random() - 0.5), []);
  const shuffledBoxes = useMemo(() => [...BOXES].sort(() => Math.random() - 0.5), []);

  const [assignments, setAssignments] = useState<Record<string, Family | null>>(() =>
    Object.fromEntries(ITEMS.map((i) => [i.id, null])) as Record<string, Family | null>
  );
  const [currentId, setCurrentId] = useState<string>(() => shuffledItems[0]?.id ?? '');
  const [celebrating, setCelebrating] = useState(false);
  const shake = useSharedValue(0);
  const snap = useSharedValue(1);

  const progressPct = Math.round((currentStep / totalSteps) * 100);
  const sortedCount = Object.values(assignments).filter(Boolean).length;
  const currentItem = shuffledItems.find((i) => i.id === currentId);

  useEffect(() => {
    speakGrouperHint('Sort each word into its word family box. AT, IN, or UN.');
    return () => stopGrouperSpeech();
  }, []);

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const snapStyle = useAnimatedStyle(() => ({ transform: [{ scale: snap.value }] }));

  const handleBox = useCallback(
    (family: Family) => {
      if (!currentItem || assignments[currentItem.id]) return;

      if (currentItem.family === family) {
        snap.value = withSequence(withSpring(1.06, { damping: 6 }), withSpring(1, { damping: 10 }));
        speakGrouperWord(currentItem.label);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          /* ignore */
        }

        setAssignments((prev) => {
          const next = { ...prev, [currentItem.id]: family };
          const nextItem = shuffledItems.find((i) => !next[i.id])?.id ?? null;
          setCurrentId(nextItem ?? '');
          if (!nextItem) {
            speakGrouperHint('All sorted! Great job!');
            setCelebrating(true);
            setTimeout(() => onComplete(), 2200);
          }
          return next;
        });
      } else {
        shake.value = withSequence(
          withTiming(-8, { duration: 50 }),
          withTiming(8, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );
        speakGrouperHint('Try again. Listen to the ending sound.');
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch {
          /* ignore */
        }
      }
    },
    [assignments, currentItem, onComplete, shake, snap, shuffledItems]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Families Sorted!"
          subtitle="You sorted every word into its family!"
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
      <OasisOrchardBackground />

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
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>
              {sortedCount}/{ITEMS.length}
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
              onPress={() => speakGrouperHint('Tap the family box that matches the word ending.')}
            >
              <Text style={styles.prompt}>Sort into -at, -in, or -un 🔊</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.playArea}>
        {currentItem ? (
          <Animated.View style={[styles.activeCard, snapStyle, shakeStyle]}>
            <Text style={styles.activeLabel}>Sort this word:</Text>
            <Text style={styles.activeEmoji}>{currentItem.emoji}</Text>
            <Text style={styles.activeWord}>{currentItem.label}</Text>
          </Animated.View>
        ) : (
          <Text style={styles.doneHint}>All sorted!</Text>
        )}

        <View style={styles.boxesRow}>
          {shuffledBoxes.map((b) => (
            <Pressable
              key={b.id}
              onPress={() => handleBox(b.id)}
              style={({ pressed }) => [styles.box, pressed && styles.pressed]}
              accessibilityLabel={b.label}
            >
              <Text style={styles.boxEmoji}>{b.emoji}</Text>
              <Text style={styles.boxSuffix}>{b.suffix}</Text>
              <View style={styles.assignedList}>
                {ITEMS.filter((i) => assignments[i.id] === b.id).map((i) => (
                  <Text key={i.id} style={styles.assignedWord}>
                    {i.emoji} {i.label}
                  </Text>
                ))}
              </View>
            </Pressable>
          ))}
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
    borderRadius: GROUPER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
    zIndex: 10,
    ...GROUPER_SESSION.shadow.soft,
  },
  backText: { fontSize: 15, fontWeight: '700', color: T.accentDeep },
  header: { paddingHorizontal: 20, paddingTop: 8, gap: 6, zIndex: 5 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepPill: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: GROUPER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
  countPill: {
    backgroundColor: T.box,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: GROUPER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.boxBorder,
  },
  countPillText: { fontSize: 12, fontWeight: '800', color: T.ink },
  title: { fontSize: 26, fontWeight: '900', color: T.ink, textAlign: 'center' },
  subtitle: { fontSize: 12, fontWeight: '600', color: T.inkMuted, textAlign: 'center' },
  speechBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: T.panel,
    borderRadius: GROUPER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 14,
    ...GROUPER_SESSION.shadow.soft,
  },
  mascot: { fontSize: 32 },
  bubbleBody: { flex: 1, gap: 2 },
  mascotName: { fontSize: 11, fontWeight: '800', color: T.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  prompt: { fontSize: 14, fontWeight: '700', color: T.ink, lineHeight: 20 },
  playArea: { flex: 1, paddingHorizontal: 16, justifyContent: 'center', gap: 20 },
  activeCard: {
    alignSelf: 'center',
    backgroundColor: T.wordCard,
    borderRadius: GROUPER_SESSION.radius.card,
    borderWidth: 4,
    borderColor: T.wordBorder,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    ...GROUPER_SESSION.shadow.card,
  },
  activeLabel: { fontSize: 12, fontWeight: '800', color: T.inkMuted, textTransform: 'uppercase' },
  activeEmoji: { fontSize: 44, marginVertical: 6 },
  activeWord: { fontSize: 28, fontWeight: '900', color: T.ink },
  doneHint: { fontSize: 18, fontWeight: '800', color: T.accent, textAlign: 'center' },
  boxesRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  box: {
    width: '30%',
    minWidth: 100,
    backgroundColor: T.box,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: T.boxBorder,
    padding: 10,
    alignItems: 'center',
    ...GROUPER_SESSION.shadow.soft,
  },
  boxEmoji: { fontSize: 28, marginBottom: 2 },
  boxSuffix: { fontSize: 14, fontWeight: '900', color: T.accentDeep, marginBottom: 6 },
  assignedList: { alignItems: 'center', gap: 2 },
  assignedWord: { fontSize: 10, fontWeight: '700', color: T.ink },
});
