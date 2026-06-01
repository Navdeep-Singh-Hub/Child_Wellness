import {
  clearDescriptionSpeech,
  DEFAULT_DESCRIPTION_ROUNDS,
  DescriptionChoiceTile,
  DescriptionsOverlays,
  DescriptionsShell,
  hapticDescriptionSuccess,
  speakDescription,
  useDescriptionsSession,
} from '@/components/game/speech/descriptions/shared/descriptionsShared';
import { Level2Picture } from '@/components/game/speech/level2-shared/Level2Picture';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUNDS = [
  {
    clues: ['It is cold.', 'You eat it.', 'It can be chocolate.'],
    speak: 'In the bag: cold, you eat it, can be chocolate.',
    choices: [
      { id: 'ice', emoji: '🍦', imageKey: 'ice-cream' as const, label: 'Ice cream', correct: true },
      { id: 'sock', emoji: '🧦', imageKey: 'sock' as const, label: 'Sock', correct: false },
      { id: 'rock', emoji: '🪨', imageKey: 'rock' as const, label: 'Rock', correct: false },
      { id: 'bell', emoji: '🔔', imageKey: 'bell' as const, label: 'Bell', correct: false },
    ],
  },
  {
    clues: ['You wear it on your head.', 'It can shade the sun.', 'It is not shoes.'],
    speak: 'In the bag: on your head, shades the sun, not shoes.',
    choices: [
      { id: 'hat', emoji: '🧢', imageKey: 'hat-cap' as const, label: 'Hat', correct: true },
      { id: 'glove', emoji: '🧤', imageKey: 'glove' as const, label: 'Glove', correct: false },
      { id: 'plate', emoji: '🍽️', imageKey: 'plate' as const, label: 'Plate', correct: false },
      { id: 'duck', emoji: '🦆', label: 'Duck', correct: false },
    ],
  },
  {
    clues: ['It tells time.', 'It has numbers.', 'You look at your wrist.'],
    speak: 'In the bag: tells time, has numbers, on your wrist.',
    choices: [
      { id: 'watch', emoji: '⌚', imageKey: 'watch' as const, label: 'Watch', correct: true },
      { id: 'candle', emoji: '🕯️', imageKey: 'candle' as const, label: 'Candle', correct: false },
      { id: 'pillow', emoji: '🛏️', imageKey: 'pillow' as const, label: 'Pillow', correct: false },
      { id: 'leaf', emoji: '🍃', imageKey: 'leaf' as const, label: 'Leaf', correct: false },
    ],
  },
];

export function MysteryBagGame({ onBack, onComplete }: Props) {
  const session = useDescriptionsSession('mystery-bag', DEFAULT_DESCRIPTION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [clueIndex, setClueIndex] = useState(0);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakDescription('Mystery bag! Tap the bag for clues, then guess!');
    return () => clearDescriptionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setClueIndex(0);
    speakDescription('Tap the mystery bag for a clue!');
  }, [session.round, canPlay]);

  const revealClue = () => {
    const idx = clueIndex;
    if (idx < round.clues.length) {
      speakDescription(round.clues[idx]);
      setClueIndex((i) => i + 1);
    } else {
      speakDescription('What is inside? Make your guess!');
    }
  };

  const onPick = (correct: boolean) => {
    if (clueIndex < 1) {
      speakDescription('Get at least one clue from the bag first!');
      return;
    }
    if (correct) {
      hapticDescriptionSuccess();
      speakDescription('You found what was inside!');
      setTimeout(() => session.completeRound(), 800);
    } else {
      speakDescription('Try another guess!');
    }
  };

  return (
    <>
      <DescriptionsShell
        title="Mystery Bag"
        subtitle="Identify from hidden clues"
        skills="🎒 Inferencing"
        gradient={['#F1F5F9', '#94A3B8']}
        accent="#475569"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={
          clueIndex === 0
            ? 'Tap the bag for clues'
            : clueIndex < round.clues.length
              ? `Clue ${clueIndex} / ${round.clues.length}`
              : 'Guess what is inside!'
        }
      >
        <Pressable style={styles.bagWrap} onPress={revealClue}>
          <Level2Picture imageKey="scene-mystery-bag" emoji="🎒" size={88} />
          <Text style={styles.bagLabel}>Mystery bag — tap for clue</Text>
        </Pressable>
        {clueIndex > 0 ? (
          <View style={styles.cluesShown}>
            {round.clues.slice(0, clueIndex).map((c, i) => (
              <Text key={i} style={styles.clueLine}>
                {i + 1}. {c}
              </Text>
            ))}
          </View>
        ) : null}
        <View style={styles.grid}>
          {round.choices.map((c) => (
            <DescriptionChoiceTile
              key={c.id}
              label={c.label}
              emoji={c.emoji}
              imageKey={c.imageKey}
              accent="#475569"
              onPress={() => onPick(c.correct)}
            />
          ))}
        </View>
      </DescriptionsShell>
      <DescriptionsOverlays
        showRoundSuccess={session.showRoundSuccess}
        gameFinished={session.gameFinished}
        finalStats={session.finalStats}
        onBack={onBack}
        onComplete={onComplete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  bagWrap: { alignItems: 'center', marginBottom: 8 },
  bagLabel: { fontSize: 14, fontWeight: '800', color: '#475569', marginTop: 4 },
  cluesShown: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  clueLine: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
