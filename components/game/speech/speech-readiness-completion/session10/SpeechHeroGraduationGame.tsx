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
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const GRAD_STEPS = [
  'Copy mouth 👄',
  'First sound 🎵',
  'Vowel play OOO',
  'Beat tap 🥁',
  'Syllable try MA',
  'Your voice hero 🦸',
] as const;
const GRAD_TARGETS: Level6Target[] = ['open', 'aaa', 'ooo', 'pa', 'ma', 'smile'];

function GraduationPlay({
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
  const step = GRAD_STEPS[Math.min(hits, GRAD_STEPS.length - 1)] ?? GRAD_STEPS[0];
  const target = GRAD_TARGETS[Math.min(hits, GRAD_TARGETS.length - 1)] ?? 'face_present';
  const { mouth } = useReadinessInteraction(sense, active, hits, setHits, manager, onRoundComplete, target);

  return (
    <View style={styles.stage}>
      <Level6CameraLayer sense={mouth} active={active} />
      <Level6MirrorPreview sense={mouth} active={active} />
      <Level6StatusPill sense={mouth} target={target} accent="#4F46E5" />
      <Text style={styles.cap}>🎓</Text>
      <Text style={styles.hero}>🦸</Text>
      <Text style={styles.step}>{step}</Text>
      <Text style={styles.sub}>
        Level 6 mini challenge — imitation, sound, vowels, timing, syllables, voice!
      </Text>
      {sense.rewardState === 'GRADUATION' && (
        <Text style={styles.grad}>🎓 Hero graduation celebration!</Text>
      )}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${Math.round(sense.sequenceProgress * 100)}%` }]} />
      </View>
    </View>
  );
}

export function SpeechHeroGraduationGame({ onBack, onComplete }: Props) {
  const session = useSpeechReadinessSession('speech-hero-graduation', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakSpeechReadiness(
      'Speech hero graduation! You practiced so much — copy, sound, and celebrate!',
    );
  }, [canPlay, session.round]);

  return (
    <>
      <SpeechReadinessFrame
        title="Speech Hero Graduation"
        subtitle="Level 6 finale"
        skills="🎓 Oral • 🎵 Sound • 👄 Vowels • 🥁 Timing • 💬 Voice"
        gradient={['#EEF2FF', '#FEF3C7']}
        accent="#4F46E5"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        progressLabel="hero steps"
      >
        {(sense) => (
          <GraduationPlay
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
        graduation
      />
    </>
  );
}

const styles = StyleSheet.create({
  stage: { minHeight: 300, alignItems: 'center', paddingHorizontal: 12 },
  cap: { fontSize: 40 },
  hero: { fontSize: 72 },
  step: { fontSize: 19, fontWeight: '900', color: '#4338CA', marginTop: 8, textAlign: 'center' },
  sub: { fontSize: 14, color: '#4B5563', marginTop: 8, textAlign: 'center', lineHeight: 20 },
  grad: { fontSize: 20, fontWeight: '900', color: '#4F46E5', marginTop: 14 },
  progressBar: {
    marginTop: 16,
    width: '85%',
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#4F46E5' },
});
