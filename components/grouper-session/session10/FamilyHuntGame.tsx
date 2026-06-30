/**
 * Grouper Session 10 — Game 1: Family Hunt Summit
 * Tap cat, sun, pin, top (word-family words). Avoid dog and cup.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { MASTER_HUNT_THEME as T, GROUPER_SESSION } from '../grouperSessionTheme';
import { speakGrouperHint, speakGrouperWord, stopGrouperSpeech } from '../grouperSessionSpeech';
import { SummitSandsBackground } from '../SummitSandsBackground';

const CORRECT = [
  { id: 'cat', label: 'cat', emoji: '🐱' },
  { id: 'sun', label: 'sun', emoji: '☀️' },
  { id: 'pin', label: 'pin', emoji: '📌' },
  { id: 'top', label: 'top', emoji: '🎯' },
];
const WRONG = [
  { id: 'dog', label: 'dog', emoji: '🐕' },
  { id: 'cup', label: 'cup', emoji: '☕' },
];

function WordTile({
  emoji,
  label,
  onPress,
  state,
  disabled,
}: {
  emoji: string;
  label: string;
  onPress: () => void;
  state: 'idle' | 'found' | 'wrong';
  disabled: boolean;
}) {
  const scale = useSharedValue(1);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (state === 'wrong') {
      shake.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
    if (state === 'found') {
      scale.value = withSequence(withSpring(1.08, { damping: 6 }), withSpring(1, { damping: 10 }));
    }
  }, [state, scale, shake]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shake.value }],
  }));

  const borderColor =
    state === 'found' ? T.tileCorrect : state === 'wrong' ? T.tileWrong : T.tileBorder;
  const bg =
    state === 'found'
      ? 'rgba(220, 252, 231, 0.95)'
      : state === 'wrong'
        ? 'rgba(254, 226, 226, 0.9)'
        : T.tile;

  return (
    <Animated.View style={[styles.tileWrap, animStyle]}>
      <Pressable
        onPress={onPress}
        disabled={disabled || state === 'found'}
        style={({ pressed }) => [
          styles.tile,
          { backgroundColor: bg, borderColor },
          pressed && !disabled && styles.pressed,
        ]}
        accessibilityLabel={label}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.wordLabel}>{label}</Text>
        {state === 'found' ? <Text style={styles.check}>✓</Text> : null}
      </Pressable>
    </Animated.View>
  );
}

export interface FamilyHuntGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function FamilyHuntGame({
  onComplete,
  onBack,
  currentStep = 1,
  totalSteps = 5,
  sessionTitle,
}: FamilyHuntGameProps) {
  const allItems = useMemo(
    () => [...CORRECT, ...WRONG].sort(() => Math.random() - 0.5),
    []
  );
  const [found, setFound] = useState<Set<string>>(() => new Set());
  const [tileState, setTileState] = useState<Record<string, 'idle' | 'found' | 'wrong'>>({});
  const [celebrating, setCelebrating] = useState(false);

  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakGrouperHint('Find cat, sun, pin, and top. They come from our word families!');
    return () => stopGrouperSpeech();
  }, []);

  const handleTap = useCallback(
    (id: string, label: string) => {
      if (found.has(id)) return;
      const isCorrect = CORRECT.some((c) => c.id === id);

      if (isCorrect) {
        speakGrouperWord(label);
        setFound((prev) => {
          const next = new Set(prev).add(id);
          if (next.size >= CORRECT.length) {
            speakGrouperHint('Great job! You found every family word!');
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
        setTileState((s) => ({ ...s, [id]: 'found' }));
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {
          /* ignore */
        }
      } else {
        speakGrouperHint('Try again. That word is not from our families.');
        setTileState((s) => ({ ...s, [id]: 'wrong' }));
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch {
          /* ignore */
        }
        setTimeout(() => setTileState((s) => ({ ...s, [id]: 'idle' })), 600);
      }
    },
    [found, onComplete]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Family Hunt Complete!"
          subtitle="You found cat, sun, pin, and top!"
          badgeEmoji="🔍"
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
      <SummitSandsBackground />

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
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>
                {found.size}/{CORRECT.length} found
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
                  speakGrouperHint('Find cat, sun, pin, and top from our word families.')
                }
              >
                <Text style={styles.prompt}>Hunt the family words 🔊</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.targetCard}>
          <Text style={styles.targetSuffix}>-at · -in · -un · -op</Text>
          <Text style={styles.targetHint}>cat · pin · sun · top</Text>
        </View>

        <View style={styles.grid}>
          {allItems.map((item) => (
            <WordTile
              key={item.id}
              emoji={item.emoji}
              label={item.label}
              onPress={() => handleTap(item.id, item.label)}
              state={tileState[item.id] ?? (found.has(item.id) ? 'found' : 'idle')}
              disabled={celebrating}
            />
          ))}
        </View>
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
    borderRadius: GROUPER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
    zIndex: 10,
    ...GROUPER_SESSION.shadow.soft,
  },
  backText: { fontSize: 15, fontWeight: '700', color: T.accentDeep },
  header: { paddingHorizontal: 20, paddingTop: 8, gap: 8, zIndex: 5 },
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
    backgroundColor: T.targetGlow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: GROUPER_SESSION.radius.pill,
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
    borderRadius: GROUPER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 14,
    ...GROUPER_SESSION.shadow.soft,
  },
  mascot: { fontSize: 32 },
  bubbleBody: { flex: 1, gap: 2 },
  mascotName: {
    fontSize: 11,
    fontWeight: '800',
    color: T.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  prompt: { fontSize: 14, fontWeight: '700', color: T.ink, lineHeight: 20 },
  targetCard: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 16,
    borderRadius: GROUPER_SESSION.radius.card,
    backgroundColor: T.targetGlow,
    borderWidth: 2,
    borderColor: T.accentSoft,
    alignItems: 'center',
  },
  targetSuffix: { fontSize: 28, fontWeight: '900', color: T.accentDeep, letterSpacing: 1 },
  targetHint: { fontSize: 14, fontWeight: '700', color: T.inkMuted, marginTop: 4 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  tileWrap: { width: '44%', maxWidth: 160 },
  tile: {
    borderRadius: 18,
    borderWidth: 4,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    minHeight: 120,
    ...GROUPER_SESSION.shadow.soft,
  },
  emoji: { fontSize: 44, marginBottom: 6 },
  wordLabel: { fontSize: 20, fontWeight: '900', color: T.ink },
  check: { position: 'absolute', top: 8, right: 10, fontSize: 18, fontWeight: '900', color: T.tileCorrect },
});
