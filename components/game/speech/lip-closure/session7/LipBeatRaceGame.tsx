import {
  BilabialGameOverlays,
  BilabialGameShell,
  BilabialProgressBar,
  DEFAULT_BILABIAL_ROUNDS,
  clearBilabialSpeech,
  speakBilabial,
  useBilabialGameSession,
  useBilabialSense,
  useBilabialSuccessWatcher,
} from '@/components/game/speech/lip-closure/shared/bilabialPrepShared';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const STEPS_PER_ROUND = 5;

export function LipBeatRaceGame({ onBack, onComplete }: Props) {
  const session = useBilabialGameSession('lip-beat-race', DEFAULT_BILABIAL_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const prep = useBilabialSense(canPlay, session.manager.engine);
  const [steps, setSteps] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    speakBilabial('Lip Beat Race! Move with rhythmic bursts. Go at your own pace!');
    return () => clearBilabialSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setSteps(0);
    setFinished(false);
    session.manager.startRound();
    speakBilabial('Race to the finish — one burst at a time!');
  }, [session.round, canPlay]);

  const onSuccess = useCallback(
    async (timingMs: number) => {
      const next = steps + 1;
      setSteps(next);
      await session.manager.recordSuccess(timingMs);
      if (next >= STEPS_PER_ROUND) {
        setFinished(true);
        speakBilabial('Finish line! You did it!');
        setTimeout(() => session.completeRound(), 1200);
      } else {
        session.manager.engine.startSession();
      }
    },
    [steps, session],
  );

  useBilabialSuccessWatcher(prep, session.manager.engine, canPlay && !finished && steps < STEPS_PER_ROUND, onSuccess, steps);

  return (
    <>
      <BilabialGameShell
        title="Lip Beat Race"
        subtitle="Rhythmic bursts move you forward"
        skills="🏁 Rhythm • 👄 Bilabial prep"
        gradient={['#EDE9FE', '#DDD6FE']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        prep={prep}
      >
        <View style={styles.race}>
          <Text style={styles.flag}>🏁</Text>
          <View style={styles.lane}>
            <Text style={[styles.runner, { marginLeft: `${Math.min(70, steps * 14)}%` }]}>
              {finished ? '🦸✨' : '🏃'}
            </Text>
          </View>
          <BilabialProgressBar progress={steps / STEPS_PER_ROUND} accent="#7C3AED" />
          <Text style={styles.steps}>{steps} / {STEPS_PER_ROUND} beats</Text>
        </View>
      </BilabialGameShell>
      <BilabialGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  race: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  flag: { fontSize: 36, alignSelf: 'flex-end', marginBottom: 8 },
  lane: {
    height: 72,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    marginBottom: 16,
  },
  runner: { fontSize: 48 },
  steps: { marginTop: 8, textAlign: 'center', fontWeight: '800', color: '#5B21B6', fontSize: 16 },
});
