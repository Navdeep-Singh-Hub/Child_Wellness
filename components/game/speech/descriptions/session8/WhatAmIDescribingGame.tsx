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
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUNDS = [
  {
    description: 'It is yellow, curved, and monkeys love it.',
    speak: 'I am yellow and curved. Monkeys love me.',
    choices: [
      { id: 'banana', emoji: '🍌', imageKey: 'banana' as const, label: 'Banana', correct: true },
      { id: 'carrot', emoji: '🥕', imageKey: 'carrot' as const, label: 'Carrot', correct: false },
      { id: 'cheese', emoji: '🧀', imageKey: 'cheese' as const, label: 'Cheese', correct: false },
      { id: 'star', emoji: '⭐', imageKey: 'star' as const, label: 'Star', correct: false },
    ],
  },
  {
    description: 'It has four wheels and takes you places.',
    speak: 'I have four wheels and take you places.',
    choices: [
      { id: 'bike', emoji: '🚲', imageKey: 'bike' as const, label: 'Bike', correct: false },
      { id: 'car', emoji: '🚗', imageKey: 'car' as const, label: 'Car', correct: true },
      { id: 'boat', emoji: '⛵', imageKey: 'boat' as const, label: 'Boat', correct: false },
      { id: 'plane', emoji: '✈️', imageKey: 'plane' as const, label: 'Plane', correct: false },
    ],
  },
  {
    description: 'It lives in water and swims with fins.',
    speak: 'I live in water and swim with fins.',
    choices: [
      { id: 'bird', emoji: '🐦', imageKey: 'bird' as const, label: 'Bird', correct: false },
      { id: 'fish', emoji: '🐟', imageKey: 'fish' as const, label: 'Fish', correct: true },
      { id: 'cow', emoji: '🐄', imageKey: 'cow' as const, label: 'Cow', correct: false },
      { id: 'bee', emoji: '🐝', imageKey: 'bee' as const, label: 'Bee', correct: false },
    ],
  },
];

export function WhatAmIDescribingGame({ onBack, onComplete }: Props) {
  const session = useDescriptionsSession('what-am-i-describing', DEFAULT_DESCRIPTION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [heard, setHeard] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakDescription('What am I describing? Tap the description, then the picture.');
    return () => clearDescriptionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setHeard(false);
    speakDescription(round.speak);
  }, [session.round, canPlay, round.speak]);

  const onPick = (correct: boolean) => {
    if (!heard) {
      speakDescription('Tap the description box first!');
      return;
    }
    if (correct) {
      hapticDescriptionSuccess();
      speakDescription('That matches!');
      setTimeout(() => session.completeRound(), 800);
    } else {
      speakDescription('That does not match the words!');
    }
  };

  return (
    <>
      <DescriptionsShell
        title="What Am I Describing?"
        subtitle="Match verbal description"
        skills="💬 Language processing"
        gradient={['#FEF9C3', '#FDE047']}
        accent="#CA8A04"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={heard ? 'Tap the matching picture' : 'Tap to hear again'}
      >
        <Pressable
          style={[styles.descCard, heard && styles.descOn]}
          onPress={() => {
            setHeard(true);
            speakDescription(round.speak);
          }}
        >
          <Text style={styles.descText}>{round.description}</Text>
        </Pressable>
        <View style={styles.grid}>
          {round.choices.map((c) => (
            <DescriptionChoiceTile
              key={c.id}
              label={c.label}
              emoji={c.emoji}
              imageKey={c.imageKey}
              accent="#CA8A04"
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
  descCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  descOn: { borderColor: '#CA8A04', borderWidth: 3 },
  descText: { fontSize: 17, fontWeight: '800', color: '#0F172A', lineHeight: 24, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
