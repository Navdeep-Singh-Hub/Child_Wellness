/**
 * Counter Session 10 — Game 2: Master Memory — 12 cards, 6 pairs
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { MASTER_MEMORY_THEME as T, COUNTER_SESSION } from '../counterSessionTheme';
import { speakCounterHint, stopCounterSpeech } from '../counterSessionSpeech';
import { SummitSkyBackground } from '../SummitSkyBackground';

const PAIRS = [
  { pairId: 'dog', emoji: '🐶' },
  { pairId: 'cat', emoji: '🐱' },
  { pairId: 'bird', emoji: '🐦' },
  { pairId: 'fish', emoji: '🐟' },
  { pairId: 'star', emoji: '⭐' },
  { pairId: 'heart', emoji: '❤️' },
];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function MemoryCard({
  emoji,
  faceUp,
  matched,
  onPress,
}: {
  emoji: string;
  faceUp: boolean;
  matched: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (matched) {
      scale.value = withSpring(1.05, { damping: 8 });
      setTimeout(() => {
        scale.value = withSpring(1, { damping: 10 });
      }, 200);
    }
  }, [matched, scale]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        disabled={matched}
        style={({ pressed }) => [
          styles.card,
          faceUp ? styles.cardFace : styles.cardBack,
          matched && styles.cardMatched,
          pressed && !matched && styles.pressed,
        ]}
      >
        {faceUp ? <Text style={styles.cardEmoji}>{emoji}</Text> : <Text style={styles.cardBackText}>?</Text>}
      </Pressable>
    </Animated.View>
  );
}

export function AdvancedMemoryGame({
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
  const cards = useMemo(
    () =>
      shuffle(
        PAIRS.flatMap((p) => [
          { id: `${p.pairId}-a`, pairId: p.pairId, emoji: p.emoji },
          { id: `${p.pairId}-b`, pairId: p.pairId, emoji: p.emoji },
        ])
      ),
    []
  );

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [celebrating, setCelebrating] = useState(false);
  const [lock, setLock] = useState(false);
  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakCounterHint('Match six pairs. Flip two cards at a time to find matching pictures.');
    return () => stopCounterSpeech();
  }, []);

  const handleCardTap = useCallback(
    (index: number) => {
      if (lock || matched.has(cards[index].pairId) || flipped.includes(index)) return;
      const nextFlipped = flipped.length === 2 ? [index] : [...flipped, index];
      setFlipped(nextFlipped);

      if (nextFlipped.length === 2) {
        setLock(true);
        const [a, b] = nextFlipped;
        const isMatch = cards[a].pairId === cards[b].pairId;
        if (isMatch) {
          setMatched((m) => {
            const next = new Set(m).add(cards[a].pairId);
            if (next.size >= PAIRS.length) {
              speakCounterHint('All pairs matched! Master memory!');
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
          setFlipped([]);
          speakCounterHint('Match!');
          setLock(false);
        } else {
          speakCounterHint('Not a match. Try again.');
          setTimeout(() => {
            setFlipped([]);
            setLock(false);
          }, 800);
        }
      }
    },
    [cards, flipped, lock, matched, onComplete]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration title="Master Memory!" subtitle="You matched all six pairs!" badgeEmoji="🎴" variant="ocean" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={[...T.gradient]} locations={[...T.gradientLocations]} style={StyleSheet.absoluteFill} />
      <SummitSkyBackground />
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
              <Pressable onPress={() => speakCounterHint('Flip two cards to find matching pairs.')}>
                <Text style={styles.prompt}>Match all 6 pairs 🔊</Text>
              </Pressable>
            </View>
          </View>
          <Text style={styles.matchCount}>{matched.size} / {PAIRS.length} pairs</Text>
        </View>
        <View style={styles.grid}>
          {cards.map((card, index) => (
            <MemoryCard
              key={card.id}
              emoji={card.emoji}
              faceUp={flipped.includes(index) || matched.has(card.pairId)}
              matched={matched.has(card.pairId)}
              onPress={() => handleCardTap(index)}
            />
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
  header: { paddingHorizontal: 0, paddingTop: 8, gap: 8, zIndex: 5, width: '100%', alignItems: 'center' },
  stepPill: {
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
    width: '100%',
    ...COUNTER_SESSION.shadow.soft,
  },
  mascot: { fontSize: 32 },
  bubbleBody: { flex: 1, gap: 2 },
  mascotName: { fontSize: 12, fontWeight: '800', color: T.accentDeep, textTransform: 'uppercase' },
  prompt: { fontSize: 14, fontWeight: '700', color: T.ink },
  matchCount: { fontSize: 14, fontWeight: '800', color: T.accentDeep },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 320, marginTop: 16 },
  card: {
    width: 64,
    height: 64,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  cardBack: { backgroundColor: T.cardBack, borderColor: T.accentDeep },
  cardFace: { backgroundColor: T.cardFace, borderColor: T.accentSoft },
  cardMatched: { borderColor: T.cardMatch, opacity: 0.75 },
  cardEmoji: { fontSize: 28 },
  cardBackText: { fontSize: 22, fontWeight: '800', color: '#FFF' },
});
