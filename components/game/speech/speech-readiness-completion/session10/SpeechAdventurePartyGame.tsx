import {
  SpeechReadinessFrame,
  SpeechReadinessOverlays,
  speakSpeechReadiness,
  useSpeechReadinessSession,
} from '@/components/game/speech/speech-readiness-completion/shared/speechReadinessCompletionShared';
import {
  Level6CameraLayer,
  Level6MirrorPreview,
  Level6StatusPill,
  useReadinessInteraction,
} from '@/components/game/speech/speech-readiness-completion/session10/useReadinessInteraction';
import type { Level6Target } from '@/hooks/useLevel6MouthTarget';
import type { SpeechReadinessCompletionSessionManager } from '@/components/game/speech/speech-readiness-completion/modules/SpeechReadinessCompletionSessionManager';
import type { SpeechReadinessCompletionSense } from '@/hooks/useSpeechReadinessCompletion';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const PARTY_STEPS = ['Copy mouth 👄', 'Make a sound 🎵', 'Party cheer 🎉'] as const;
const PARTY_TARGETS: Level6Target[] = ['open', 'aaa', 'smile'];

function PartyPlay({
  sense,
  active,
  hits,
  setHits,
  manager,
  onRoundComplete,
}: {
  sense: SpeechReadinessCompletionSense;
  active: boolean;
  hits: number;
  setHits: React.Dispatch<React.SetStateAction<number>>;
  manager: SpeechReadinessCompletionSessionManager;
  onRoundComplete: () => void;
}) {
  const [party, setParty] = useState(false);
  const step = PARTY_STEPS[Math.min(hits, PARTY_STEPS.length - 1)] ?? PARTY_STEPS[0];
  const target = PARTY_TARGETS[hits % PARTY_TARGETS.length] ?? 'face_present';
  const { mouth } = useReadinessInteraction(sense, active, hits, setHits, manager, onRoundComplete, target);

  useEffect(() => {
    if (hits > 0) {
      setParty(true);
      const t = setTimeout(() => setParty(false), 1400);
      return () => clearTimeout(t);
    }
  }, [hits]);

  return (
    <View style={styles.stage}>
      <Level6CameraLayer sense={mouth} active={active} />
      <Level6MirrorPreview sense={mouth} active={active} />
      <Level6StatusPill sense={mouth} target={target} accent="#DB2777" />
      <Text style={styles.host}>🎈</Text>
      <Text style={styles.step}>{step}</Text>
      <Text style={styles.hint}>Mouth, sound, or rhythm — all join the party!</Text>
      {party && <Text style={styles.celebrate}>🎊 Celebration party!</Text>}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${Math.round(sense.sequenceProgress * 100)}%` }]} />
      </View>
    </View>
  );
}

export function SpeechAdventurePartyGame({ onBack, onComplete }: Props) {
  const session = useSpeechReadinessSession('speech-adventure-party', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakSpeechReadiness('Speech adventure party! Copy, sound, and play — every try counts!');
  }, [canPlay, session.round]);

  const onRoundComplete = useCallback(() => session.completeRound(), [session]);

  return (
    <>
      <SpeechReadinessFrame
        title="Speech Adventure Party"
        subtitle="Integrate speech readiness"
        skills="🎈 Mouth • 🎵 Sound • 🥁 Play"
        gradient={['#FEF3C7', '#FCE7F3']}
        accent="#DB2777"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        progressLabel="party steps"
      >
        {(sense) => (
          <PartyPlay
            sense={sense}
            active={canPlay && !session.gameFinished}
            hits={hits}
            setHits={setHits}
            manager={session.manager}
            onRoundComplete={onRoundComplete}
          />
        )}
      </SpeechReadinessFrame>
      <SpeechReadinessOverlays
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
  host: { fontSize: 88 },
  step: { fontSize: 20, fontWeight: '900', color: '#9D174D', marginTop: 12 },
  hint: { fontSize: 15, color: '#831843', marginTop: 8, textAlign: 'center', paddingHorizontal: 16 },
  celebrate: { fontSize: 22, fontWeight: '900', color: '#DB2777', marginTop: 16 },
  progressBar: {
    marginTop: 20,
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#DB2777' },
});
