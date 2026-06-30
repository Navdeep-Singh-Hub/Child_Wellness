/**
 * Builder Session 3 — Game 1: Crystal Memory Vault
 * Flip two cards at a time to find matching pairs.
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
import { BUILDER_SESSION, MEMORY_VAULT_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const PAIRS = [
  { pairId: 'cat', emoji: '🐱', label: 'Cat' },
  { pairId: 'dog', emoji: '🐕', label: 'Dog' },
  { pairId: 'sun', emoji: '☀️', label: 'Sun' },
];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
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
  disabled,
}: {
  emoji: string;
  faceUp: boolean;
  matched: boolean;
  onPress: () => void;
  disabled: boolean;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (faceUp && !matched) {
      scale.value = withSequence(withSpring(1.06, { damping: 8 }), withSpring(1, { damping: 10 }));
    }
    if (matched) {
      scale.value = withSpring(1.04, { damping: 10 });
    }
  }, [faceUp, matched, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        disabled={disabled || matched}
        style={({ pressed }) => [
          styles.card,
          faceUp || matched ? styles.cardFront : styles.cardBack,
          matched && styles.cardMatched,
          pressed && !disabled && !matched && styles.pressed,
        ]}
        accessibilityLabel={faceUp || matched ? emoji : 'Hidden card'}
      >
        <Text style={styles.cardEmoji}>{faceUp || matched ? emoji : '✨'}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface MemoryCardGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function MemoryCardGame({
  onComplete,
  onBack,
  currentStep = 1,
  totalSteps = 5,
  sessionTitle,
}: MemoryCardGameProps) {
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
  const pairsFound = matched.size;

  useEffect(() => {
    speakBuilderHint('Flip two crystal cards to find matching pairs. Tap a card to turn it over.');
    return () => stopBuilderSpeech();
  }, []);

  const handleCardTap = useCallback(
    (index: number) => {
      if (lock || matched.has(cards[index].pairId) || flipped.includes(index)) return;

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* ignore */
      }

      const nextFlipped = flipped.length === 2 ? [index] : [...flipped, index];
      setFlipped(nextFlipped);

      if (nextFlipped.length === 2) {
        setLock(true);
        const [a, b] = nextFlipped;
        const isMatch = cards[a].pairId === cards[b].pairId;

        if (isMatch) {
          const pairId = cards[a].pairId;
          setMatched((m) => {
            const next = new Set(m).add(pairId);
            if (next.size >= PAIRS.length) {
              speakBuilderHint('All pairs found! Great memory!');
              setCelebrating(true);
              setTimeout(() => onComplete(), 2200);
            }
            return next;
          });
          setFlipped([]);
          speakBuilderHint('Match!');
          setLock(false);
        } else {
          speakBuilderHint('Not a match. Try again.');
          setTimeout(() => {
            setFlipped([]);
            setLock(false);
          }, 850);
        }
      }
    },
    [cards, flipped, lock, matched, onComplete]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Vault Cleared!"
          subtitle="You found every matching pair!"
          badgeEmoji="🧠"
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

      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>
              Build {currentStep} · {progressPct}%
            </Text>
          </View>
          <View style={styles.pairPill}>
            <Text style={styles.pairPillText}>
              {pairsFound}/{PAIRS.length} pairs
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
                speakBuilderHint('Flip two cards at a time. Find all the matching pairs!')
              }
            >
              <Text style={styles.prompt}>Find the matching pairs 🔊</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.vaultArea}>
        <View style={styles.panel}>
          <Text style={styles.panelLabel}>Crystal Grid</Text>
          <View style={styles.grid}>
            {cards.map((card, index) => {
              const isFlipped = flipped.includes(index) || matched.has(card.pairId);
              return (
                <MemoryCard
                  key={card.id}
                  emoji={card.emoji}
                  faceUp={isFlipped}
                  matched={matched.has(card.pairId)}
                  onPress={() => handleCardTap(index)}
                  disabled={lock}
                />
              );
            })}
          </View>
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
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
  pairPill: {
    backgroundColor: 'rgba(199, 210, 254, 0.45)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.accentSoft,
  },
  pairPillText: { fontSize: 12, fontWeight: '800', color: T.ink },
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
  vaultArea: { flex: 1, paddingHorizontal: 20, paddingTop: 12, justifyContent: 'center' },
  panel: {
    backgroundColor: T.panel,
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 16,
    alignItems: 'center',
    ...BUILDER_SESSION.shadow.card,
  },
  panelLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: T.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    maxWidth: 300,
  },
  card: {
    width: 68,
    height: 68,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  cardBack: {
    backgroundColor: T.cardBack,
    borderColor: T.cardBackBorder,
  },
  cardFront: {
    backgroundColor: T.cardFront,
    borderColor: T.accentSoft,
  },
  cardMatched: {
    backgroundColor: T.cardMatched,
    borderColor: T.cardMatchedBorder,
  },
  cardEmoji: { fontSize: 32 },
});
