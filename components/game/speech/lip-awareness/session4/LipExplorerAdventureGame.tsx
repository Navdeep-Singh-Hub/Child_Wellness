import type { LipPose } from '@/components/game/speech/lip-awareness/modules/lipAwarenessTypes';
import {
  DEFAULT_LIP_ROUNDS,
  LIP_INTERACTIONS_PER_ROUND,
  LipAwarenessGameFrame,
  LipFaceDisplay,
  LipGameOverlays,
  LipGoodTryButtons,
  LipTapTarget,
  clearLipSpeech,
  hapticLipSuccess,
  speakLip,
  useLipAwarenessGameSession,
} from '@/components/game/speech/lip-awareness/shared/lipAwarenessShared';
import type { LipAwarenessSense } from '@/hooks/useLipAwareness';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type Step = 'tap' | 'copy' | 'watch';

const WATCH_POSES: LipPose[] = ['smile-big', 'funny', 'closed'];

export function LipExplorerAdventureGame({ onBack, onComplete }: Props) {
  const session = useLipAwarenessGameSession('lip-explorer-adventure', DEFAULT_LIP_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    speakLip('Lip Explorer Adventure! Tap, copy, and watch lips move.');
    return () => clearLipSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    speakLip('Step one: tap the treasure lips!');
  }, [session.round, canPlay]);

  const onStepDone = useCallback(
    (step: Step) => {
      const next = hits + 1;
      setHits(next);
      session.manager.recordInteraction(step);
      hapticLipSuccess();
      if (next >= LIP_INTERACTIONS_PER_ROUND) {
        speakLip('Treasure celebration! You explored your lips!');
        setTimeout(() => session.completeRound(), 1100);
      } else if (next === 1) {
        speakLip('Now copy the funny lips!');
      } else if (next === 2) {
        speakLip('Watch the lips move slowly!');
      }
    },
    [hits, session],
  );

  return (
    <>
      <LipAwarenessGameFrame
        title="Lip Explorer Adventure"
        subtitle="Tap · copy · watch — treasure fun"
        skills="🗺️ Explore • 👄 Lips • 🎁 Treasure"
        gradient={['#FFFBEB', '#FEF3C7']}
        accent="#B45309"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        startEmoji="🗺️"
      >
        {(lip) => (
          <ExplorerPlay
            lip={lip}
            canPlay={canPlay}
            hits={hits}
            roundKey={session.round}
            onStepDone={onStepDone}
          />
        )}
      </LipAwarenessGameFrame>
      <LipGameOverlays
        {...session}
        onBack={onBack}
        onComplete={onComplete}
        message="Lip explorer treasure!"
      />
    </>
  );
}

function ExplorerPlay({
  lip,
  canPlay,
  hits,
  roundKey,
  onStepDone,
}: {
  lip: LipAwarenessSense;
  canPlay: boolean;
  hits: number;
  roundKey: number;
  onStepDone: (step: Step) => void;
}) {
  const step: Step = hits === 0 ? 'tap' : hits === 1 ? 'copy' : 'watch';
  const [watchFrame, setWatchFrame] = useState(0);
  const [treasure, setTreasure] = useState(false);

  useEffect(() => {
    if (!canPlay) return;
    if (step === 'copy') {
      lip.engine.reset();
      lip.startPrompt('funny');
      speakLip('Copy the funny lips!');
    }
  }, [canPlay, roundKey, step]);

  useEffect(() => {
    if (step !== 'watch' || !canPlay) return;
    speakLip('Watch the lips change…');
    const id = setInterval(() => setWatchFrame((f) => (f + 1) % WATCH_POSES.length), 1400);
    return () => clearInterval(id);
  }, [step, canPlay]);

  const handleTap = () => {
    lip.registerTap();
    onStepDone('tap');
  };

  const handleCopy = () => {
    if (lip.state !== 'WAITING_FOR_INTERACTION' && lip.state !== 'HELPING') return;
    lip.confirmInteraction();
    onStepDone('copy');
  };

  const handleWatchDone = () => {
    setTreasure(true);
    onStepDone('watch');
  };

  if (step === 'tap') {
    return (
      <View style={styles.center}>
        <Text style={styles.map}>🗺️ Step 1</Text>
        <LipTapTarget accent="#B45309" label="Tap treasure lips!" onTap={handleTap} />
      </View>
    );
  }

  if (step === 'copy') {
    return (
      <View style={styles.center}>
        <Text style={styles.map}>🗺️ Step 2 — Copy</Text>
        <LipFaceDisplay pose={lip.lipPrompt} helper={lip.showHelper} lipOnly />
        <LipGoodTryButtons accent="#B45309" lip={lip} onGoodTry={handleCopy} />
      </View>
    );
  }

  const watchPose = WATCH_POSES[watchFrame] ?? 'smile-big';

  return (
    <View style={styles.center}>
      <Text style={styles.map}>🗺️ Step 3 — Watch</Text>
      <LipFaceDisplay pose={watchPose} lipOnly />
      <Text style={styles.hint}>Lips are moving slowly…</Text>
      <Pressable style={styles.watchBtn} onPress={handleWatchDone}>
        <Text style={styles.watchBtnText}>{treasure ? '🎁✨' : 'I watched! 👀'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  map: { fontSize: 22, fontWeight: '900', color: '#92400E', marginBottom: 12 },
  hint: { fontSize: 16, fontWeight: '700', color: '#B45309', marginVertical: 12 },
  watchBtn: {
    backgroundColor: '#D97706',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  watchBtnText: { color: '#fff', fontWeight: '900', fontSize: 18 },
});
