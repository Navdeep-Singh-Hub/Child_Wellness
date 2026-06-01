import {
  clearComprehensionSpeech,
  ComprehensionChoiceTile,
  ComprehensionOverlays,
  ComprehensionShell,
  DEFAULT_COMPREHENSION_ROUNDS,
  hapticComprehensionSuccess,
  speakComprehension,
  useComprehensionSession,
} from '@/components/game/speech/comprehension/shared/comprehensionShared';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type Task = {
  type: string;
  prompt: string;
  speak: string;
  choices: { id: string; emoji: string; label: string; correct: boolean }[];
};

const ROUNDS: Task[] = [
  {
    type: 'Direction',
    prompt: 'Tap the BIG ball',
    speak: 'Smart listener! Tap the BIG ball.',
    choices: [
      { id: 'big', emoji: '⚽', imageKey: 'ball-big' as const, label: 'Big ball', correct: true },
      { id: 'small', emoji: '🏐', imageKey: 'ball-small' as const, label: 'Small ball', correct: false },
      { id: 'box', emoji: '📦', imageKey: 'box' as const, label: 'Box', correct: false },
      { id: 'star', emoji: '⭐', imageKey: 'star' as const, label: 'Star', correct: false },
    ],
  },
  {
    type: 'Category',
    prompt: 'Tap something that is NOT food',
    speak: 'Tap something that is NOT food.',
    choices: [
      { id: 'apple', emoji: '🍎', imageKey: 'apple' as const, label: 'Apple', correct: false },
      { id: 'car', emoji: '🚗', imageKey: 'car' as const, label: 'Car', correct: true },
      { id: 'bread', emoji: '🍞', imageKey: 'bread' as const, label: 'Bread', correct: false },
      { id: 'milk', emoji: '🥛', imageKey: 'milk' as const, label: 'Milk', correct: false },
    ],
  },
  {
    type: 'Pronoun',
    prompt: 'They are playing — tap THEY',
    speak: 'They are playing. Tap THEY.',
    choices: [
      { id: 'he', emoji: '👦', imageKey: 'boy' as const, label: 'He', correct: false },
      { id: 'she', emoji: '👧', imageKey: 'girl' as const, label: 'She', correct: false },
      { id: 'they', emoji: '👫', imageKey: 'friends-two-kids' as const, label: 'They', correct: true },
      { id: 'it', emoji: '🧸', imageKey: 'teddy' as const, label: 'It', correct: false },
    ],
  },
];

export function SmartListenerChallengeGame({ onBack, onComplete }: Props) {
  const session = useComprehensionSession('smart-listener-challenge', DEFAULT_COMPREHENSION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakComprehension('Smart listener challenge! Mixed listening tasks — listen and tap!');
    return () => clearComprehensionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    speakComprehension(round.speak);
  }, [session.round, canPlay, round.speak]);

  const onPick = (correct: boolean) => {
    if (correct) {
      hapticComprehensionSuccess();
      speakComprehension('Super listener!');
      setTimeout(() => session.completeRound(), 800);
    } else {
      speakComprehension(round.speak);
    }
  };

  return (
    <>
      <ComprehensionShell
        title="Smart Listener Challenge"
        subtitle="Mixed receptive tasks"
        skills="🎧 Integrated comprehension"
        gradient={['#FFEDD5', '#FDBA74']}
        accent="#EA580C"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`${round.type}: ${round.prompt}`}
      >
        <Text style={styles.badge}>🎧 Challenge {session.round}</Text>
        <View style={styles.grid}>
          {round.choices.map((c) => (
            <ComprehensionChoiceTile
              key={c.id}
              label={c.label}
              emoji={c.emoji}
              imageKey={c.imageKey}
              accent="#EA580C"
              onPress={() => onPick(c.correct)}
            />
          ))}
        </View>
      </ComprehensionShell>
      <ComprehensionOverlays
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
  badge: { textAlign: 'center', fontSize: 16, fontWeight: '900', color: '#EA580C', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
