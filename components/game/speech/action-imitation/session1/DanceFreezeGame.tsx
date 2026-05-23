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

const POSES = [
  { id: 'star', emoji: '⭐', label: 'Star' },
  { id: 'tree', emoji: '🌳', label: 'Tree' },
  { id: 'freeze', emoji: '🧊', label: 'Freeze' },
] as const;

export function DanceFreezeGame({ onBack, onComplete }: Props) {
  const session = useActionGameSession('dance-freeze', DEFAULT_ACTION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [phase, setPhase] = useState<'dance' | 'freeze' | 'pick'>('dance');
  const [targetId, setTargetId] = useState<(typeof POSES)[number]['id']>('freeze');

  useEffect(() => {
    speakAction('Dance freeze! Copy the pose when the music stops!');
    return () => clearActionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    const target = POSES[session.round % POSES.length];
    setTargetId(target.id);
    setPhase('dance');
    speakAction('Dance dance dance!');
    const danceT = setTimeout(() => {
      setPhase('freeze');
      speakAction(`Freeze! Copy the ${target.label} pose!`);
      setTimeout(() => setPhase('pick'), 600);
    }, 2400);
    return () => clearTimeout(danceT);
  }, [session.round, canPlay]);

  const onPick = (id: (typeof POSES)[number]['id']) => {
    if (phase !== 'pick') return;
    if (id === targetId) {
      hapticActionSuccess();
      speakAction('Perfect pose!');
      setTimeout(() => session.completeRound(), 700);
    } else {
      speakAction('Try the matching pose!');
    }
  };

  const target = POSES.find((p) => p.id === targetId)!;

  return (
    <>
      <ActionGameShell
        title="Dance Freeze"
        subtitle="Copy the dance pose"
        skills="💃 Body imitation"
        gradient={['#FCE7F3', '#F9A8D4']}
        accent="#DB2777"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={
          phase === 'dance'
            ? '💃 Dancing…'
            : phase === 'freeze'
              ? `🧊 Copy: ${target.emoji} ${target.label}!`
              : 'Pick the same pose!'
        }
        avatarEmoji={phase === 'dance' ? '💃' : target.emoji}
        avatarAnimating={phase === 'dance'}
      >
        <View style={styles.grid}>
          {POSES.map((p) => (
            <ActionChoiceButton
              key={p.id}
              label={p.label}
              emoji={p.emoji}
              accent="#DB2777"
              onPress={() => onPick(p.id)}
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
