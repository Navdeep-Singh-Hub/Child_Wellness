import {
  clearSequenceSpeech,
  DEFAULT_SEQUENCE_ROUNDS,
  hapticSequenceSuccess,
  SequenceChoiceTile,
  SequencesOverlays,
  SequencesShell,
  speakSequence,
  useSequencesSession,
} from '@/components/game/speech/sequences/shared/sequencesShared';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type Card = { id: string; emoji: string; label: string; order: number };

const ROUNDS: { title: string; cards: Card[] }[] = [
  {
    title: 'Plant a flower',
    cards: [
      { id: 'seed', emoji: '🌱', label: 'Plant seed', order: 1 },
      { id: 'water', emoji: '💧', label: 'Water', order: 2 },
      { id: 'flower', emoji: '🌸', label: 'Flower', order: 3 },
    ],
  },
  {
    title: 'Make a sandwich',
    cards: [
      { id: 'bread', emoji: '🍞', label: 'Bread', order: 1 },
      { id: 'fill', emoji: '🧀', label: 'Fillings', order: 2 },
      { id: 'eat', emoji: '🥪', label: 'Eat', order: 3 },
    ],
  },
  {
    title: 'Get ready for bed',
    cards: [
      { id: 'bath', emoji: '🛁', label: 'Bath', order: 1 },
      { id: 'pjs', emoji: '👕', label: 'Pajamas', order: 2 },
      { id: 'sleep', emoji: '😴', label: 'Sleep', order: 3 },
    ],
  },
];

export function StoryOrderCardsGame({ onBack, onComplete }: Props) {
  const session = useSequencesSession('story-order-cards', DEFAULT_SEQUENCE_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [nextOrder, setNextOrder] = useState(1);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakSequence('Story order! Tap the cards in the right order.');
    return () => clearSequenceSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setNextOrder(1);
    setPicked(new Set());
    speakSequence(`Put the story in order: ${round.title}. Tap step 1 first!`);
  }, [session.round, canPlay, round.title]);

  const onCard = (card: Card) => {
    if (picked.has(card.id)) return;
    if (card.order === nextOrder) {
      hapticSequenceSuccess();
      const next = new Set(picked);
      next.add(card.id);
      setPicked(next);
      if (nextOrder >= 3) {
        speakSequence('Perfect story order!');
        setTimeout(() => session.completeRound(), 800);
      } else {
        const n = nextOrder + 1;
        setNextOrder(n);
        speakSequence(`Good! Now tap step ${n}.`);
      }
    } else {
      speakSequence(`Tap step ${nextOrder} first!`);
    }
  };

  return (
    <>
      <SequencesShell
        title="Story Order Cards"
        subtitle="Arrange the sequence"
        skills="📖 Sequencing"
        gradient={['#EDE9FE', '#C4B5FD']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Step ${nextOrder} of 3 — ${round.title}`}
      >
        <View style={styles.row}>
          {round.cards.map((c) => (
            <SequenceChoiceTile
              key={c.id}
              label={c.label}
              emoji={c.emoji}
              accent="#7C3AED"
              dimmed={picked.has(c.id)}
              orderNum={picked.has(c.id) ? c.order : undefined}
              onPress={() => onCard(c)}
            />
          ))}
        </View>
      </SequencesShell>
      <SequencesOverlays
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
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
