import {
  BodyPartButton,
  BodyPartsOverlays,
  BodyPartsShell,
  clearBodySpeech,
  DEFAULT_BODY_ROUNDS,
  hapticBodySuccess,
  speakBody,
  useBodyPartsSession,
} from '@/components/game/speech/body-parts/shared/bodyPartsShared';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type PartId = 'head' | 'shoulders' | 'knees' | 'toes';

const PARTS: { id: PartId; label: string; emoji: string; imageKey: 'body-head' | 'body-shoulders' | 'body-knee' | 'body-toes' }[] = [
  { id: 'head', label: 'Head', emoji: '🙂', imageKey: 'body-head' },
  { id: 'shoulders', label: 'Shoulders', emoji: '💪', imageKey: 'body-shoulders' },
  { id: 'knees', label: 'Knees', emoji: '🦵', imageKey: 'body-knee' },
  { id: 'toes', label: 'Toes', emoji: '🦶', imageKey: 'body-toes' },
];

const ROUNDS_CMD: { simon: boolean; part: PartId; say: string }[] = [
  { simon: true, part: 'head', say: 'Simon says touch your head!' },
  { simon: false, part: 'toes', say: 'Touch your toes!' },
  { simon: true, part: 'knees', say: 'Simon says touch your knees!' },
];

export function SimonSaysBodyGame({ onBack, onComplete }: Props) {
  const session = useBodyPartsSession('simon-says-body', DEFAULT_BODY_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [cmd, setCmd] = useState(ROUNDS_CMD[0]);

  useEffect(() => {
    speakBody('Simon Says! Only move when you hear Simon says!');
    return () => clearBodySpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    const c = ROUNDS_CMD[(session.round - 1) % ROUNDS_CMD.length];
    setCmd(c);
    const t = setTimeout(() => speakBody(c.say), 400);
    return () => clearTimeout(t);
  }, [session.round, canPlay]);

  const onPick = (id: PartId) => {
    if (cmd.simon) {
      if (id === cmd.part) {
        hapticBodySuccess();
        speakBody('Good listening!');
        setTimeout(() => session.completeRound(), 700);
      } else {
        speakBody('Listen for the right part!');
      }
    } else {
      if (id === cmd.part) {
        speakBody('Wait! Simon did not say!');
      } else {
        hapticBodySuccess();
        speakBody('You waited — great job!');
        setTimeout(() => session.completeRound(), 700);
      }
    }
  };

  return (
    <>
      <BodyPartsShell
        title="Simon Says Body"
        subtitle="Follow body instructions"
        skills="👂 Receptive language"
        gradient={['#FEE2E2', '#FCA5A5']}
        accent="#DC2626"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={cmd.simon ? '🟢 Simon says!' : '🔴 No Simon says — wait!'}
      >
        <View style={styles.grid}>
          {PARTS.map((p) => (
            <BodyPartButton
              key={p.id}
              label={p.label}
              emoji={p.emoji}
              imageKey={p.imageKey}
              accent="#DC2626"
              onPress={() => onPick(p.id)}
            />
          ))}
        </View>
      </BodyPartsShell>
      <BodyPartsOverlays
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
