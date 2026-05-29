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

function RobotPlay({
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
  const [celebrate, setCelebrate] = useState(false);
  const power = sense.soundActive ? sense.sustainGlow : 0.1;

  useStabilityInteraction(sense, active, hits, setHits, manager, onRoundComplete);

  useEffect(() => {
    if (hits > 0) {
      setCelebrate(true);
      const t = setTimeout(() => setCelebrate(false), 1300);
      return () => clearTimeout(t);
    }
  }, [hits]);

  return (
    <View style={styles.stage}>
      <Text style={[styles.robot, { opacity: 0.5 + power * 0.5 }]}>🤖</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${Math.round(power * 100)}%` }]} />
      </View>
      <Text style={styles.hint}>
        {sense.soundActive ? 'Robot powering up!' : 'Make sound to charge the robot'}
      </Text>
      {celebrate && <Text style={styles.celebrate}>Robot celebration!</Text>}
    </View>
  );
}

export function RobotPowerVoiceGame({ onBack, onComplete }: Props) {
  const session = useSoundStabilitySession('robot-power-voice', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakSoundStability('Robot power voice! Hold a steady hum — the robot glows with you!');
  }, [canPlay, session.round]);

  return (
    <>
      <SoundStabilityFrame
        title="Robot Power Voice"
        subtitle="Vocal consistency"
        skills="🤖 Power hold • ⚡ Stable effort"
        gradient={['#EEF2FF', '#F1F5F9']}
        accent="#4F46E5"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        progressLabel="power-ups"
      >
        {(sense) => (
          <RobotPlay
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
  robot: { fontSize: 96 },
  barTrack: {
    marginTop: 16,
    width: '80%',
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: '#6366F1' },
  hint: { marginTop: 12, fontSize: 16, fontWeight: '800', color: '#4338CA' },
  celebrate: { marginTop: 14, fontSize: 20, fontWeight: '900', color: '#4F46E5' },
});
