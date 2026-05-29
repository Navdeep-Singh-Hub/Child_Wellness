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

function RiverPlay({
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
  const [sparkle, setSparkle] = useState(false);
  const glow = sense.soundActive ? sense.sustainGlow : 0.15;

  useStabilityInteraction(sense, active, hits, setHits, manager, onRoundComplete);

  useEffect(() => {
    if (hits > 0) {
      setSparkle(true);
      const t = setTimeout(() => setSparkle(false), 1400);
      return () => clearTimeout(t);
    }
  }, [hits]);

  return (
    <View style={styles.stage}>
      <Text style={styles.title}>Magic Voice River</Text>
      <View style={[styles.river, { opacity: 0.45 + glow * 0.55 }]}>
        <Text style={styles.waves}>{'🌊'.repeat(Math.max(2, Math.round(glow * 6)))}</Text>
      </View>
      <Text style={styles.hint}>
        {sense.soundActive ? 'River glows while you hold sound!' : 'Make any sound — weak is okay'}
      </Text>
      {sparkle && <Text style={styles.sparkle}>✨ Magic sparkle river!</Text>}
    </View>
  );
}

export function MagicVoiceRiverGame({ onBack, onComplete }: Props) {
  const session = useSoundStabilitySession('magic-voice-river', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakSoundStability('Magic voice river! Hold a hum or aaa — the river glows with you!');
  }, [canPlay, session.round]);

  return (
    <>
      <SoundStabilityFrame
        title="Magic Voice River"
        subtitle="Sustained sound"
        skills="🌊 Sound holding • ✨ Gentle glow"
        gradient={['#E0F2FE', '#ECFEFF']}
        accent="#0284C7"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        progressLabel="river glows"
      >
        {(sense) => (
          <RiverPlay
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
  stage: { minHeight: 300, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '900', color: '#0369A1' },
  river: {
    marginTop: 16,
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.85)',
    minWidth: '85%',
    alignItems: 'center',
  },
  waves: { fontSize: 36, lineHeight: 44 },
  hint: { marginTop: 14, fontSize: 15, color: '#0C4A6E', textAlign: 'center', paddingHorizontal: 12 },
  sparkle: { marginTop: 12, fontSize: 20, fontWeight: '900', color: '#0284C7' },
});
