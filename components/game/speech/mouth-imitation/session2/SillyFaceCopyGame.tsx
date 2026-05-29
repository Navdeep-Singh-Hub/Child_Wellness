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

const POSES: MouthPose[] = ['open', 'smile', 'funny'];

export function SillyFaceCopyGame({ onBack, onComplete }: Props) {
  const session = useImitationGameSession('silly-face-copy', DEFAULT_IMITATION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    speakImitation('Silly Face Copy! Fun mouth moves at the end.');
    return () => clearImitationSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    setConfetti(false);
    speakImitation('Watch the silly face, then copy!');
  }, [session.round, canPlay]);

  const onHit = useCallback(
    (pose: MouthPose) => {
      const next = hits + 1;
      setHits(next);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 800);
      session.manager.recordAttempt(pose);
      if (next >= IMITATION_CYCLES_PER_ROUND) {
        speakImitation('Confetti celebration! You copied the silly faces!');
        setTimeout(() => session.completeRound(), 1100);
      } else {
        speakImitation('Silly and wonderful!');
      }
    },
    [hits, session],
  );

  return (
    <>
      <ImitationGameFrame
        title="Silly Face Copy"
        subtitle="Open, smile, and silly mouth fun"
        skills="🎉 Playful • 😝 Silly mouths • 🌈 Celebration"
        gradient={['#FFFBEB', '#FEF3C7']}
        accent="#D97706"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        startEmoji="🎉"
        startTitle="Silly face copy"
      >
        {(imitation) => (
          <SillyPlay
            imitation={imitation}
            canPlay={canPlay}
            hits={hits}
            confetti={confetti}
            roundKey={session.round}
            onHit={onHit}
          />
        )}
      </ImitationGameFrame>
      <ImitationGameOverlays
        {...session}
        onBack={onBack}
        onComplete={onComplete}
        message="Silly face champion!"
      />
    </>
  );
}

function SillyPlay({
  imitation,
  canPlay,
  hits,
  confetti,
  roundKey,
  onHit,
}: {
  imitation: ImitationSense;
  canPlay: boolean;
  hits: number;
  confetti: boolean;
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
      {confetti && <Text style={styles.confetti}>🎊🌈🎊</Text>}
      <MouthFaceDisplay
        characterEmoji="🤪"
        pose={imitation.imitationPrompt}
        sparkle={confetti}
        helper={imitation.showHelper}
      />
      <Text style={styles.hint}>
        {imitation.state === 'SHOWING_ANIMATION' ? 'Watch the silly mouth!' : 'Copy the silly face!'}
      </Text>
      <ImitationActionButtons accent="#D97706" imitation={imitation} onGoodTry={handleGoodTry} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  confetti: { fontSize: 32, textAlign: 'center', marginBottom: 8 },
  hint: { fontSize: 16, fontWeight: '700', color: '#B45309', textAlign: 'center', marginBottom: 12 },
});
