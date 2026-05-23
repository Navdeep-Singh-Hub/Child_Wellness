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
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const MOVES = [
  { id: 'clap', emoji: '👏', label: 'Clap' },
  { id: 'jump', emoji: '⬆️', label: 'Jump' },
  { id: 'wave', emoji: '👋', label: 'Wave' },
] as const;

type MoveId = (typeof MOVES)[number]['id'];

const SEQUENCES: MoveId[][] = [
  ['clap', 'jump'],
  ['wave', 'clap'],
  ['jump', 'wave'],
];

export function FollowMyMoveGame({ onBack, onComplete }: Props) {
  const session = useActionGameSession('follow-my-move', DEFAULT_ACTION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [sequence, setSequence] = useState<MoveId[]>(SEQUENCES[0]);
  const [demoIndex, setDemoIndex] = useState(-1);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [phase, setPhase] = useState<'demo' | 'repeat'>('demo');

  useEffect(() => {
    speakAction('Follow my move! Watch the sequence, then tap the same moves in order!');
    return () => clearActionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    const seq = SEQUENCES[(session.round - 1) % SEQUENCES.length];
    setSequence(seq);
    setPlayerIndex(0);
    setPhase('demo');
    setDemoIndex(-1);
    speakAction('Watch the sequence!');
    let i = 0;
    const step = () => {
      if (i >= seq.length) {
        setDemoIndex(-1);
        setPhase('repeat');
        speakAction('Your turn! Repeat the moves!');
        return;
      }
      setDemoIndex(i);
      const m = MOVES.find((x) => x.id === seq[i])!;
      speakAction(m.label);
      i += 1;
      setTimeout(step, 1400);
    };
    const t = setTimeout(step, 500);
    return () => clearTimeout(t);
  }, [session.round, canPlay]);

  const onMove = (id: MoveId) => {
    if (phase !== 'repeat') return;
    if (sequence[playerIndex] === id) {
      hapticActionSuccess();
      const next = playerIndex + 1;
      if (next >= sequence.length) {
        speakAction('Amazing sequence!');
        setTimeout(() => session.completeRound(), 700);
      } else {
        setPlayerIndex(next);
        speakAction('Next move!');
      }
    } else {
      speakAction('Try the moves in the same order!');
      setPlayerIndex(0);
    }
  };

  const demoMove = demoIndex >= 0 ? MOVES.find((m) => m.id === sequence[demoIndex]) : null;

  return (
    <>
      <ActionGameShell
        title="Follow My Move"
        subtitle="Repeat the action sequence"
        skills="🧠 Motor planning"
        gradient={['#D1FAE5', '#6EE7B7']}
        accent="#059669"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={
          phase === 'demo'
            ? demoMove
              ? `Watch: ${demoMove.label}`
              : 'Get ready…'
            : `Repeat! Step ${playerIndex + 1} of ${sequence.length}`
        }
        avatarEmoji={demoMove?.emoji ?? '🧒'}
        avatarAnimating={phase === 'demo' && demoIndex >= 0}
      >
        {phase === 'repeat' && (
          <Text style={styles.seqHint}>
            Sequence: {sequence.map((id) => MOVES.find((m) => m.id === id)?.emoji).join(' → ')}
          </Text>
        )}
        <View style={styles.grid}>
          {MOVES.map((m) => (
            <ActionChoiceButton
              key={m.id}
              label={m.label}
              emoji={m.emoji}
              accent="#059669"
              onPress={() => onMove(m.id)}
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
  seqHint: { textAlign: 'center', fontSize: 22, marginBottom: 8, fontWeight: '800', color: '#065F46' },
});
