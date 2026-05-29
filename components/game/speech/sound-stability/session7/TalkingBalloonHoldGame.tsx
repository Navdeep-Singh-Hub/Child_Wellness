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

function BalloonPlay({
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
  const [float, setFloat] = useState(false);
  const scale = 0.7 + (sense.soundActive ? sense.sustainGlow : 0.2) * 0.8;

  useStabilityInteraction(sense, active, hits, setHits, manager, onRoundComplete);

  useEffect(() => {
    if (hits > 0) {
      setFloat(true);
      const t = setTimeout(() => setFloat(false), 1500);
      return () => clearTimeout(t);
    }
  }, [hits]);

  return (
    <View style={styles.stage}>
      <Text style={[styles.balloon, { transform: [{ scale }] }]}>🎈</Text>
      <Text style={styles.hint}>
        {sense.soundActive ? 'Balloon grows with your sound!' : 'Sound inflates the balloon'}
      </Text>
      <Text style={styles.ok}>Stopping is okay — every try counts</Text>
      {float && <Text style={styles.float}>Balloon floats happily!</Text>}
    </View>
  );
}

export function TalkingBalloonHoldGame({ onBack, onComplete }: Props) {
  const session = useSoundStabilitySession('talking-balloon-hold', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakSoundStability('Talking balloon! Hold a sound to blow it up — mmm or ooo works!');
  }, [canPlay, session.round]);

  return (
    <>
      <SoundStabilityFrame
        title="Talking Balloon Hold"
        subtitle="Stable vocal effort"
        skills="🎈 Balloon hold • 🗣️ Sustained try"
        gradient={['#FEF3C7', '#FFE4E6']}
        accent="#E11D48"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        progressLabel="balloon holds"
      >
        {(sense) => (
          <BalloonPlay
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
  stage: { minHeight: 300, alignItems: 'center', justifyContent: 'center' },
  balloon: { fontSize: 100 },
  hint: { marginTop: 16, fontSize: 17, fontWeight: '800', color: '#9F1239', textAlign: 'center' },
  ok: { marginTop: 8, fontSize: 14, color: '#881337' },
  float: { marginTop: 14, fontSize: 20, fontWeight: '900', color: '#E11D48' },
});
