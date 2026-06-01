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
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUNDS = [
  {
    verb: 'Drink',
    pictures: [
      { id: 'drink', emoji: '🥤', imageKey: 'action-drinking' as const, label: 'Drinking', match: true },
      { id: 'sleep', emoji: '😴', imageKey: 'action-sleeping' as const, label: 'Sleeping', match: false },
      { id: 'kick', emoji: '⚽', imageKey: 'action-kicking' as const, label: 'Kicking', match: false },
      { id: 'paint', emoji: '🎨', imageKey: 'action-painting' as const, label: 'Painting', match: false },
    ],
  },
  {
    verb: 'Write',
    pictures: [
      { id: 'run', emoji: '🏃', imageKey: 'action-running' as const, label: 'Running', match: false },
      { id: 'write', emoji: '✍️', imageKey: 'action-writing' as const, label: 'Writing', match: true },
      { id: 'kick', emoji: '⚽', label: 'Kicking', match: false },
      { id: 'eat', emoji: '🍎', imageKey: 'action-eating' as const, label: 'Eating', match: false },
    ],
  },
  {
    verb: 'Clap',
    pictures: [
      { id: 'clap', emoji: '👏', imageKey: 'action-clapping' as const, label: 'Clapping', match: true },
      { id: 'drive', emoji: '🚗', imageKey: 'action-driving' as const, label: 'Driving', match: false },
      { id: 'cry', emoji: '😢', imageKey: 'action-crying' as const, label: 'Crying', match: false },
      { id: 'build', emoji: '🧱', imageKey: 'action-building' as const, label: 'Building', match: false },
    ],
  },
];

export function MatchTheActionGame({ onBack, onComplete }: Props) {
  const session = useActionsSession('match-the-action', DEFAULT_ACTION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [verbPicked, setVerbPicked] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakAction('Match the action! Tap the verb, then the picture.');
    return () => clearActionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setVerbPicked(false);
    speakAction(`Find the picture for: ${round.verb}`);
  }, [session.round, canPlay, round.verb]);

  const onPicture = (match: boolean) => {
    if (!verbPicked) {
      speakAction('Tap the verb word first!');
      return;
    }
    if (match) {
      hapticActionSuccess();
      speakAction('That matches!');
      setTimeout(() => session.completeRound(), 800);
    } else {
      speakAction(`That is not ${round.verb.toLowerCase()}!`);
    }
  };

  return (
    <>
      <ActionsShell
        title="Match the Action"
        subtitle="Match verb to picture"
        skills="🎯 Verb comprehension"
        gradient={['#E0F2FE', '#7DD3FC']}
        accent="#0284C7"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={verbPicked ? 'Tap the matching picture' : 'Tap the verb'}
      >
        <Pressable
          style={[styles.verbCard, verbPicked && styles.verbOn]}
          onPress={() => {
            setVerbPicked(true);
            speakAction(`${round.verb}! Now find the picture.`);
          }}
        >
          <Text style={styles.verbText}>{round.verb}</Text>
        </Pressable>
        <View style={styles.grid}>
          {round.pictures.map((p) => (
            <ActionChoiceTile
              key={p.id}
              label={p.label}
              emoji={p.emoji}
              actionId={p.id}
              accent="#0284C7"
              onPress={() => onPicture(p.match)}
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
  verbCard: {
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  verbOn: { borderColor: '#0284C7', borderWidth: 3 },
  verbText: { fontSize: 28, fontWeight: '900', color: '#0284C7' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
