import {
  FunctionalCoordinationShell,
  FunctionalOverlays,
  speakFunctional,
  useFunctionalHits,
  useFunctionalSession,
} from '@/components/game/speech/functional-coordination/shared/functionalCoordinationShared';
import { RHYTHM_QUEST_CUES } from '@/components/game/speech/functional-coordination/session10/functionalCoordinationCues';
import { useFunctionalCoordination } from '@/hooks/useFunctionalCoordination';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function TalkingRhythmQuestGame({ onBack, onComplete }: Props) {
  const session = useFunctionalSession('talking-rhythm-quest', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useFunctionalCoordination(canPlay, 'talking-rhythm-quest', session.round);
  const cue = RHYTHM_QUEST_CUES[0];

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakFunctional('Talking rhythm quest. Movement, pause, movement. Slow and steady.');
  }, [canPlay, session.round]);

  useFunctionalHits({ canPlay, sense, hits, setHits, manager: session.manager, onRoundComplete: session.completeRound });

  return (
    <>
      <FunctionalCoordinationShell
        title="Talking Rhythm Quest"
        subtitle="Timing and coordination"
        skills="🥁 Move, pause, move with airflow"
        gradient={['#FEFCE8', '#E0F2FE']}
        accent="#CA8A04"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`${cue.label} — ${sense.currentStepLabel}`}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={styles.emoji}>🥁</Text>
          <Text style={styles.label}>{cue.label}</Text>
          <Pressable style={styles.btn} onPress={sense.coordinate}>
            <Text style={styles.btnText}>Rhythm try! 🥁</Text>
          </Pressable>
        </View>
      </FunctionalCoordinationShell>
      <FunctionalOverlays
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
  stage: { minHeight: 320, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 62 },
  label: { marginTop: 8, fontSize: 18, fontWeight: '900', color: '#713F12', textAlign: 'center' },
  btn: { marginTop: 14, backgroundColor: '#CA8A04', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
