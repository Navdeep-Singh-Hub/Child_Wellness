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
import { Level2Picture } from '@/components/game/speech/level2-shared/Level2Picture';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUNDS = [
  {
    helper: 'Doctor',
    helperEmoji: '👨‍⚕️',
    helperImageKey: 'doctor' as const,
    actions: [
      { id: 'help', emoji: '🩹', imageKey: 'bandage' as const, label: 'Helps you feel better', correct: true },
      { id: 'fly', emoji: '✈️', imageKey: 'action-flying' as const, label: 'Flies a plane', correct: false },
      { id: 'bake', emoji: '🍞', imageKey: 'action-cooking' as const, label: 'Bakes bread', correct: false },
      { id: 'fix', emoji: '🔧', label: 'Fixes cars', correct: false },
    ],
  },
  {
    helper: 'Firefighter',
    helperEmoji: '👨‍🚒',
    helperImageKey: 'fire-fighter' as const,
    actions: [
      { id: 'teach', emoji: '📚', imageKey: 'teacher' as const, label: 'Teaches math', correct: false },
      { id: 'fire', emoji: '🚒', imageKey: 'fire-flame' as const, label: 'Puts out fires', correct: true },
      { id: 'hair', emoji: '💇', label: 'Cuts hair', correct: false },
      { id: 'farm', emoji: '🌾', imageKey: 'place-farm' as const, label: 'Grows crops', correct: false },
    ],
  },
  {
    helper: 'Teacher',
    helperEmoji: '👩‍🏫',
    helperImageKey: 'teacher' as const,
    actions: [
      { id: 'learn', emoji: '📖', imageKey: 'book' as const, label: 'Helps you learn', correct: true },
      { id: 'fish', emoji: '🎣', label: 'Catches fish', correct: false },
      { id: 'paint', emoji: '🏠', imageKey: 'action-painting' as const, label: 'Paints houses', correct: false },
      { id: 'mail', emoji: '📬', label: 'Delivers mail', correct: false },
    ],
  },
];

export function WhatDoesADoctorDoGame({ onBack, onComplete }: Props) {
  const session = useActionsSession('what-does-a-doctor-do', DEFAULT_ACTION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [helperPicked, setHelperPicked] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakAction('What does this helper do? Match the helper to the action.');
    return () => clearActionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setHelperPicked(false);
    speakAction(`What does a ${round.helper.toLowerCase()} do?`);
  }, [session.round, canPlay, round.helper]);

  const onAction = (correct: boolean) => {
    if (!helperPicked) {
      speakAction(`Tap the ${round.helper} first!`);
      return;
    }
    if (correct) {
      hapticActionSuccess();
      speakAction('That is what they do!');
      setTimeout(() => session.completeRound(), 800);
    } else {
      speakAction('Try the action that fits this helper!');
    }
  };

  return (
    <>
      <ActionsShell
        title="What Does a Doctor Do?"
        subtitle="Match helper to action"
        skills="🩺 Functional reasoning"
        gradient={['#EDE9FE', '#C4B5FD']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={helperPicked ? 'Tap what they do' : `Tap the ${round.helper}`}
      >
        <Pressable
          style={[styles.helperCard, helperPicked && styles.helperOn]}
          onPress={() => {
            setHelperPicked(true);
            speakAction(`${round.helper}! What do they do?`);
          }}
        >
          <Level2Picture imageKey={round.helperImageKey} emoji={round.helperEmoji} size={56} />
          <Text style={styles.helperLabel}>{round.helper}</Text>
        </Pressable>
        <View style={styles.grid}>
          {round.actions.map((a) => (
            <ActionChoiceTile
              key={a.id}
              label={a.label}
              emoji={a.emoji}
              actionId={a.id}
              imageKey={'imageKey' in a ? a.imageKey : undefined}
              accent="#7C3AED"
              onPress={() => onAction(a.correct)}
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
  helperCard: {
    alignSelf: 'center',
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 12,
  },
  helperOn: { borderColor: '#7C3AED', borderWidth: 3 },
  helperEmoji: { fontSize: 56 },
  helperLabel: { fontSize: 18, fontWeight: '900', color: '#7C3AED', marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
