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

type Phase = 'demo' | 'your-turn' | 'success';

export function CopyTheClapGame({ onBack, onComplete }: Props) {
  const session = useActionGameSession('copy-the-clap', DEFAULT_ACTION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [phase, setPhase] = useState<Phase>('demo');
  const [claps, setClaps] = useState(0);

  useEffect(() => () => clearActionSpeech(), []);

  useEffect(() => {
    if (!canPlay) return;
    setClaps(0);
    setPhase('demo');
    speakAction('Watch me clap!');
    const t = setTimeout(() => {
      setPhase('your-turn');
      speakAction('Your turn! Tap Clap two times!');
    }, 2200);
    return () => clearTimeout(t);
  }, [session.round, canPlay]);

  const onClap = () => {
    if (phase !== 'your-turn') return;
    const next = claps + 1;
    setClaps(next);
    if (next >= 2) {
      hapticActionSuccess();
      speakAction('Great clapping!');
      setPhase('success');
      setTimeout(() => session.completeRound(), 900);
    }
  };

  const hint =
    phase === 'demo' ? '👏 Friend is clapping…' : phase === 'your-turn' ? `👏 Your turn! (${claps}/2 claps)` : '✨ Nice copy!';

  return (
    <>
      <ActionGameShell
        title="Copy the Clap"
        subtitle="Avatar claps → you tap clap"
        skills="👏 Action imitation"
        gradient={['#FEF3C7', '#FDE68A']}
        accent="#D97706"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        startEmoji="👏"
        startTitle="Copy the clap!"
        instructionSteps={[
          'Watch your friend clap first.',
          'When it is your turn, tap Clap two times.',
          'Match the rhythm — have fun copying!',
        ]}
        onSpeakStart={() =>
          speakAction('Copy the clap! Watch me clap, then tap Clap two times!')
        }
        phaseHint={hint}
        avatarEmoji="👏"
        avatarImageKey="action-clapping"
        avatarAnimating={phase === 'demo'}
      >
        <View style={styles.row}>
          <ActionChoiceButton label="Clap" emoji="👏" actionId="clap" accent="#D97706" onPress={onClap} />
        </View>
        {phase === 'demo' && <Text style={styles.demoHands}>👏 👏</Text>}
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
  demoHands: { textAlign: 'center', fontSize: 36, marginTop: 12 },
});
