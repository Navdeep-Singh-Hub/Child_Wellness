import {
  SoundStabilityFrame,
  SoundStabilityOverlays,
  speakSoundStability,
  useSoundStabilitySession,
} from '@/components/game/speech/sound-stability/shared/soundStabilityShared';
import { useStabilityInteraction } from '@/components/game/speech/sound-stability/session7/useStabilityInteraction';
import type { SoundStabilitySessionManager } from '@/components/game/speech/sound-stability/modules/SoundStabilitySessionManager';
import type { SoundStabilitySense } from '@/hooks/useSoundStability';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

function TrainPlay({
  sense,
  active,
  hits,
  setHits,
  manager,
  onRoundComplete,
}: {
  sense: SoundStabilitySense;
  active: boolean;
  hits: number;
  setHits: React.Dispatch<React.SetStateAction<number>>;
  manager: SoundStabilitySessionManager;
  onRoundComplete: () => void;
}) {
  const [cheer, setCheer] = useState(false);
  const progress = sense.soundActive
    ? Math.min(1, sense.sustainGlow + hits * 0.08)
    : Math.min(1, hits * 0.2);

  useStabilityInteraction(sense, active, hits, setHits, manager, onRoundComplete);

  useEffect(() => {
    if (hits > 0) {
      setCheer(true);
      const t = setTimeout(() => setCheer(false), 1200);
      return () => clearTimeout(t);
    }
  }, [hits]);

  return (
    <View style={styles.stage}>
      <Text style={styles.track}>{'· '.repeat(8)}</Text>
      <View style={[styles.trainWrap, { paddingLeft: Math.round(progress * 200) }]}>
        <Text style={styles.train}>🚂</Text>
      </View>
      <Text style={styles.hint}>
        {sense.soundActive ? 'Train moves while you hold sound!' : 'Short sounds still move the train'}
      </Text>
      {cheer && <Text style={styles.cheer}>Train celebration!</Text>}
    </View>
  );
}

export function VoiceTrainJourneyGame({ onBack, onComplete }: Props) {
  const session = useSoundStabilitySession('voice-train-journey', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakSoundStability('Voice train journey! Keep a sound going — the train chugs along!');
  }, [canPlay, session.round]);

  return (
    <>
      <SoundStabilityFrame
        title="Voice Train Journey"
        subtitle="Sustained participation"
        skills="🚂 Train journey • 🗣️ Hold sound"
        gradient={['#DCFCE7', '#FEF9C3']}
        accent="#16A34A"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        progressLabel="journeys"
      >
        {(sense) => (
          <TrainPlay
            sense={sense}
            active={canPlay && !session.gameFinished}
            hits={hits}
            setHits={setHits}
            manager={session.manager}
            onRoundComplete={session.completeRound}
          />
        )}
      </SoundStabilityFrame>
      <SoundStabilityOverlays
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
  stage: { minHeight: 300, width: '100%', paddingHorizontal: 8 },
  track: { fontSize: 28, color: '#166534', letterSpacing: 2, marginTop: 40 },
  trainWrap: { width: '100%', marginTop: -8 },
  train: { fontSize: 56 },
  hint: { marginTop: 24, fontSize: 16, fontWeight: '800', color: '#15803D', textAlign: 'center' },
  cheer: { marginTop: 12, fontSize: 20, fontWeight: '900', color: '#16A34A', textAlign: 'center' },
});
