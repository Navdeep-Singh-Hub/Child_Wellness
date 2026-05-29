import type { FacePose } from '@/components/game/speech/facial-imitation/modules/facialImitationTypes';
import {
  DEFAULT_FACE_ROUNDS,
  FACE_INTERACTIONS_PER_ROUND,
  FaceDisplay,
  FaceGameOverlays,
  FaceGoodTryButtons,
  FaceTapReward,
  FacialImitationGameFrame,
  clearFaceSpeech,
  hapticFaceSuccess,
  speakFace,
  useFacialGameSession,
} from '@/components/game/speech/facial-imitation/shared/facialImitationShared';
import type { FacialImitationSense } from '@/hooks/useFacialImitation';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type Step = 'watch' | 'copy' | 'tap';

const WATCH_POSES: FacePose[] = ['smile-big', 'open', 'funny'];

export function FaceAdventureCopyGame({ onBack, onComplete }: Props) {
  const session = useFacialGameSession('face-adventure-copy', DEFAULT_FACE_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    speakFace('Face Adventure! Watch, copy, then tap the star!');
    return () => clearFaceSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    speakFace('Step one: watch the face!');
  }, [session.round, canPlay]);

  const onStepDone = useCallback(
    (step: Step) => {
      const next = hits + 1;
      setHits(next);
      session.manager.recordInteraction(step);
      hapticFaceSuccess();
      if (next >= FACE_INTERACTIONS_PER_ROUND) {
        speakFace('Treasure celebration! You copied faces!');
        setTimeout(() => session.completeRound(), 1100);
      } else if (next === 1) {
        speakFace('Now copy the face!');
      } else if (next === 2) {
        speakFace('Tap the sparkly star!');
      }
    },
    [hits, session],
  );

  return (
    <>
      <FacialImitationGameFrame
        title="Face Adventure Copy"
        subtitle="Watch · copy · tap treasure"
        skills="👀 Watch • 😊 Copy • 🎁 Reward"
        gradient={['#F0FDF4', '#DCFCE7']}
        accent="#16A34A"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        startEmoji="🗺️"
      >
        {(face) => (
          <AdventurePlay
            face={face}
            canPlay={canPlay}
            hits={hits}
            roundKey={session.round}
            onStepDone={onStepDone}
          />
        )}
      </FacialImitationGameFrame>
      <FaceGameOverlays
        {...session}
        onBack={onBack}
        onComplete={onComplete}
        message="Face adventure champion!"
      />
    </>
  );
}

function AdventurePlay({
  face,
  canPlay,
  hits,
  roundKey,
  onStepDone,
}: {
  face: FacialImitationSense;
  canPlay: boolean;
  hits: number;
  roundKey: number;
  onStepDone: (step: Step) => void;
}) {
  const step: Step = hits === 0 ? 'watch' : hits === 1 ? 'copy' : 'tap';
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    if (step === 'copy') {
      face.engine.reset();
      face.startPrompt('smile-big');
      speakFace('Copy the smile face!');
    }
  }, [canPlay, roundKey, step]);

  useEffect(() => {
    if (step !== 'watch' || !canPlay) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % WATCH_POSES.length), 1500);
    return () => clearInterval(id);
  }, [step, canPlay]);

  if (step === 'watch') {
    return (
      <View style={styles.center}>
        <Text style={styles.map}>🗺️ Step 1 — Watch</Text>
        <FaceDisplay pose={WATCH_POSES[frame] ?? 'smile-big'} large />
        <Pressable style={styles.btn} onPress={() => onStepDone('watch')}>
          <Text style={styles.btnText}>I watched! 👀</Text>
        </Pressable>
      </View>
    );
  }

  if (step === 'copy') {
    return (
      <View style={styles.center}>
        <Text style={styles.map}>🗺️ Step 2 — Copy</Text>
        <FaceDisplay pose={face.facePrompt} helper={face.showHelper} large />
        <FaceGoodTryButtons
          accent="#16A34A"
          face={face}
          onGoodTry={() => {
            if (face.state !== 'WAITING_FOR_IMITATION' && face.state !== 'HELPING') return;
            face.confirmImitation();
            onStepDone('copy');
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Text style={styles.map}>🗺️ Step 3 — Tap</Text>
      <FaceTapReward accent="#16A34A" emoji="⭐" label="Tap the star!" onTap={() => onStepDone('tap')} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  map: { fontSize: 22, fontWeight: '900', color: '#15803D', marginBottom: 12 },
  btn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 16,
  },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 18 },
});
