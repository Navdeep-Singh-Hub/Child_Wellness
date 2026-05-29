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
import { useWatchPrompt } from '@/components/game/speech/speech-readiness-completion/session10/useWatchPrompt';
import type { Level6Target } from '@/hooks/useLevel6MouthTarget';
import type { SpeechReadinessCompletionSessionManager } from '@/components/game/speech/speech-readiness-completion/modules/SpeechReadinessCompletionSessionManager';
import type { SpeechReadinessCompletionSense } from '@/hooks/useSpeechReadinessCompletion';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const MISSION_CUES: { label: string; emoji: string; line: string; target: Level6Target }[] = [
  { label: 'OOO', emoji: '⭕', line: 'Round mouth — OOO. Watch, then try!', target: 'ooo' },
  { label: 'EEE', emoji: '😁', line: 'Smile mouth — EEE. Watch, then try!', target: 'eee' },
  { label: 'AAA', emoji: '😮', line: 'Open mouth — AAA. Watch, then try!', target: 'aaa' },
  { label: 'MA', emoji: '👄', line: 'MA — lips together then open. Try playfully!', target: 'ma' },
  { label: 'PA', emoji: '💨', line: 'PA — pop your lips. Any try counts!', target: 'pa' },
];

function MissionPlay({
  sense,
  active,
  hits,
  setHits,
  manager,
  onRoundComplete,
  cueIndex,
}: {
  sense: SpeechReadinessCompletionSense;
  active: boolean;
  hits: number;
  setHits: React.Dispatch<React.SetStateAction<number>>;
  manager: SpeechReadinessCompletionSessionManager;
  onRoundComplete: () => void;
  cueIndex: number;
}) {
  const cue = MISSION_CUES[cueIndex % MISSION_CUES.length];
  const ready = useWatchPrompt(active, hits + cueIndex, cue.line, sense, 1900);
  const [magic, setMagic] = useState(false);

  const { mouth, target } = useReadinessInteraction(
    sense,
    active && ready,
    hits,
    setHits,
    manager,
    onRoundComplete,
    cue.target,
  );

  useEffect(() => {
    if (hits > 0) {
      setMagic(true);
      const t = setTimeout(() => setMagic(false), 1300);
      return () => clearTimeout(t);
    }
  }, [hits]);

  return (
    <View style={styles.stage}>
      <Level6CameraLayer sense={mouth} active={active && ready} />
      <Level6MirrorPreview sense={mouth} active={active && ready} />
      <Level6StatusPill sense={mouth} target={target} accent="#7C3AED" />
      <Text style={styles.wand}>🪄</Text>
      <Text style={styles.mouth}>{cue.emoji}</Text>
      <Text style={styles.label}>{cue.label}</Text>
      <Text style={styles.state}>
        {sense.state === 'SHOWING_PROMPT' || !ready ? 'Watch the mouth…' : 'Your mission try!'}
      </Text>
      {magic && <Text style={styles.magic}>✨ Magic celebration!</Text>}
    </View>
  );
}

export function MagicMouthMissionGame({ onBack, onComplete }: Props) {
  const session = useSpeechReadinessSession('magic-mouth-mission', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const cueIndex = useMemo(() => session.round - 1, [session.round]);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakSpeechReadiness('Magic mouth mission! OOO, EEE, AAA, MA, PA — watch and try!');
  }, [canPlay, session.round]);

  return (
    <>
      <SpeechReadinessFrame
        title="Magic Mouth Mission"
        subtitle="Speech participation confidence"
        skills="👄 OOO EEE AAA • MA PA play"
        gradient={['#F5F3FF', '#FEF9C3']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        progressLabel="missions"
      >
        {(sense) => (
          <MissionPlay
            sense={sense}
            active={canPlay && !session.gameFinished}
            hits={hits}
            setHits={setHits}
            manager={session.manager}
            onRoundComplete={session.completeRound}
            cueIndex={cueIndex}
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
  stage: { minHeight: 300, alignItems: 'center' },
  wand: { fontSize: 48 },
  mouth: { fontSize: 72, marginTop: 4 },
  label: { fontSize: 36, fontWeight: '900', color: '#5B21B6' },
  state: { fontSize: 17, fontWeight: '800', color: '#6D28D9', marginTop: 10 },
  magic: { fontSize: 20, fontWeight: '900', color: '#7C3AED', marginTop: 14 },
});
