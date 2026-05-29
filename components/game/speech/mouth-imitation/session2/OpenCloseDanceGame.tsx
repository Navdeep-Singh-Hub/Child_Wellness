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

const POSES: MouthPose[] = ['open', 'close', 'open'];

export function OpenCloseDanceGame({ onBack, onComplete }: Props) {
  const session = useImitationGameSession('open-close-dance', DEFAULT_IMITATION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const [danceStars, setDanceStars] = useState(0);

  useEffect(() => {
    speakImitation('Open Close Dance! Slow mouth dance with music.');
    return () => clearImitationSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    setDanceStars(0);
    speakImitation('Dance your mouth open and closed — very slow!');
  }, [session.round, canPlay]);

  const onHit = useCallback(
    (pose: MouthPose) => {
      const next = hits + 1;
      setHits(next);
      setDanceStars((d) => d + 1);
      session.manager.recordAttempt(pose);
      if (next >= IMITATION_CYCLES_PER_ROUND) {
        speakImitation('Dance stars for you! Wonderful rhythm!');
        setTimeout(() => session.completeRound(), 1000);
      } else {
        speakImitation('Nice dance move!');
      }
    },
    [hits, session],
  );

  return (
    <>
      <ImitationGameFrame
        title="Open–Close Dance"
        subtitle="Slow rhythmic mouth dance"
        skills="🎵 Slow tempo • 💃 Open-close • ⭐ Dance stars"
        gradient={['#FDF2F8', '#FCE7F3']}
        accent="#DB2777"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        startEmoji="💃"
        startTitle="Mouth open-close dance"
      >
        {(imitation) => (
          <DancePlay
            imitation={imitation}
            canPlay={canPlay}
            hits={hits}
            danceStars={danceStars}
            roundKey={session.round}
            onHit={onHit}
          />
        )}
      </ImitationGameFrame>
      <ImitationGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

function DancePlay({
  imitation,
  canPlay,
  hits,
  danceStars,
  roundKey,
  onHit,
}: {
  imitation: ImitationSense;
  canPlay: boolean;
  hits: number;
  danceStars: number;
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

  const beat = imitation.state === 'SHOWING_ANIMATION' ? '🎵' : '🎶';

  return (
    <View style={styles.center}>
      <Text style={styles.music}>{beat} 💃 {beat}</Text>
      <Text style={styles.danceStars}>{'✨'.repeat(Math.min(danceStars, 3))}</Text>
      <MouthFaceDisplay
        characterEmoji="🕺"
        pose={imitation.imitationPrompt}
        sparkle={imitation.state === 'REWARDING'}
        helper={imitation.showHelper}
      />
      <Text style={styles.hint}>Slow open… slow close… copy the dance!</Text>
      <ImitationActionButtons accent="#DB2777" imitation={imitation} onGoodTry={handleGoodTry} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  music: { fontSize: 22, textAlign: 'center', marginBottom: 4 },
  danceStars: { fontSize: 24, textAlign: 'center', minHeight: 32 },
  hint: { fontSize: 16, fontWeight: '700', color: '#9D174D', textAlign: 'center', marginBottom: 12 },
});
