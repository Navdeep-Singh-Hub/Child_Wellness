import {
  ActionGameOverlays,
  ActionGameShell,
  ActionChoiceButton,
  clearActionSpeech,
  DEFAULT_ACTION_ROUNDS,
  hapticActionSuccess,
  speakAction,
  useActionGameSession,
} from '@/components/game/speech/action-imitation/shared/actionImitationShared';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const SILLY = [
  { id: 'wiggle', emoji: '🪩', label: 'Wiggle' },
  { id: 'spin', emoji: '🌀', label: 'Spin' },
  { id: 'hop', emoji: '🐸', label: 'Hop' },
] as const;

export function SillyActionMatchGame({ onBack, onComplete }: Props) {
  const session = useActionGameSession('silly-action-match', DEFAULT_ACTION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [targetId, setTargetId] = useState<(typeof SILLY)[number]['id']>('wiggle');
  const [showChoices, setShowChoices] = useState(false);

  useEffect(() => {
    speakAction('Silly action match! Watch the funny move, then pick the same one!');
    return () => clearActionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    const target = SILLY[(session.round - 1) % SILLY.length];
    setTargetId(target.id);
    setShowChoices(false);
    speakAction(`Watch! ${target.label}!`);
    const t = setTimeout(() => {
      setShowChoices(true);
      speakAction('Which one matches?');
    }, 2200);
    return () => clearTimeout(t);
  }, [session.round, canPlay]);

  const target = SILLY.find((s) => s.id === targetId)!;

  const onPick = (id: (typeof SILLY)[number]['id']) => {
    if (!showChoices) return;
    if (id === targetId) {
      hapticActionSuccess();
      speakAction('Silly and correct!');
      setTimeout(() => session.completeRound(), 700);
    } else {
      speakAction('Look at the friend again!');
    }
  };

  return (
    <>
      <ActionGameShell
        title="Silly Action Match"
        subtitle="Match the funny movement"
        skills="🤪 Attention + imitation"
        gradient={['#EDE9FE', '#C4B5FD']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={showChoices ? 'Pick the matching silly move!' : `Watch: ${target.label}!`}
        avatarEmoji={target.emoji}
        avatarAnimating={!showChoices}
      >
        <View style={styles.grid}>
          {SILLY.map((s) => (
            <ActionChoiceButton
              key={s.id}
              label={s.label}
              emoji={s.emoji}
              accent="#7C3AED"
              selected={showChoices && s.id === targetId}
              onPress={() => onPick(s.id)}
            />
          ))}
        </View>
      </ActionGameShell>
      <ActionGameOverlays
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
