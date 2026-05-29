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
import type { SpeechReadinessCompletionSessionManager } from '@/components/game/speech/speech-readiness-completion/modules/SpeechReadinessCompletionSessionManager';
import type { SpeechReadinessCompletionSense } from '@/hooks/useSpeechReadinessCompletion';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

function CelebrationPlay({
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
  const [sparkle, setSparkle] = useState(0);
  const { mouth, target } = useReadinessInteraction(
    sense,
    active,
    hits,
    setHits,
    manager,
    onRoundComplete,
    'smile',
  );

  useEffect(() => {
    if (hits > 0) setSparkle((s) => s + 1);
  }, [hits]);

  return (
    <View style={styles.stage}>
      <Level6CameraLayer sense={mouth} active={active} />
      <Level6MirrorPreview sense={mouth} active={active} />
      <Level6StatusPill sense={mouth} target={target} accent="#EA580C" />
      <Text style={styles.speaker}>🎤</Text>
      <Text style={styles.cheer}>You are a little speaker!</Text>
      <Text style={styles.stars}>{'⭐'.repeat(Math.min(5, sparkle + 1))}</Text>
      <Text style={styles.hint}>Any try makes the character happy — no fail!</Text>
      {sense.rewardState !== 'NONE' && (
        <Text style={styles.party}>🎉 Speaker party animation!</Text>
      )}
    </View>
  );
}

export function LittleSpeakerCelebrationGame({ onBack, onComplete }: Props) {
  const session = useSpeechReadinessSession('little-speaker-celebration', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakSpeechReadiness('Little speaker celebration! Every sound and smile try is wonderful!');
  }, [canPlay, session.round]);

  return (
    <>
      <SpeechReadinessFrame
        title="Little Speaker Celebration"
        subtitle="Celebrate speech confidence"
        skills="🎤 High encouragement • ⭐ No fail"
        gradient={['#FFF7ED', '#FEF3C7']}
        accent="#EA580C"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        progressLabel="celebrations"
      >
        {(sense) => (
          <CelebrationPlay
            sense={sense}
            active={canPlay && !session.gameFinished}
            hits={hits}
            setHits={setHits}
            manager={session.manager}
            onRoundComplete={session.completeRound}
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
  speaker: { fontSize: 88 },
  cheer: { fontSize: 22, fontWeight: '900', color: '#C2410C', marginTop: 10 },
  stars: { fontSize: 28, marginVertical: 10 },
  hint: { fontSize: 15, color: '#9A3412', textAlign: 'center', paddingHorizontal: 20 },
  party: { fontSize: 18, fontWeight: '900', color: '#EA580C', marginTop: 12 },
});
