/**
 * Level 7 Reader — Session 1, Game 2: Star Grid
 * Match 8 picture cards (4 pairs). Flip two at a time.
 */
import { ReaderGameShell } from '@/components/reader-session/shared/ReaderGameShell';
import { RD } from '@/components/reader-session/shared/readerTheme';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { speak } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const PAIRS = [
  { pairId: 'tree', emoji: '🌳', label: 'Tree' },
  { pairId: 'dog', emoji: '🐶', label: 'Dog' },
  { pairId: 'car', emoji: '🚗', label: 'Car' },
  { pairId: 'apple', emoji: '🍎', label: 'Apple' },
];

const VOICE = 'Match 4 pairs. Flip two star cards at a time to find matching pictures.';
const GRID = { accent: '#7C3AED', accentBright: '#C4B5FD', cyan: '#22D3EE' } as const;

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function StarCard({
  index,
  emoji,
  label,
  isOpen,
  isMatched,
  shake,
  onPress,
}: {
  index: number;
  emoji: string;
  label: string;
  isOpen: boolean;
  isMatched: boolean;
  shake: boolean;
  onPress: () => void;
}) {
  const shakeX = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (shake) {
      shakeX.value = withSequence(
        withTiming(-7, { duration: 50 }),
        withTiming(7, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
  }, [shake, shakeX]);

  useEffect(() => {
    if (isOpen && !isMatched) {
      scale.value = withSpring(1.04, { damping: 10 });
    } else if (isMatched) {
      scale.value = withSpring(0.96, { damping: 12 });
    } else {
      scale.value = withTiming(1, { duration: 150 });
    }
  }, [isOpen, isMatched, scale]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        disabled={isMatched}
        style={({ pressed }) => [
          styles.card,
          isOpen && styles.cardOpen,
          isMatched && styles.cardMatched,
          pressed && !isMatched && styles.cardPressed,
        ]}
        accessibilityLabel={isOpen ? label : `Star card ${index + 1}`}
      >
        {isOpen ? (
          <>
            <View style={[styles.cardGlow, isMatched && styles.cardGlowMatched]} />
            <Text style={styles.cardEmoji}>{emoji}</Text>
            {isMatched ? <Text style={styles.matchedMark}>✦</Text> : null}
          </>
        ) : (
          <LinearGradient
            colors={[`${GRID.accent}99`, `${GRID.cyan}55`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardBack}
          >
            <Text style={styles.backStar}>✦</Text>
            <Text style={styles.backNum}>{index + 1}</Text>
          </LinearGradient>
        )}
      </Pressable>
    </Animated.View>
  );
}

export interface MemoryGrid8ReaderSession1GameProps {
  onComplete: () => void;
}

export function MemoryGrid8ReaderSession1Game({ onComplete }: MemoryGrid8ReaderSession1GameProps) {
  const cards = useMemo(
    () =>
      shuffle(
        PAIRS.flatMap((p) => [
          { id: `${p.pairId}-a`, pairId: p.pairId, emoji: p.emoji, label: p.label },
          { id: `${p.pairId}-b`, pairId: p.pairId, emoji: p.emoji, label: p.label },
        ]),
      ),
    [],
  );

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [lock, setLock] = useState(false);
  const [wrongIndices, setWrongIndices] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const pairsFound = matched.size;
  const progressPct = (pairsFound / PAIRS.length) * 100;

  const handleCardTap = useCallback(
    (index: number) => {
      if (lock || matched.has(cards[index].pairId) || flipped.includes(index)) return;
      const nextFlipped = flipped.length === 2 ? [index] : [...flipped, index];
      setFlipped(nextFlipped);
      setWrongIndices([]);

      if (nextFlipped.length === 2) {
        setLock(true);
        setAttempts((a) => a + 1);
        const [a, b] = nextFlipped;
        const match = cards[a].pairId === cards[b].pairId;
        if (match) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          setMatched((m) => {
            const next = new Set(m).add(cards[a].pairId);
            if (next.size >= PAIRS.length) {
              setShowSuccess(true);
              setTimeout(() => onComplete(), 2400);
            }
            return next;
          });
          setFlipped([]);
          speak('Match! A pair found!', 0.7);
          setLock(false);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
          setWrongIndices([a, b]);
          speak('Not a match. Try again!', 0.65);
          setTimeout(() => {
            setFlipped([]);
            setWrongIndices([]);
            setLock(false);
          }, 850);
        }
      }
    },
    [cards, flipped, lock, matched, onComplete],
  );

  const coachLine =
    pairsFound === 0
      ? 'Flip two cards. Remember where each picture hides!'
      : pairsFound < PAIRS.length
        ? `${pairsFound} of ${PAIRS.length} pairs found — keep scanning the grid!`
        : 'All pairs aligned!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Star Grid!"
        subtitle="You matched all 4 constellation pairs!"
        badgeEmoji="✨"
      />
    );
  }

  return (
    <ReaderGameShell
      studio="STAR GRID · GAME 2"
      title="Match the pairs"
      instruction="Tap two star cards to find matching pictures. 8 cards, 4 pairs."
      mascot="✨"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.progressWrap}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>PAIRS FOUND</Text>
          <Text style={styles.progressCount}>
            {pairsFound} / {PAIRS.length}
          </Text>
        </View>
        <View style={styles.progressBg}>
          <LinearGradient
            colors={[GRID.accent, GRID.cyan]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>
      </View>

      <View style={styles.gridFrame}>
        <LinearGradient
          colors={[`${GRID.accent}33`, 'transparent', `${GRID.cyan}22`]}
          style={styles.gridGlow}
        />
        <Text style={styles.gridLabel}>CONSTELLATION GRID</Text>
        <View style={styles.grid}>
          {cards.map((card, index) => {
            const isOpen = flipped.includes(index) || matched.has(card.pairId);
            return (
              <StarCard
                key={card.id}
                index={index}
                emoji={card.emoji}
                label={card.label}
                isOpen={isOpen}
                isMatched={matched.has(card.pairId)}
                shake={wrongIndices.includes(index)}
                onPress={() => handleCardTap(index)}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTxt}>
          {attempts === 0 ? 'Tap any two cards to begin' : `Scans: ${attempts} · Find all matching pairs`}
        </Text>
      </View>
    </ReaderGameShell>
  );
}

const styles = StyleSheet.create({
  progressWrap: { marginBottom: 16 },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: GRID.accentBright,
  },
  progressCount: { fontSize: 14, fontWeight: '900', color: RD.textLight },
  progressBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 5 },
  gridFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${GRID.accent}55`,
    backgroundColor: 'rgba(30,20,60,0.5)',
    paddingVertical: 14,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  gridGlow: { ...StyleSheet.absoluteFillObject },
  gridLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: GRID.accentBright,
    textAlign: 'center',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    maxWidth: 300,
    alignSelf: 'center',
  },
  card: {
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: RD.glassBorder,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11,10,26,0.8)',
  },
  cardOpen: {
    borderColor: `${GRID.cyan}88`,
    backgroundColor: 'rgba(11,10,26,0.65)',
  },
  cardMatched: {
    borderColor: RD.good,
    opacity: 0.75,
  },
  cardPressed: { opacity: 0.9 },
  cardBack: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backStar: { fontSize: 28, color: RD.star, opacity: 0.9 },
  backNum: {
    position: 'absolute',
    bottom: 4,
    right: 6,
    fontSize: 8,
    fontWeight: '900',
    color: RD.textMuted,
  },
  cardGlow: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${GRID.cyan}22`,
  },
  cardGlowMatched: { backgroundColor: `${RD.good}33` },
  cardEmoji: { fontSize: 34 },
  matchedMark: {
    position: 'absolute',
    top: 4,
    right: 6,
    fontSize: 12,
    color: RD.goodGlow,
    fontWeight: '900',
  },
  legend: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(124,58,237,0.12)',
    borderWidth: 1,
    borderColor: `${GRID.accent}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: GRID.accentBright, textAlign: 'center' },
});
