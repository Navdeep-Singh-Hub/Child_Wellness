import type { JawPose } from '@/components/game/speech/jaw-awareness/modules/jawAwarenessTypes';
import {
  DEFAULT_JAW_ROUNDS,
  JAW_INTERACTIONS_PER_ROUND,
  JawAwarenessGameFrame,
  JawGameOverlays,
  JawGoodTryButtons,
  JawMouthDisplay,
  clearJawSpeech,
  hapticJawSuccess,
  speakJaw,
  useJawAwarenessGameSession,
} from '@/components/game/speech/jaw-awareness/shared/jawAwarenessShared';
import type { JawAwarenessSense } from '@/hooks/useJawAwareness';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type Step = 'watch' | 'open' | 'close';

const WATCH_POSES: JawPose[] = ['open', 'close', 'yawn'];

export function FunnyJawAdventureGame({ onBack, onComplete }: Props) {
  const session = useJawAwarenessGameSession('funny-jaw-adventure', DEFAULT_JAW_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    speakJaw('Funny Jaw Adventure! Watch, open, and close!');
    return () => clearJawSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    speakJaw('Step one: watch the mouth move!');
  }, [session.round, canPlay]);

  const onStepDone = useCallback(
    (step: Step) => {
      const next = hits + 1;
      setHits(next);
      session.manager.recordInteraction(step);
      hapticJawSuccess();
      if (next >= JAW_INTERACTIONS_PER_ROUND) {
        speakJaw('Treasure! You explored your jaw!');
        setTimeout(() => session.completeRound(), 1100);
      } else if (next === 1) {
        speakJaw('Now copy opening your mouth!');
      } else if (next === 2) {
        speakJaw('Now copy closing gently!');
      }
    },
    [hits, session],
  );

  return (
    <>
      <JawAwarenessGameFrame
        title="Funny Jaw Adventure"
        subtitle="Watch · open · close — treasure!"
        skills="🗺️ Explore • 😮 Open • 😌 Close"
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
        {(jaw) => (
          <AdventurePlay
            jaw={jaw}
            canPlay={canPlay}
            hits={hits}
            roundKey={session.round}
            onStepDone={onStepDone}
          />
        )}
      </JawAwarenessGameFrame>
      <JawGameOverlays
        {...session}
        onBack={onBack}
        onComplete={onComplete}
        message="Jaw adventure treasure!"
      />
    </>
  );
}

function AdventurePlay({
  jaw,
  canPlay,
  hits,
  roundKey,
  onStepDone,
}: {
  jaw: JawAwarenessSense;
  canPlay: boolean;
  hits: number;
  roundKey: number;
  onStepDone: (step: Step) => void;
}) {
  const step: Step = hits === 0 ? 'watch' : hits === 1 ? 'open' : 'close';
  const [frame, setFrame] = useState(0);
  const [treasure, setTreasure] = useState(false);

  useEffect(() => {
    if (!canPlay) return;
    if (step === 'open') {
      jaw.engine.reset();
      jaw.startPrompt('open');
      speakJaw('Copy a big open mouth!');
    } else if (step === 'close') {
      jaw.startPrompt('close');
      speakJaw('Copy a gentle close!');
    }
  }, [canPlay, roundKey, step]);

  useEffect(() => {
    if (step !== 'watch' || !canPlay) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % WATCH_POSES.length), 1500);
    return () => clearInterval(id);
  }, [step, canPlay]);

  if (step === 'watch') {
    const pose = WATCH_POSES[frame] ?? 'open';
    return (
      <View style={styles.center}>
        <Text style={styles.map}>🗺️ Step 1 — Watch</Text>
        <JawMouthDisplay pose={pose} large />
        <Text style={styles.hint}>Mouth is moving slowly…</Text>
        <Pressable
          style={styles.btn}
          onPress={() => {
            setTreasure(false);
            onStepDone('watch');
          }}
        >
          <Text style={styles.btnText}>I watched! 👀</Text>
        </Pressable>
      </View>
    );
  }

  const handleCopy = () => {
    if (jaw.state !== 'WAITING_FOR_INTERACTION' && jaw.state !== 'HELPING') return;
    jaw.confirmInteraction();
    if (step === 'close') setTreasure(true);
    onStepDone(step);
  };

  return (
    <View style={styles.center}>
      <Text style={styles.map}>
        🗺️ Step {step === 'open' ? 2 : 3} — {step === 'open' ? 'Open' : 'Close'}
      </Text>
      {treasure && <Text style={styles.treasure}>🎁✨🎁</Text>}
      <JawMouthDisplay pose={jaw.jawPrompt} helper={jaw.showHelper} large />
      <JawGoodTryButtons accent="#16A34A" jaw={jaw} onGoodTry={handleCopy} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  map: { fontSize: 22, fontWeight: '900', color: '#15803D', marginBottom: 12 },
  hint: { fontSize: 16, fontWeight: '700', color: '#166534', marginVertical: 12 },
  btn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  treasure: { fontSize: 36, marginBottom: 8 },
});
