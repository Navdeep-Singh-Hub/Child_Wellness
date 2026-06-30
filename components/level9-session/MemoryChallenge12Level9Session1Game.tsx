/**
 * Level 9 (Clockwise) — Session 1, Game 2: Memory Challenge
 * Match 12 cards (6 pairs).
 */
import { ClockwiseGameShell } from '@/components/level9-session/shared/ClockwiseGameShell';
import { CW } from '@/components/level9-session/shared/clockwiseTheme';
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
  { pairId: 'star', emoji: '⭐', label: 'Star' },
  { pairId: 'heart', emoji: '❤️', label: 'Heart' },
  { pairId: 'moon', emoji: '🌙', label: 'Moon' },
  { pairId: 'sun', emoji: '☀️', label: 'Sun' },
  { pairId: 'flower', emoji: '🌸', label: 'Flower' },
];

const VOICE = 'Match 6 pairs. Flip two cards at a time to find matching pictures. 12 cards.';
const PALETTE = { accent: '#6366F1', glow: '#A5B4FC', secondary: '#818CF8' } as const;

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function GalaxyCard({
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
        accessibilityLabel={isOpen ? label : `Card ${index + 1}`}
      >
        {isOpen ? (
          <>
            <View style={[styles.cardGlow, isMatched && styles.cardGlowMatched]} />
            <Text style={styles.cardEmoji}>{emoji}</Text>
            {isMatched ? <Text style={styles.matchedMark}>✦</Text> : null}
          </>
        ) : (
          <LinearGradient
            colors={[`${PALETTE.accent}99`, `${PALETTE.secondary}55`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardBack}
          >
            <Text style={styles.backGlyph}>✦</Text>
            <Text style={styles.backNum}>{index + 1}</Text>
          </LinearGradient>
        )}
      </Pressable>
    </Animated.View>
  );
}

export interface MemoryChallenge12Level9Session1GameProps {
  onComplete: () => void;
}

export function MemoryChallenge12Level9Session1Game({ onComplete }: MemoryChallenge12Level9Session1GameProps) {
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
              setTimeout(() => onComplete(), 2200);
            }
            return next;
          });
          setFlipped([]);
          speak('Match!', 0.7);
          setLock(false);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
          setWrongIndices([a, b]);
          speak('Try again.', 0.6);
          setTimeout(() => {
            setFlipped([]);
            setWrongIndices([]);
            setLock(false);
          }, 800);
        }
      }
    },
    [cards, flipped, lock, matched, onComplete],
  );

  const coachLine =
    pairsFound === 0
      ? 'Flip two cards. Remember where each picture hides in the galaxy grid!'
      : pairsFound < PAIRS.length
        ? `${pairsFound} of ${PAIRS.length} pairs found — keep scanning!`
        : 'All pairs aligned!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Great Job!"
        subtitle="You matched all 6 pairs!"
        badgeEmoji="🎴"
      />
    );
  }

  return (
    <ClockwiseGameShell
      studio="MEMORY CHALLENGE · GAME 2"
      title="Match the pairs"
      instruction="Tap two cards to find matching pairs. 12 cards, 6 pairs."
      mascot="🎴"
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
            colors={[PALETTE.accent, PALETTE.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>
        <View style={styles.dotRow}>
          {Array.from({ length: PAIRS.length }, (_, i) => (
            <View key={i} style={[styles.dot, i < pairsFound && styles.dotFilled]} />
          ))}
        </View>
      </View>

      <View style={styles.gridFrame}>
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'transparent', `${PALETTE.secondary}22`]}
          style={styles.gridGlow}
        />
        <Text style={styles.gridLabel}>GALAXY GRID · 12 CARDS</Text>
        <View style={styles.grid}>
          {cards.map((card, index) => {
            const isOpen = flipped.includes(index) || matched.has(card.pairId);
            return (
              <GalaxyCard
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
          {attempts === 0 ? 'Tap any two cards to begin' : `Scans: ${attempts} · Match all 6 pairs`}
        </Text>
      </View>
    </ClockwiseGameShell>
  );
}

const styles = StyleSheet.create({
  progressWrap: { marginBottom: 14 },
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
    color: PALETTE.glow,
  },
  progressCount: { fontSize: 14, fontWeight: '900', color: CW.textLight },
  progressBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 5 },
  dotRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: CW.glassBorder,
  },
  dotFilled: { backgroundColor: CW.good, borderColor: CW.goodGlow },
  gridFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}55`,
    backgroundColor: 'rgba(8,12,40,0.5)',
    paddingVertical: 14,
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  gridGlow: { ...StyleSheet.absoluteFillObject },
  gridLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: PALETTE.glow,
    textAlign: 'center',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    justifyContent: 'center',
    maxWidth: 320,
    alignSelf: 'center',
  },
  card: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: CW.glassBorder,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8,12,40,0.8)',
  },
  cardOpen: {
    borderColor: `${PALETTE.glow}88`,
    backgroundColor: 'rgba(8,12,40,0.65)',
  },
  cardMatched: {
    borderColor: CW.good,
    opacity: 0.75,
  },
  cardPressed: { opacity: 0.9 },
  cardBack: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backGlyph: { fontSize: 22, color: PALETTE.glow, opacity: 0.9 },
  backNum: {
    position: 'absolute',
    bottom: 3,
    right: 5,
    fontSize: 8,
    fontWeight: '900',
    color: CW.textMuted,
  },
  cardGlow: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: `${PALETTE.secondary}22`,
  },
  cardGlowMatched: { backgroundColor: `${CW.good}33` },
  cardEmoji: { fontSize: 26 },
  matchedMark: {
    position: 'absolute',
    top: 3,
    right: 5,
    fontSize: 11,
    color: CW.goodGlow,
    fontWeight: '900',
  },
  legend: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(99,102,241,0.12)',
    borderWidth: 1,
    borderColor: `${PALETTE.accent}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: PALETTE.glow, textAlign: 'center' },
});
