import type { MouthPose } from '@/components/game/speech/mouth-imitation/modules/imitationTypes';
import {
  DEFAULT_IMITATION_ROUNDS,
  IMITATION_CYCLES_PER_ROUND,
  ImitationActionButtons,
  ImitationGameFrame,
  ImitationGameOverlays,
  MouthFaceDisplay,
  clearImitationSpeech,
  speakImitation,
  useImitationGameSession,
  useImitationRoundLoop,
} from '@/components/game/speech/mouth-imitation/shared/mouthImitationShared';
import type { ImitationSense } from '@/hooks/useImitation';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const POSES: MouthPose[] = ['open', 'wide', 'funny'];

export function FunnyMonsterMouthGame({ onBack, onComplete }: Props) {
  const session = useImitationGameSession('funny-monster-mouth', DEFAULT_IMITATION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const [laugh, setLaugh] = useState(false);

  useEffect(() => {
    speakImitation('Funny Monster Mouth! Copy the silly monster faces.');
    return () => clearImitationSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    setLaugh(false);
    speakImitation('The monster will show a mouth — you copy!');
  }, [session.round, canPlay]);

  const onHit = useCallback(
    (_pose: MouthPose) => {
      const next = hits + 1;
      setHits(next);
      setLaugh(true);
      setTimeout(() => setLaugh(false), 700);
      session.manager.recordAttempt(_pose);
      if (next >= IMITATION_CYCLES_PER_ROUND) {
        speakImitation('The monster laughs! You did great!');
        setTimeout(() => session.completeRound(), 1000);
      } else {
        speakImitation('Ha ha! Silly mouth!');
      }
    },
    [hits, session],
  );

  return (
    <>
      <ImitationGameFrame
        title="Funny Monster Mouth"
        subtitle="Copy silly monster mouths"
        skills="👾 Big shapes • 😝 Playful • 💚 No fail"
        gradient={['#ECFDF5', '#D1FAE5']}
        accent="#059669"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        startEmoji="👾"
        startTitle="Silly monster mouths"
      >
        {(imitation) => (
          <MonsterPlay
            imitation={imitation}
            canPlay={canPlay}
            hits={hits}
            laugh={laugh}
            roundKey={session.round}
            onHit={onHit}
          />
        )}
      </ImitationGameFrame>
      <ImitationGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

function MonsterPlay({
  imitation,
  canPlay,
  hits,
  laugh,
  roundKey,
  onHit,
}: {
  imitation: ImitationSense;
  canPlay: boolean;
  hits: number;
  laugh: boolean;
  roundKey: number;
  onHit: (pose: MouthPose) => void;
}) {
  const { handleGoodTry } = useImitationRoundLoop({
    imitation,
    canPlay,
    poses: POSES,
    hits,
    onHit,
    roundKey,
  });

  return (
    <View style={styles.center}>
      <Text style={styles.monster}>{laugh ? '👾😂' : '👾'}</Text>
      <MouthFaceDisplay
        characterEmoji="👾"
        pose={imitation.imitationPrompt}
        sparkle={laugh}
        helper={imitation.showHelper}
      />
      <Text style={styles.hint}>
        {imitation.state === 'SHOWING_ANIMATION' ? 'Look at the big mouth!' : 'Copy the monster!'}
      </Text>
      <ImitationActionButtons accent="#059669" imitation={imitation} onGoodTry={handleGoodTry} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  monster: { fontSize: 48, textAlign: 'center', marginBottom: 4 },
  hint: { fontSize: 16, fontWeight: '700', color: '#047857', textAlign: 'center', marginBottom: 12 },
});
