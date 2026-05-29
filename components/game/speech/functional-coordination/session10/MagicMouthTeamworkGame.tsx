import {
  FunctionalCoordinationShell,
  FunctionalOverlays,
  speakFunctional,
  useFunctionalHits,
  useFunctionalSession,
} from '@/components/game/speech/functional-coordination/shared/functionalCoordinationShared';
import { MAGIC_TEAMWORK_CUES } from '@/components/game/speech/functional-coordination/session10/functionalCoordinationCues';
import { useFunctionalCoordination } from '@/hooks/useFunctionalCoordination';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function MagicMouthTeamworkGame({ onBack, onComplete }: Props) {
  const session = useFunctionalSession('magic-mouth-teamwork', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useFunctionalCoordination(canPlay, 'magic-mouth-teamwork', session.round);
  const cue = useMemo(() => MAGIC_TEAMWORK_CUES[hits % MAGIC_TEAMWORK_CUES.length] ?? MAGIC_TEAMWORK_CUES[0], [hits]);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakFunctional('Magic mouth teamwork. Watch, prepare, and copy. Every try counts.');
  }, [canPlay, session.round]);

  useFunctionalHits({ canPlay, sense, hits, setHits, manager: session.manager, onRoundComplete: session.completeRound });

  return (
    <>
      <FunctionalCoordinationShell
        title="Magic Mouth Teamwork"
        subtitle="Oral systems integration"
        skills="✨ Open, round, blow, smile"
        gradient={['#E0F2FE', '#F5F3FF']}
        accent="#0284C7"
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
          <Text style={styles.emoji}>{cue.emoji}</Text>
          <Text style={styles.label}>{cue.label}</Text>
          <Pressable style={styles.btn} onPress={sense.coordinate}>
            <Text style={styles.btnText}>Team try! ✨</Text>
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
  label: { marginTop: 8, fontSize: 18, fontWeight: '900', color: '#075985', textAlign: 'center' },
  btn: { marginTop: 14, backgroundColor: '#0284C7', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
