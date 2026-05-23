import {
  ActionChoiceTile,
  ActionsOverlays,
  ActionsShell,
  clearActionSpeech,
  DEFAULT_ACTION_ROUNDS,
  hapticActionSuccess,
  speakAction,
  useActionsSession,
} from '@/components/game/speech/actions/shared/actionsShared';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUNDS = [
  {
    verb: 'running',
    prompt: 'Who is running?',
    choices: [
      { id: 'run', emoji: '🏃', label: 'Running', correct: true },
      { id: 'sleep', emoji: '😴', label: 'Sleeping', correct: false },
      { id: 'eat', emoji: '🍽️', label: 'Eating', correct: false },
      { id: 'read', emoji: '📖', label: 'Reading', correct: false },
    ],
  },
  {
    verb: 'jumping',
    prompt: 'Who is jumping?',
    choices: [
      { id: 'sit', emoji: '🪑', label: 'Sitting', correct: false },
      { id: 'jump', emoji: '🤸', label: 'Jumping', correct: true },
      { id: 'wave', emoji: '👋', label: 'Waving', correct: false },
      { id: 'draw', emoji: '✏️', label: 'Drawing', correct: false },
    ],
  },
  {
    verb: 'swimming',
    prompt: 'Who is swimming?',
    choices: [
      { id: 'swim', emoji: '🏊', label: 'Swimming', correct: true },
      { id: 'fly', emoji: '✈️', label: 'Flying', correct: false },
      { id: 'cook', emoji: '👨‍🍳', label: 'Cooking', correct: false },
      { id: 'sing', emoji: '🎤', label: 'Singing', correct: false },
    ],
  },
];

export function WhoIsRunningGame({ onBack, onComplete }: Props) {
  const session = useActionsSession('who-is-running', DEFAULT_ACTION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakAction('Who is doing the action? Tap the right one!');
    return () => clearActionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    speakAction(round.prompt);
  }, [session.round, canPlay, round.prompt]);

  const onPick = (correct: boolean) => {
    if (correct) {
      hapticActionSuccess();
      speakAction(`Yes! ${round.verb}!`);
      setTimeout(() => session.completeRound(), 800);
    } else {
      speakAction(`Find who is ${round.verb}!`);
    }
  };

  return (
    <>
      <ActionsShell
        title="Who Is Running?"
        subtitle="Select the correct action"
        skills="🏃 Verb identification"
        gradient={['#FFEDD5', '#FDBA74']}
        accent="#EA580C"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={round.prompt}
      >
        <View style={styles.grid}>
          {round.choices.map((c) => (
            <ActionChoiceTile
              key={c.id}
              label={c.label}
              emoji={c.emoji}
              accent="#EA580C"
              onPress={() => onPick(c.correct)}
            />
          ))}
        </View>
      </ActionsShell>
      <ActionsOverlays
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
