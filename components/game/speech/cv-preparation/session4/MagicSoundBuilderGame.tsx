import {
  CVPreparationOverlays,
  CVPreparationShell,
  speakCVPreparation,
  useCVPreparationSession,
} from '@/components/game/speech/cv-preparation/shared/cvPreparationShared';
import { CORE_CV, PATTERN_EMOJI, PATTERN_SHORT } from '@/components/game/speech/cv-preparation/session4/cvPatternAssets';
import {
  Level6CameraLayer,
  Level6MirrorPreview,
  Level6StatusPill,
  useCVPatternAttempt,
} from '@/components/game/speech/cv-preparation/session4/useCVPatternAttempt';
import type { CVPreparationSessionManager } from '@/components/game/speech/cv-preparation/modules/CVPreparationSessionManager';
import type { CVPreparationSense } from '@/hooks/useCVPreparation';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

function BuilderPlay({
  sense,
  active,
  hits,
  setHits,
  manager,
  onRoundComplete,
}: {
  sense: CVPreparationSense;
  active: boolean;
  hits: number;
  setHits: React.Dispatch<React.SetStateAction<number>>;
  manager: CVPreparationSessionManager;
  onRoundComplete: () => void;
}) {
  const item = useMemo(
    () => CORE_CV[(hits + sense.imitationAttempts) % CORE_CV.length] ?? CORE_CV[0],
    [hits, sense.imitationAttempts],
  );
  const { tryPattern, mouth, target } = useCVPatternAttempt(
    sense,
    active,
    hits,
    setHits,
    manager,
    onRoundComplete,
    item.pattern,
  );

  return (
    <View style={styles.stage}>
      <Level6CameraLayer sense={mouth} active={active} />
      <Level6MirrorPreview sense={mouth} active={active} />
      <Level6StatusPill sense={mouth} target={target} accent="#059669" />
      <Text style={styles.sparkle}>✨</Text>
      <View style={styles.card}>
        <Text style={styles.emoji}>{PATTERN_EMOJI[item.pattern]}</Text>
        <Text style={styles.label}>{PATTERN_SHORT[item.pattern]}</Text>
        <Text style={styles.hint}>Mouth movement counts!</Text>
      </View>
      <Pressable style={styles.btn} onPress={tryPattern}>
        <Text style={styles.btnText}>I tried! ⭐</Text>
      </Pressable>
      {sense.rewardPulse && <Text style={styles.reward}>Sparkles!</Text>}
    </View>
  );
}

export function MagicSoundBuilderGame({ onBack, onComplete }: Props) {
  const session = useCVPreparationSession('magic-sound-builder', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakCVPreparation('Magic sound builder! Watch MA, PA, and BA. Copy any way you like.');
  }, [canPlay, session.round]);

  return (
    <>
      <CVPreparationShell
        gameId="magic-sound-builder"
        title="Magic Sound Builder"
        subtitle="MA, PA, BA readiness"
        skills="✨ CV patterns • 🗣️ Speech readiness"
        gradient={['#F0FDF4', '#E0E7FF']}
        accent="#059669"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Watch the pattern, then tap I tried!"
        startEmoji="✨"
      >
        {(sense) => (
          <BuilderPlay
            sense={sense}
            active={canPlay && !session.gameFinished}
            hits={hits}
            setHits={setHits}
            manager={session.manager}
            onRoundComplete={session.completeRound}
          />
        )}
      </CVPreparationShell>
      <CVPreparationOverlays
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
  stage: { minHeight: 340, alignItems: 'center', justifyContent: 'center' },
  sparkle: { fontSize: 36, marginBottom: 4 },
  card: {
    width: '88%',
    maxWidth: 340,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 3,
    borderColor: 'rgba(5,150,105,0.35)',
    alignItems: 'center',
    paddingVertical: 22,
  },
  emoji: { fontSize: 100 },
  label: { marginTop: 10, fontSize: 28, fontWeight: '900', color: '#047857' },
  hint: { marginTop: 8, fontSize: 14, fontWeight: '700', color: '#64748B' },
  btn: {
    marginTop: 16,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#059669',
  },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 17 },
  reward: { marginTop: 10, fontSize: 16, fontWeight: '900', color: '#059669' },
});
