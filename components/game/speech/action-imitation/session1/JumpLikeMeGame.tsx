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

export function JumpLikeMeGame({ onBack, onComplete }: Props) {
  const session = useActionGameSession('jump-like-me', DEFAULT_ACTION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [phase, setPhase] = useState<'demo' | 'your-turn'>('demo');
  const [hits, setHits] = useState(0);

  useEffect(() => {
    speakAction('Jump like me! When the friend jumps, tap Jump!');
    return () => clearActionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    setPhase('demo');
    speakAction('Watch the jump!');
    const t = setTimeout(() => {
      setPhase('your-turn');
      speakAction('Now you jump! Tap Jump!');
    }, 2000);
    return () => clearTimeout(t);
  }, [session.round, canPlay]);

  const onJump = () => {
    if (phase !== 'your-turn') return;
    const next = hits + 1;
    setHits(next);
    hapticActionSuccess();
    speakAction('Super jump!');
    if (next >= 2) setTimeout(() => session.completeRound(), 700);
  };

  return (
    <>
      <ActionGameShell
        title="Jump Like Me"
        subtitle="Match the character jump"
        skills="🦘 Gross motor imitation"
        gradient={['#DBEAFE', '#93C5FD']}
        accent="#2563EB"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={phase === 'demo' ? '⬆️ Friend is jumping!' : `⬆️ Your turn! (${hits}/2)`}
        avatarEmoji="🦘"
        avatarAnimating={phase === 'demo'}
      >
        <View style={styles.row}>
          <ActionChoiceButton label="Jump" emoji="⬆️" accent="#2563EB" onPress={onJump} />
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
  row: { flexDirection: 'row', justifyContent: 'center' },
});
